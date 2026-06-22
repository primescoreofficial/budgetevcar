"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { geocodeCity, fetchChargingStations, getDistanceKm } from "@/lib/chargingApi";
import { MapPin, Navigation, Search, Info, AlertTriangle, Compass, RotateCcw } from "lucide-react";

// Dynamically import ChargingMap to completely avoid server-side rendering issues
const ChargingMap = dynamic(() => import("./ChargingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-3 animate-pulse">
      <Compass className="w-12 h-12 text-blue-500 animate-spin" />
      <span className="text-sm font-bold text-slate-500">Initializing Interactive Map...</span>
    </div>
  )
});

const POPULAR_INDIAN_CITIES = [
  "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", 
  "Pune", "Jaipur", "Udaipur", "Jalandhar", "Jamnagar", "Udupi", 
  "Lucknow", "Ahmedabad", "Surat", "Patna", "Bhopal", "Indore", 
  "Vadodara", "Kochi", "Coimbatore", "Nagpur", "Visakhapatnam", 
  "Chandigarh", "Amritsar", "Dehradun", "Shimla", "Guwahati", 
  "Bhubaneswar", "Ranchi", "Raipur", "Thiruvananthapuram", "Noida", 
  "Gurugram", "Faridabad", "Ghaziabad", "Kanpur", "Agra", "Varanasi", 
  "Agartala", "Imphal", "Shillong", "Aizawl", "Kohima"
];

export default function ChargingStationsClient() {
  const [cityInput, setCityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);
  const [mapCenter, setMapCenter] = useState([26.9124, 75.7873]); // Jaipur default center
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // Filters: "all", "fast"
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState("");

  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete suggestions fetching logic
  useEffect(() => {
    if (!cityInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Filter local popular cities
      const localMatches = POPULAR_INDIAN_CITIES.filter(c =>
        c.toLowerCase().includes(cityInput.toLowerCase())
      ).map(name => ({ name, source: "local" }));

      let remoteMatches = [];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&countrycodes=in&featuretype=settlement&limit=5`,
          { headers: { "User-Agent": "BudgetEV-Charging-Locator-App" } }
        );
        if (res.ok) {
          const data = await res.json();
          remoteMatches = data.map(item => ({
            name: item.display_name.split(",")[0] || item.name,
            fullName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            source: "nominatim"
          }));
        }
      } catch (e) {
        console.warn("Nominatim suggestion fetch failed:", e);
      }

      // Merge local & remote lists, prioritising local and checking duplicates
      const seen = new Set();
      const merged = [];

      localMatches.forEach(item => {
        seen.add(item.name.toLowerCase());
        merged.push(item);
      });

      remoteMatches.forEach(item => {
        if (!seen.has(item.name.toLowerCase())) {
          seen.add(item.name.toLowerCase());
          merged.push(item);
        }
      });

      setSuggestions(merged);
    }, 250); // Debounce duration

    return () => clearTimeout(timer);
  }, [cityInput]);

  const selectSuggestion = async (suggestion) => {
    setCityInput(suggestion.name);
    setShowDropdown(false);
    setLoading(true);
    setError(null);
    setSelectedStation(null);

    if (suggestion.lat && suggestion.lon) {
      setMapCenter([suggestion.lat, suggestion.lon]);
      setSearchFeedback(`Showing results for "${suggestion.fullName || suggestion.name}"`);
      try {
        const results = await fetchChargingStations(suggestion.lat, suggestion.lon);
        setStations(results);
      } catch (err) {
        setError("Unable to retrieve charging station data.");
      } finally {
        setLoading(false);
      }
    } else {
      await handleSearch(suggestion.name);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch(cityInput);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
        selectSuggestion(suggestions[focusedSuggestionIndex]);
      } else {
        handleSearch(cityInput);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/find-ev", label: "Find EV" },
    { href: "/compare", label: "Compare" },
    { href: "/charging-stations", label: "Charging Stations", active: true },
  ];

  // Default setup - Fetch Jaipur stations initially
  useEffect(() => {
    handleSearch("Jaipur", true);
  }, []);

  const handleSearch = async (queryStr, isInitial = false) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    setError(null);
    setSearchFeedback("");
    setSelectedStation(null);

    try {
      const coords = await geocodeCity(queryStr);
      setMapCenter([coords.lat, coords.lon]);
      if (!isInitial) {
        setSearchFeedback(`Showing results for "${coords.displayName}"`);
      }

      const results = await fetchChargingStations(coords.lat, coords.lon);
      setStations(results);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve charging station data. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedStation(null);
    setSearchFeedback("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setUserLocation({ lat, lon });
        setMapCenter([lat, lon]);
        setSearchFeedback("📍 Showing nearest charging stations based on your location");

        try {
          const results = await fetchChargingStations(lat, lon);
          // Recalculate and sort precisely by distance from user location
          const sorted = results.map(st => ({
            ...st,
            distance: getDistanceKm(lat, lon, st.latitude, st.longitude)
          })).sort((a, b) => a.distance - b.distance);

          setStations(sorted);
        } catch (err) {
          setError("Failed to fetch charging stations for your location.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission denied. Please search by city name instead.");
        } else {
          setError("Unable to retrieve your location. Try searching for a city.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setMapCenter([station.latitude, station.longitude]);

    // Scroll details card into view on mobile
    if (window.innerWidth < 1024) {
      const el = document.getElementById(`station-card-${station.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  // Filter stations by type if "fast" is selected
  const filteredStations = useMemo(() => {
    if (activeTab === "fast") {
      return stations.filter(st =>
        st.chargerTypes.some(type =>
          type.toLowerCase().includes("fast") || type.toLowerCase().includes("kw") && parseFloat(type.match(/\d+/)?.[0]) >= 30
        )
      );
    }
    return stations;
  }, [stations, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ── HEADER ── */}
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm shadow-slate-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-12">
            <Link href="/" className="text-xl sm:text-2xl font-black text-[#1e3a8a] tracking-tight hover:opacity-90 transition">BudgetEV</Link>
            
            <nav className="hidden md:flex items-center space-x-8 text-[14px] font-bold text-slate-500">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.active
                      ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1"
                      : "hover:text-slate-900 transition"
                  }
                >
                  {link.label}
                </Link>
              ))}

              {/* Tools Dropdown */}
              <div className="relative group py-2">
                <button className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer text-slate-600 font-medium">
                  <span>Tools</span>
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 hidden group-hover:block z-50">
                  <Link href="/tools/ev-emi-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV EMI Calculator
                  </Link>
                  <Link href="/tools/ev-running-cost-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV Running Cost Calculator
                  </Link>
                  <Link href="/tools/ev-savings-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV Savings Calculator
                  </Link>
                  <Link href="/tools/ev-charging-time-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV Charging Time Calculator
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/find-ev"
              className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm shadow-blue-900/10"
            >
              Find my EV
            </Link>
            
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 pb-6 pt-3 absolute left-0 right-0 z-40"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${link.active
                        ? "bg-blue-50 text-[#1e3a8a]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a]"
                      }`}
                  >
                    <span>{link.label}</span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}

                {/* Tools accordion */}
                <div>
                  <button
                    onClick={() => setToolsOpen(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                  >
                    <span>Tools</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {toolsOpen && (
                    <div className="pl-4 pr-2 flex flex-col gap-1 mt-1 border-l-2 border-slate-100">
                      <Link
                        href="/tools/ev-emi-calculator"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        EV EMI Calculator
                      </Link>
                      <Link
                        href="/tools/ev-running-cost-calculator"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        EV Running Cost Calculator
                      </Link>
                      <Link
                        href="/tools/ev-savings-calculator"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        EV Savings Calculator
                      </Link>
                      <Link
                        href="/tools/ev-charging-time-calculator"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        EV Charging Time Calculator
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── COMPACT UTILITY HEADER ── */}
      <div className="bg-white border-b border-slate-200/60 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">EV Charging Stations</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Locate nearby charging stations, explore charger types, and navigate instantly.</p>
          </div>

          {/* Search Controls */}
          <div ref={wrapperRef} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto relative">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setShowDropdown(true);
                  setFocusedSuggestionIndex(-1);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search City (e.g. Delhi,Mumbai...)"
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-450 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition text-xs font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />

              {/* Autocomplete Dropdown List */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`px-4 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                        index === focusedSuggestionIndex
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span>{suggestion.name}</span>
                      {suggestion.source === "local" ? (
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Popular</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded">OSM</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  handleSearch(cityInput);
                }}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer active:scale-95 duration-100"
              >
                Search
              </button>

              <button
                onClick={handleUseLocation}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer active:scale-95 duration-100"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Use My Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH FEEDBACK AND FILTERS ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/50">
        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
          <Info className="w-4 h-4 text-blue-500" />
          <span>{searchFeedback || `Showing stations near center`}</span>
        </div>

        {/* Charger Speed Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            All Stations ({stations.length})
          </button>
          <button
            onClick={() => setActiveTab("fast")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "fast" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Fast Chargers Only
          </button>
        </div>
      </div>

      {/* ── MAIN MAP & LISTING CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-stretch min-h-[500px]">
        
        {/* Map Container - LEFT (Desktop), TOP (Mobile) */}
        <div className="w-full flex-shrink-0 h-[350px] sm:h-[400px] lg:h-auto lg:flex-1 lg:min-h-[550px] rounded-2xl overflow-hidden shadow-md">
          <ChargingMap
            stations={filteredStations}
            center={mapCenter}
            userLocation={userLocation}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
          />
        </div>

        {/* Station Info List Panel - RIGHT (Desktop), BOTTOM (Mobile) */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col max-h-[600px] lg:max-h-[700px] bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          
          <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Charging Points</h3>
            {filteredStations.length > 0 && (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {filteredStations.length} found
              </span>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
              // Loading Skeleton State
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-slate-200 rounded-lg w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded-lg w-1/2"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Error State / Empty State
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <AlertTriangle className="w-10 h-10 text-orange-500 mb-3" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">{error}</h4>
                <p className="text-xs text-slate-500 max-w-[250px] leading-relaxed mb-4">Try searching another nearby city or reset coordinates.</p>
                <button
                  onClick={() => handleSearch("Jaipur")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Jaipur</span>
                </button>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 py-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 mx-auto">
                  <MapPin className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 mb-1 leading-snug">
                  No EV charging stations found in this area from our live data.
                </h4>
                <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mb-5 mx-auto">
                  You can still explore stations using Google Maps.
                </p>
                <a
                  href={`https://www.google.com/maps/search/EV+Charging+Station+in+${encodeURIComponent(cityInput || "India")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-6 rounded-xl text-xs transition shadow-md hover:shadow-blue-500/10 active:scale-95 duration-100"
                >
                  Search on Google Maps
                </a>
              </div>
            ) : (
              // List Cards
              filteredStations.map((station) => {
                const isSelected = selectedStation?.id === station.id;
                return (
                  <motion.div
                    key={station.id}
                    id={`station-card-${station.id}`}
                    layout
                    onClick={() => handleSelectStation(station)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/20 shadow-md ring-1 ring-orange-400/20"
                        : "border-slate-100 hover:border-blue-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition">
                        {station.name}
                      </h4>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                        {station.operator}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-snug mb-3">{station.address}</p>

                    {/* Charger Info */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {station.chargerTypes.map((type, idx) => {
                        const isFast = type.toLowerCase().includes("fast") || type.includes("60kW") || type.includes("120kW") || type.includes("150kW");
                        return (
                          <span
                            key={idx}
                            className={`text-[9px] font-bold px-2 py-1 rounded-md border ${
                              isFast
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100/60"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}
                          >
                            {type}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100/60 text-xs">
                      <span className="text-[11px] text-slate-400 font-bold">
                        {station.distance !== undefined ? `📍 ${station.distance} km away` : `🔌 ${station.points} charging points`}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStation(station);
                          }}
                          className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          View on Map
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Navigate</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer brands={[]} bodyTypes={[]} />
    </div>
  );
}
