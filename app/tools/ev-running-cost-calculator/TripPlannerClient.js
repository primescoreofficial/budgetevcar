"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Share2, 
  MapPin, 
  Navigation, 
  Search, 
  Info, 
  AlertTriangle, 
  Compass, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Fuel,
  Battery,
  Shield,
  Leaf,
  Layers,
  ChevronRight,
  Gauge
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { fetchChargingStations, getDistanceKm } from "@/lib/chargingApi";

// Dynamically import Leaflet Map to avoid Next.js SSR hydration errors
const PlannerMap = dynamic(() => import("./PlannerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-3 animate-pulse rounded-2xl border border-slate-200 min-h-[350px]">
      <Compass className="w-12 h-12 text-[#0249ad] animate-spin" />
      <span className="text-sm font-bold text-slate-500">Initializing Navigation System...</span>
    </div>
  )
});

// helper to map local/pre-computed specs
function getCarSpecs(car) {
  if (!car) return { minPrice: 0, maxPrice: 0, rangeKm: 300, chargeTime: '', chargeMinutes: 45 };
  const model = (car.model_name || '').toLowerCase();
  const detailed = (car.detailed_name || '').toLowerCase();

  let minPrice = 7.99;
  let maxPrice = 11.89;
  let rangeKm = 315;
  let chargeTime = "58 min";
  let chargeMinutes = 58;

  if (model.includes('tiago')) {
    minPrice = 7.99;
    maxPrice = 11.89;
    rangeKm = detailed.includes('medium') ? 250 : 315;
    chargeTime = "58 min";
    chargeMinutes = 58;
  } else if (model.includes('comet')) {
    minPrice = 6.99;
    maxPrice = 9.24;
    rangeKm = 230;
    chargeTime = "7 hrs";
    chargeMinutes = 420;
  } else if (model.includes('ec3') || detailed.includes('ec3')) {
    minPrice = 11.61;
    maxPrice = 13.41;
    rangeKm = 320;
    chargeTime = "57 min";
    chargeMinutes = 57;
  } else if (model.includes('punch')) {
    minPrice = 10.99;
    maxPrice = 15.49;
    rangeKm = detailed.includes('long') ? 421 : 315;
    chargeTime = "56 min";
    chargeMinutes = 56;
  } else if (model.includes('xuv400') || model.includes('xuv 400')) {
    minPrice = 15.49;
    maxPrice = 18.89;
    rangeKm = 456;
    chargeTime = "50 min";
    chargeMinutes = 50;
  } else if (model.includes('zs')) {
    minPrice = 18.98;
    maxPrice = 25.20;
    rangeKm = 461;
    chargeTime = "60 min";
    chargeMinutes = 60;
  } else if (model.includes('windsor')) {
    minPrice = 13.49;
    maxPrice = 15.49;
    rangeKm = 331;
    chargeTime = "40 min";
    chargeMinutes = 40;
  } else if (model.includes('nexon')) {
    minPrice = 12.49;
    maxPrice = 16.29;
    rangeKm = detailed.includes('long') ? 465 : 325;
    chargeTime = "56 min";
    chargeMinutes = 56;
  } else if (model.includes('tigor')) {
    minPrice = 12.49;
    maxPrice = 13.75;
    rangeKm = 315;
    chargeTime = "59 min";
    chargeMinutes = 59;
  } else if (model.includes('curvv')) {
    minPrice = 17.49;
    maxPrice = 21.99;
    rangeKm = 502;
    chargeTime = "40 min";
    chargeMinutes = 40;
  } else if (model.includes('atto')) {
    minPrice = 24.99;
    maxPrice = 33.99;
    rangeKm = 521;
    chargeTime = "50 min";
    chargeMinutes = 50;
  } else if (model.includes('seal')) {
    minPrice = 41.00;
    maxPrice = 53.00;
    rangeKm = 650;
    chargeTime = "45 min";
    chargeMinutes = 45;
  } else if (model.includes('ioniq')) {
    minPrice = 46.05;
    maxPrice = 46.05;
    rangeKm = 631;
    chargeTime = "18 min";
    chargeMinutes = 18;
  } else if (model.includes('ev6')) {
    minPrice = 60.95;
    maxPrice = 65.95;
    rangeKm = 708;
    chargeTime = "18 min";
    chargeMinutes = 18;
  } else if (model.includes('ev9')) {
    minPrice = 129.90;
    maxPrice = 129.90;
    rangeKm = 561;
    chargeTime = "24 min";
    chargeMinutes = 24;
  } else {
    const battery = parseFloat(car.battery_capacity) || 30;
    minPrice = Math.round(battery * 0.4 + 4);
    maxPrice = Math.round(battery * 0.45 + 5);
    rangeKm = Math.round(battery * 7.5);
    chargeMinutes = battery > 50 ? 40 : 60;
    chargeTime = `${chargeMinutes} min`;
  }

  return { minPrice, maxPrice, rangeKm, chargeTime, chargeMinutes };
}

export default function TripPlannerClient({ cars }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected vehicle & manual configuration overrides
  const [selectedCarId, setSelectedCarId] = useState("");
  const [electricityRate, setElectricityRate] = useState(8);
  const [petrolPrice, setPetrolPrice] = useState(100);
  const [petrolMileage, setPetrolMileage] = useState(15);

  // Custom EV spec overrides
  const [customBattery, setCustomBattery] = useState("");
  const [customRange, setCustomRange] = useState("");

  // Location inputs and autocomplete states
  const [startInput, setStartInput] = useState("");
  const [destInput, setDestInput] = useState("");
  
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Route metadata
  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationSec, polylineCoords, alternatives: [] }
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const startRef = useRef(null);
  const destRef = useRef(null);

  // Selected vehicle details resolved
  const selectedCar = useMemo(() => {
    return cars.find(c => String(c.serial_no) === selectedCarId) || null;
  }, [selectedCarId, cars]);

  const carSpecs = useMemo(() => {
    if (!selectedCar) {
      return {
        battery: 40,
        claimedRange: 300,
        realRange: 255,
        efficiency: 7.5
      };
    }
    const specs = getCarSpecs(selectedCar);
    const battery = customBattery ? parseFloat(customBattery) : (parseFloat(selectedCar.battery_capacity) || 40);
    const claimedRange = customRange ? parseFloat(customRange) : specs.rangeKm;
    const realRange = selectedCar.real_world_range ? parseFloat(selectedCar.real_world_range) : claimedRange * 0.85;
    
    // efficiency = range / batteryCapacity
    const efficiency = battery > 0 ? (claimedRange / battery) : 7.0;

    return {
      battery,
      claimedRange,
      realRange,
      efficiency
    };
  }, [selectedCar, customBattery, customRange]);

  // Click outside to close suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (startRef.current && !startRef.current.contains(event.target)) {
        setShowStartDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse shareable URLs query parameters on mount
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const carId = searchParams.get("car");
    const rate = searchParams.get("rate");

    if (rate) setElectricityRate(Number(rate));
    if (carId) setSelectedCarId(carId);

    if (from && to) {
      setStartInput(from);
      setDestInput(to);
      geocodeAndRoute(from, to, carId);
    } else {
      // Pick first car as default if none selected
      if (cars.length > 0) {
        setSelectedCarId(String(cars[0].serial_no));
      }
    }
  }, [searchParams, cars]);

  // Autocomplete Suggestions - Start Location
  useEffect(() => {
    if (!startInput.trim()) {
      setStartSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startInput)}&countrycodes=in&featuretype=settlement&limit=5`,
          { headers: { "User-Agent": "BudgetEV-Trip-Planner" } }
        );
        if (res.ok) {
          const data = await res.json();
          setStartSuggestions(data.map(item => ({
            name: item.display_name.split(",")[0] || item.name,
            fullName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          })));
        }
      } catch (e) {
        console.warn("Start Autocomplete failed", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [startInput]);

  // Autocomplete Suggestions - Destination
  useEffect(() => {
    if (!destInput.trim()) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destInput)}&countrycodes=in&featuretype=settlement&limit=5`,
          { headers: { "User-Agent": "BudgetEV-Trip-Planner" } }
        );
        if (res.ok) {
          const data = await res.json();
          setDestSuggestions(data.map(item => ({
            name: item.display_name.split(",")[0] || item.name,
            fullName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          })));
        }
      } catch (e) {
        console.warn("Destination Autocomplete failed", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destInput]);

  // Resolve geocoding and fetch route
  const geocodeAndRoute = async (fromVal, toVal, carIdVal) => {
    setLoading(true);
    setError(null);
    setRouteInfo(null);
    setStations([]);
    setSelectedStation(null);

    try {
      // Step 1: Geocoding Start
      setLoadingStep("Locating Start position...");
      const startRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromVal)}&countrycodes=in&limit=1`,
        { headers: { "User-Agent": "BudgetEV-Trip-Planner" } }
      );
      if (!startRes.ok) throw new Error("Could not find start location coordinates.");
      const startData = await startRes.json();
      if (!startData || startData.length === 0) throw new Error(`Could not find location "${fromVal}"`);
      const sCoords = [parseFloat(startData[0].lat), parseFloat(startData[0].lon)];
      setStartCoords(sCoords);

      // Step 2: Geocoding Destination
      setLoadingStep("Locating Destination position...");
      const destRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toVal)}&countrycodes=in&limit=1`,
        { headers: { "User-Agent": "BudgetEV-Trip-Planner" } }
      );
      if (!destRes.ok) throw new Error("Could not find destination location coordinates.");
      const destData = await destRes.json();
      if (!destData || destData.length === 0) throw new Error(`Could not find location "${toVal}"`);
      const dCoords = [parseFloat(destData[0].lat), parseFloat(destData[0].lon)];
      setDestCoords(dCoords);

      // Step 3: Fetch Route from OSRM
      setLoadingStep("Calculating Route...");
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sCoords[1]},${sCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson&alternatives=true`;
      const routeRes = await fetch(osrmUrl);
      if (!routeRes.ok) throw new Error("Navigation service is temporarily unavailable.");
      const routeData = await routeRes.json();

      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error("No route options found between these points.");
      }

      // Format routes list
      const formattedRoutes = routeData.routes.map((rt) => {
        const polyCoords = rt.geometry.coordinates.map(pt => [pt[1], pt[0]]);
        return {
          distanceKm: Math.round(rt.distance / 100) / 10,
          durationSec: rt.duration,
          polylineCoords: polyCoords
        };
      });

      setRouteInfo(formattedRoutes);
      setActiveRouteIndex(0);

      // Step 4: Sample route geometry to find charging stations along path
      setLoadingStep("Finding Charging Stations...");
      const mainRouteCoords = formattedRoutes[0].polylineCoords;
      await fetchStationsAlongRoute(mainRouteCoords);

    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected navigation error occurred.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Fetch stations along path by sampling the polyline
  const fetchChargingStationsForCoords = async (lat, lon) => {
    try {
      return await fetchChargingStations(lat, lon);
    } catch {
      return [];
    }
  };

  const fetchStationsAlongRoute = async (polylineCoords) => {
    if (!polylineCoords || polylineCoords.length === 0) return;

    // Sample polyline coordinates at regular intervals (approx every 75km)
    // First, midpoint, and last are guaranteed. For longer trips, we sample intermediate.
    const numPoints = polylineCoords.length;
    const samplePoints = [];
    
    // Always include start and destination
    samplePoints.push(polylineCoords[0]);
    
    const stepSize = Math.max(10, Math.floor(numPoints / 8)); // sample up to 8 points
    for (let i = stepSize; i < numPoints - stepSize; i += stepSize) {
      samplePoints.push(polylineCoords[i]);
    }
    
    samplePoints.push(polylineCoords[numPoints - 1]);

    // Fetch stations concurrently
    const stationPromises = samplePoints.map(([lat, lon]) => fetchChargingStationsForCoords(lat, lon));
    const results = await Promise.all(stationPromises);
    
    // Merge, deduplicate by ID, and filter stations near route
    const merged = [];
    const seen = new Set();

    results.forEach((cityStations) => {
      cityStations.forEach((st) => {
        if (!seen.has(st.id)) {
          seen.add(st.id);
          merged.push(st);
        }
      });
    });

    // Calculate distance from route geometry for each station to verify they are close
    const finalStations = merged.map((st) => {
      // Find minimum distance from station to any polyline point
      let minDistance = 9999;
      for (let i = 0; i < polylineCoords.length; i += Math.max(1, Math.floor(polylineCoords.length / 50))) {
        const dist = getDistanceKm(st.latitude, st.longitude, polylineCoords[i][0], polylineCoords[i][1]);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
      return {
        ...st,
        distanceFromRoute: Math.round(minDistance * 10) / 10
      };
    })
    .filter(st => st.distanceFromRoute <= 25) // Keep stations within 25km of the route
    .sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);

    setStations(finalStations);
  };

  // Switch active route (alternative routes)
  const handleRouteSwitch = async (index) => {
    setActiveRouteIndex(index);
    if (routeInfo && routeInfo[index]) {
      setLoading(true);
      setLoadingStep("Optimizing EV Trip...");
      await fetchStationsAlongRoute(routeInfo[index].polylineCoords);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!startInput.trim() || !destInput.trim()) {
      setError("Please enter both Start and Destination locations.");
      return;
    }
    geocodeAndRoute(startInput, destInput, selectedCarId);
  };

  const syncUrlParams = () => {
    if (!startInput || !destInput) return;
    const url = `${window.location.origin}/tools/ev-running-cost-calculator?from=${encodeURIComponent(startInput)}&to=${encodeURIComponent(destInput)}&car=${selectedCarId}&rate=${electricityRate}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // Calculations for current active route
  const currentRoute = routeInfo ? routeInfo[activeRouteIndex] : null;
  const tripDistance = currentRoute ? currentRoute.distanceKm : 0;
  const tripDuration = currentRoute ? currentRoute.durationSec : 0;

  // Energy consumption calculations
  const energyRequiredKwh = tripDistance > 0 ? (tripDistance / carSpecs.efficiency) : 0;
  const evTravelCost = energyRequiredKwh * electricityRate;
  const evCostPerKm = tripDistance > 0 ? (evTravelCost / tripDistance) : 0;

  // Charging Stops Logic with 10% Reserve
  const usableRange = carSpecs.realRange * 0.9;
  const stopsRequired = tripDistance > 0 ? Math.max(0, Math.ceil(tripDistance / usableRange) - 1) : 0;
  
  // Remaining battery at destination
  const remainingBatteryPercent = useMemo(() => {
    if (tripDistance <= 0) return 100;
    if (stopsRequired === 0) {
      const fraction = tripDistance / carSpecs.realRange;
      return Math.max(0, Math.round((1 - fraction) * 100));
    } else {
      // recharged to 80% at last stop
      const lastLegDist = tripDistance % usableRange || usableRange;
      const fraction = lastLegDist / carSpecs.realRange;
      return Math.max(0, Math.round((0.8 - fraction) * 100));
    }
  }, [tripDistance, stopsRequired, usableRange, carSpecs.realRange]);

  const chargingDurationMin = stopsRequired * 45; // 45 mins average per charging stop

  // Petrol comparison calculations
  const petrolTripCost = petrolMileage > 0 ? ((tripDistance / petrolMileage) * petrolPrice) : 0;
  const moneySaved = Math.max(0, petrolTripCost - evTravelCost);

  // CO₂ Savings: Petrol cars produce approx 120g/km tailpipe emissions
  const co2SavedKg = Math.round(tripDistance * 0.120);

  // Battery Timeline Generation
  const batteryTimeline = useMemo(() => {
    if (tripDistance <= 0) return [];
    
    const timeline = [];
    timeline.push({
      type: "start",
      label: startInput.split(",")[0] || "Start Location",
      battery: 100,
      distance: 0,
      description: "Batteries fully charged. Setting off."
    });

    let accumulatedDist = 0;
    for (let i = 0; i < stopsRequired; i++) {
      accumulatedDist += usableRange;
      timeline.push({
        type: "drive",
        label: `Driving Segment ${i + 1}`,
        battery: 10,
        distance: Math.round(accumulatedDist),
        description: `Drive ${Math.round(usableRange)} km. Battery drops to 10% reserve.`
      });
      timeline.push({
        type: "charge",
        label: `⚡ Fast Charge Stop ${i + 1}`,
        battery: 80,
        distance: Math.round(accumulatedDist),
        description: "Recharge battery to 80% for optimized highway speeds."
      });
    }

    // final segment
    const lastLegDist = tripDistance - accumulatedDist;
    timeline.push({
      type: "destination",
      label: destInput.split(",")[0] || "Destination",
      battery: remainingBatteryPercent,
      distance: Math.round(tripDistance),
      description: `Drive final ${Math.round(lastLegDist)} km. Arrive with ${remainingBatteryPercent}% battery.`
    });

    return timeline;
  }, [tripDistance, stopsRequired, usableRange, remainingBatteryPercent, startInput, destInput]);

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.round((sec % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };



  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      {/* ── BREADCRUMBS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-[#0249ad] transition">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[#0249ad] transition">Tools</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">EV Trip Planner</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 w-full flex-1">
        {/* Page title header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0249ad] text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-1.5 rounded-full mb-4 border border-blue-100/60 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-650" />
            <span>Interactive Route Planner</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV Trip Planner with Maps</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl leading-relaxed">
            Plan your electric car route across India, estimate battery range performance, locate chargers along your specific route, and compute travel savings against a petrol car.
          </p>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:underline text-slate-400 text-[10px]">Dismiss</button>
          </div>
        )}

        {/* Main Grid config & planner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONFIGURATION INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. ROUTE INPUT CARD */}
            <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#0249ad]" />
                <span>1. Route Planning</span>
              </h2>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {/* Start Location Input */}
                <div ref={startRef} className="space-y-1.5 relative">
                  <label htmlFor="start-loc" className="text-xs font-bold text-slate-600">Start Location</label>
                  <div className="relative">
                    <input
                      id="start-loc"
                      type="text"
                      value={startInput}
                      onChange={(e) => { setStartInput(e.target.value); setShowStartDropdown(true); }}
                      onFocus={() => setShowStartDropdown(true)}
                      placeholder="Enter starting city (e.g. Jaipur)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs font-semibold focus:outline-none focus:border-[#0249ad] focus:bg-white transition"
                    />
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  </div>

                  {showStartDropdown && startSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {startSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setStartInput(item.name);
                            setShowStartDropdown(false);
                          }}
                          className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {item.fullName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination Location Input */}
                <div ref={destRef} className="space-y-1.5 relative">
                  <label htmlFor="dest-loc" className="text-xs font-bold text-slate-600">Destination</label>
                  <div className="relative">
                    <input
                      id="dest-loc"
                      type="text"
                      value={destInput}
                      onChange={(e) => { setDestInput(e.target.value); setShowDestDropdown(true); }}
                      onFocus={() => setShowDestDropdown(true)}
                      placeholder="Enter destination city (e.g. Delhi)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs font-semibold focus:outline-none focus:border-[#0249ad] focus:bg-white transition"
                    />
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  </div>

                  {showDestDropdown && destSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {destSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDestInput(item.name);
                            setShowDestDropdown(false);
                          }}
                          className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {item.fullName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0249ad] hover:bg-blue-800 text-white font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase transition shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 duration-75 text-center"
                  >
                    Calculate Route
                  </button>
                  {routeInfo && (
                    <button
                      type="button"
                      onClick={syncUrlParams}
                      title="Copy Shareable Link"
                      className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-[#0249ad] px-4 rounded-xl transition cursor-pointer flex items-center justify-center"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 2. EV DATABASE VEHICLE SELECTOR CARD */}
            <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Battery className="w-4 h-4 text-[#0249ad]" />
                <span>2. Select Vehicle</span>
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="vehicle-select" className="text-xs font-bold text-slate-655">Choose EV Model</label>
                  <div className="relative">
                    <select
                      id="vehicle-select"
                      value={selectedCarId}
                      onChange={(e) => {
                        setSelectedCarId(e.target.value);
                        setCustomBattery("");
                        setCustomRange("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-[#0249ad] focus:bg-white transition cursor-pointer"
                    >
                      {cars.map((car) => (
                        <option key={car.serial_no} value={String(car.serial_no)}>
                          {car.brand} - {car.model_name || car.detailed_name} {car.variant_name ? `(${car.variant_name})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {selectedCar && (
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600 space-y-2 border border-slate-100">
                    <div className="flex justify-between">
                      <span>Battery Capacity:</span>
                      <span className="font-extrabold text-slate-800">{carSpecs.battery} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Claimed Range (MIDC):</span>
                      <span className="font-extrabold text-slate-800">{carSpecs.claimedRange} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Real World Range (Est.):</span>
                      <span className="font-extrabold text-slate-800">{Math.round(carSpecs.realRange)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated Efficiency:</span>
                      <span className="font-extrabold text-[#0249ad]">{carSpecs.efficiency.toFixed(2)} km/kWh</span>
                    </div>
                  </div>
                )}

                {/* Overrides / Custom Specifications */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-3">Optional Override Specs</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="custom-bat" className="text-[10px] font-bold text-slate-600">Custom Battery (kWh)</label>
                      <input
                        id="custom-bat"
                        type="number"
                        placeholder="e.g. 50"
                        value={customBattery}
                        onChange={(e) => setCustomBattery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0249ad]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="custom-rng" className="text-[10px] font-bold text-slate-600">Custom Range (km)</label>
                      <input
                        id="custom-rng"
                        type="number"
                        placeholder="e.g. 350"
                        value={customRange}
                        onChange={(e) => setCustomRange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0249ad]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COST & PRICE CONFIGURATION CARD */}
            <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0249ad]" />
                <span>3. Cost Parameters</span>
              </h2>

              <div className="space-y-5">
                {/* Electricity tariff rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <label htmlFor="rate-input">Electricity Rate (₹/kWh)</label>
                    <input
                      id="rate-input"
                      type="number"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-200 text-slate-900 px-2 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                    />
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                    aria-label="Electricity rate slider"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-500" />
                    <span>Petrol Vehicle Benchmarks</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Petrol fuel price */}
                    <div className="space-y-1.5">
                      <label htmlFor="petrol-price" className="text-[11px] font-bold text-slate-500">Petrol Price (₹/L)</label>
                      <input
                        id="petrol-price"
                        type="number"
                        value={petrolPrice}
                        onChange={(e) => setPetrolPrice(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                      />
                    </div>
                    {/* Petrol mileage */}
                    <div className="space-y-1.5">
                      <label htmlFor="petrol-mileage" className="text-[11px] font-bold text-slate-500">Petrol Mileage (km/L)</label>
                      <input
                        id="petrol-mileage"
                        type="number"
                        value={petrolMileage}
                        onChange={(e) => setPetrolMileage(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE MAP & DASHBOARD CARDS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* MAP & ROUTE SELECTION */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm relative">
              {routeInfo && routeInfo.length > 1 && (
                <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-100 gap-1 text-[11px] font-extrabold">
                  {routeInfo.map((rt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRouteSwitch(idx)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        activeRouteIndex === idx 
                          ? "bg-[#0249ad] text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {idx === 0 ? "Fastest Route" : `Alt Route ${idx}`} ({rt.distanceKm} km)
                    </button>
                  ))}
                </div>
              )}

              {/* Loader overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 text-center p-6">
                  <Compass className="w-12 h-12 text-[#0249ad] animate-spin" />
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-slate-950">{loadingStep}</p>
                    <p className="text-xs text-slate-400">Fetching geocodes and compiling mapping coordinates...</p>
                  </div>
                </div>
              )}

              {/* Map rendering */}
              <div className="w-full h-[350px] md:h-[480px]">
                <PlannerMap
                  startCoords={startCoords}
                  destCoords={destCoords}
                  routeGeometry={currentRoute?.polylineCoords || null}
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => {
                    setSelectedStation(st);
                    // pan center handled
                  }}
                />
              </div>
            </div>

            {/* TRIP CALCULATOR DASHBOARD MATRIX */}
            {currentRoute ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                
                {/* DEDICATED PREMIUM MONEY SAVED CARD */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                    <Sparkles className="w-48 h-48" />
                  </div>
                  
                  <div className="space-y-1.5 z-10">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded border border-white/10">Money Saved with EV</span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">₹{Math.round(moneySaved).toLocaleString('en-IN')} Saved</h3>
                    <p className="text-slate-100 text-xs font-semibold opacity-90 max-w-sm">
                      Swapping this trip to EV costs only ₹{Math.round(evTravelCost)} compared to ₹{Math.round(petrolTripCost)} in petrol.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 self-start sm:self-center shrink-0">
                    <Leaf className="w-6 h-6 text-emerald-350 shrink-0" />
                    <div>
                      <h4 className="text-base font-black">{co2SavedKg} kg</h4>
                      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">CO₂ Emissions Saved</p>
                    </div>
                  </div>
                </div>

                {/* METRICS DASHBOARD CARDS MATRIX */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Distance */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Distance</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-baseline gap-1">
                      {tripDistance} <span className="text-xs font-bold text-slate-400">km</span>
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Route driving length</p>
                  </div>

                  {/* Travel Time */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Travel Duration</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-baseline gap-1">
                      {formatDuration(tripDuration)}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Estimated driving time</p>
                  </div>

                  {/* Energy Required */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Energy Required</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-baseline gap-1">
                      {energyRequiredKwh.toFixed(1)} <span className="text-xs font-bold text-slate-400">kWh</span>
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Approx. grid electricity units</p>
                  </div>

                  {/* EV Cost */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">EV Travel Cost</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-[#0249ad] tracking-tight mt-1">
                      ₹{Math.round(evTravelCost).toLocaleString('en-IN')}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">₹{evCostPerKm.toFixed(2)} / km cost</p>
                  </div>

                  {/* Charging Stops */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Charging Stops</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                      {stopsRequired} {stopsRequired === 1 ? 'Stop' : 'Stops'}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">~{chargingDurationMin} mins charge time</p>
                  </div>

                  {/* Remaining battery */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Battery at Destination</p>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                      {remainingBatteryPercent}%
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">With 10% safety buffer</p>
                  </div>
                </div>

                {/* CHARGING STATIONS LIST ALONG ROUTE */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
                    <span>Charging Stations Near Route ({stations.length})</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Within 25km radius</span>
                  </h3>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                    {stations.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl">
                        No public charging stations resolved within 25km of the sampled segments.
                      </div>
                    ) : (
                      stations.map((station) => {
                        const isSelected = selectedStation?.id === station.id;
                        return (
                          <div
                            key={station.id}
                            onClick={() => {
                              setSelectedStation(station);
                              // Pan handled by Map controller
                            }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-orange-500 bg-orange-50/10 shadow-sm"
                                : "border-slate-100 hover:border-blue-200"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-extrabold text-slate-900">{station.name}</h4>
                              <span className="text-[8px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0 uppercase tracking-wider">
                                {station.operator}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{station.address}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {station.chargerTypes.map((type, idx) => (
                                <span key={idx} className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200/50 rounded text-slate-600">
                                  {type}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100/60 text-[10px] text-slate-400 font-bold">
                              <span>📍 {station.distanceFromRoute} km from route polyline</span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#0249ad] hover:underline"
                              >
                                Open Directions →
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* BATTERY timeline VISUALIZATION CARD */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-6">Visual Battery timeline</h3>
                  
                  <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
                    {batteryTimeline.map((item, idx) => {
                      const isStart = item.type === "start";
                      const isDest = item.type === "destination";
                      const isCharge = item.type === "charge";
                      const isDrive = item.type === "drive";

                      return (
                        <div key={idx} className="relative">
                          {/* Left dot icon */}
                          <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-white font-extrabold ${
                            isStart ? "bg-emerald-600" :
                            isDest ? "bg-red-650" :
                            isCharge ? "bg-orange-500" :
                            "bg-blue-600"
                          }`}>
                            {isStart ? "S" :
                             isDest ? "D" :
                             isCharge ? "⚡" :
                             "↓"}
                          </div>

                          <div>
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="text-xs font-black text-slate-950">{item.label}</h4>
                              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                item.battery >= 60 ? "bg-emerald-50 text-emerald-700" :
                                item.battery >= 25 ? "bg-blue-50 text-blue-700" :
                                "bg-red-50 text-red-700"
                              }`}>
                                {item.battery}% Battery
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                              {item.description}
                            </p>
                            {item.distance !== undefined && (
                              <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                Segment point: {item.distance} km
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            ) : (
              // EMPTY STATE ILLUSTRATION
              <div className="bg-white border border-slate-200 rounded-3xl p-8 py-16 text-center shadow-sm flex flex-col items-center justify-center">
                <div className="w-48 h-48 relative mb-6">
                  {/* Premium visual illustration using lucide icons or layout */}
                  <div className="absolute inset-0 bg-[#0249ad]/5 rounded-full animate-ping opacity-20"></div>
                  <div className="w-full h-full bg-[#0249ad]/10 rounded-full flex items-center justify-center text-[#0249ad]">
                    <Compass className="w-24 h-24 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 mb-2">Build Your EV Trip Itinerary</h3>
                <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto leading-relaxed mb-6">
                  Select your starting city and destination, select your electric car model, and inspect the route mapping variables instantly.
                </p>

                <div className="max-w-md text-left bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0249ad] text-xs font-black flex items-center justify-center shrink-0">1</span>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                      <strong>Autocomplete Locations:</strong> Start typing in start/end inputs to fetch geocode points in India.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0249ad] text-xs font-black flex items-center justify-center shrink-0">2</span>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                      <strong>Automatic DB Population:</strong> Selected EVs retrieve verified battery capacities and real-world ranges instantly.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0249ad] text-xs font-black flex items-center justify-center shrink-0">3</span>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                      <strong>Charging stops estimation:</strong> Tracks a 10% safety reserve buffer for highway calculations.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Informational block and FAQs */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">Optimizing Highway Routes for Electric Cars</h2>
          <div className="text-slate-600 text-sm font-medium leading-relaxed space-y-4">
            <p>
              Navigating long distances in an electric vehicle (EV) is highly practical, provided you plan routes to account for charging stops, battery degradation factors, and local power tariffs. Using home-charging options yields the most cost-effective rates, whereas utilizing public fast-charging terminals increases the rate per unit. Take advantage of our interactive tools to verify details beforehand.
            </p>
            <p>
              By comparing your planned EV travel expenses with petrol vehicles side-by-side, you can observe direct direct savings of up to 70-80% on fuel alone, showing that upgrading to green energy is financially wise.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
