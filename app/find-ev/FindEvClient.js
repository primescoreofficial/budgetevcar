'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { getCarUrl } from '@/lib/queries';

// -------------------- SPEC / PRICE MAP HELPER --------------------
function getCarSpecs(car) {
  const brand = (car.brand || '').toLowerCase();
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

export default function FindEvClient({ cars, brands, segments, bodyTypes }) {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') || '';
  const initialBodyType = searchParams.get('bodyType') || '';
  const initialBudget = searchParams.get('budget') || '';

  let initialBatteryLimit = '';
  if (initialBudget === 'under-10') initialBatteryLimit = 30;
  else if (initialBudget === '10-15') initialBatteryLimit = 50;
  else if (initialBudget === '15-20') initialBatteryLimit = 75;
  else if (initialBudget === 'above-20') initialBatteryLimit = 150;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(initialBrand ? [initialBrand] : []);
  const [selectedBodyType, setSelectedBodyType] = useState(initialBodyType);
  const [priceRange, setPriceRange] = useState(25); // Lakhs max limit (25 means Any Price)
  const [minRange, setMinRange] = useState(0);
  const [chargingFilter, setChargingFilter] = useState('all');

  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleBrand = (brandName) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedBodyType('');
    setPriceRange(25);
    setMinRange(0);
    setChargingFilter('all');
  };

  const activeFilterCount = [
    selectedBrands.length > 0,
    selectedBodyType,
    priceRange < 25,
    minRange > 0,
    chargingFilter !== 'all',
    searchQuery
  ].filter(Boolean).length;

  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        (car.brand || '').toLowerCase().includes(q) ||
        (car.model_name || '').toLowerCase().includes(q) ||
        (car.detailed_name || '').toLowerCase().includes(q)
      );
    }

    if (selectedBrands.length > 0) {
      result = result.filter(car => {
        const brandLower = (car.brand || '').toLowerCase();
        return selectedBrands.some(b => {
          const bLower = b.toLowerCase();
          return brandLower.includes(bLower) || bLower.includes(brandLower);
        });
      });
    }

    if (selectedBodyType) {
      result = result.filter(car => {
        const bt = (car.body_type || '').toLowerCase();
        const selectedBt = selectedBodyType.toLowerCase();
        if (selectedBt.includes('suv')) {
          return bt.includes('suv') || bt.includes('crossover') || bt.includes('muv');
        }
        return bt.includes(selectedBt);
      });
    }

    result = result.filter(car => {
      const specs = getCarSpecs(car);
      if (priceRange < 25 && specs.minPrice > priceRange) return false;
      if (minRange > 0 && specs.rangeKm < minRange) return false;
      if (chargingFilter === 'fast' && specs.chargeMinutes > 60) return false;
      if (chargingFilter === 'normal' && specs.chargeMinutes <= 60) return false;
      return true;
    });

    return result;
  }, [cars, searchQuery, selectedBrands, selectedBodyType, priceRange, minRange, chargingFilter]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV', active: true },
    { href: '/compare', label: 'Compare' },
    { href: '/calculator', label: 'Calculator' },
  ];

  const FilterPanel = () => (
    <div className="flex flex-col gap-6 text-slate-800">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-extrabold text-[#0249ad] hover:text-blue-800 transition">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Price Range Slider */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Price Range</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>₹5L</span>
            <span className="text-[#0249ad] bg-blue-50 px-2.5 py-0.5 rounded-md">
              {priceRange === 25 ? 'Any Price' : `Up to ₹${priceRange} Lakh`}
            </span>
            <span>₹25L+</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
          />
        </div>
      </div>

      {/* Brand Checkboxes */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Brand</h4>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-slate-300 text-[#0249ad] focus:ring-[#0249ad]"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Body Type Grid Cards */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Body Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: 'Hatchback',
              label: 'Hatchback',
              icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 19H5a2 2 0 01-2-2V9a2 2 0 012-2h10l4 4v6a2 2 0 01-2 2z" />
                  <circle cx="7" cy="19" r="2" />
                  <circle cx="17" cy="19" r="2" />
                </svg>
              )
            },
            {
              id: 'SUV',
              label: 'SUV / MUV',
              icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h3l3-4h8l3 4h3v6h-2M5 16h14" />
                  <circle cx="6" cy="16" r="2.5" />
                  <circle cx="18" cy="16" r="2.5" />
                </svg>
              )
            },
            {
              id: 'Sedan',
              label: 'Sedan',
              icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l2-3h8l2 3h3v4H3v-4z" />
                  <circle cx="6" cy="16" r="2" />
                  <circle cx="18" cy="16" r="2" />
                </svg>
              )
            },
            {
              id: 'Compact',
              label: 'Compact',
              icon: (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16v6H4z" />
                  <circle cx="8" cy="15" r="2" />
                  <circle cx="16" cy="15" r="2" />
                </svg>
              )
            }
          ].map(type => {
            const active = selectedBodyType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedBodyType(active ? '' : type.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${active
                    ? 'border-[#0249ad] bg-[#0249ad]/5 text-[#0249ad] font-bold shadow-sm ring-1 ring-[#0249ad]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
              >
                {type.icon}
                <span className="text-[10px] tracking-wide uppercase font-bold">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Pills (Brand Blue) */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Range (KM)</h4>
        <div className="flex flex-wrap gap-1.5">
          {[150, 250, 350, 450].map(range => {
            const active = minRange === range;
            return (
              <button
                key={range}
                onClick={() => setMinRange(active ? 0 : range)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
                    ? 'bg-[#0249ad] border-[#0249ad] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {range}+
              </button>
            );
          })}
        </div>
      </div>

      {/* Charging Time Radios (Brand Blue) */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Charging Time</h4>
        <div className="space-y-2.5">
          {[
            { id: 'all', label: 'All Speeds' },
            { id: 'fast', label: 'Fast (Under 1h)' },
            { id: 'normal', label: 'Normal (Under 6h)' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              <input
                type="radio"
                name="charging-time"
                checked={chargingFilter === opt.id}
                onChange={() => setChargingFilter(opt.id)}
                className="w-4 h-4 border-slate-300 text-[#0249ad] focus:ring-[#0249ad]"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">

      {/* ── HEADER (Original layout without yellow banners or search inputs) ── */}
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
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/find-ev"
              className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm shadow-blue-900/10"
            >
              Get Started
            </Link>

            <button
              onClick={() => { setFilterOpen(p => !p); setMenuOpen(false); }}
              className="md:hidden relative p-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition focus:outline-none"
              aria-label="Toggle filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h18M7 8h10M11 12h2M9 16h6" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0249ad] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setMenuOpen(p => !p); setFilterOpen(false); }}
              className="md:hidden p-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition focus:outline-none"
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-xl px-5 pb-6 pt-5 max-h-[80vh] overflow-y-auto absolute left-0 right-0 z-40"
            >
              <FilterPanel />
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full mt-5 bg-[#0249ad] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition shadow-md"
              >
                Apply Filters ({filteredCars.length} Matches)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN LAYOUT LAYER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* SIDEBAR FILTER CONTAINER */}
          <aside className="hidden lg:block w-76 flex-shrink-0 sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 custom-scrollbar">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
              <FilterPanel />
            </div>
          </aside>
          {/* PRODUCT DIRECTORY RESULTS MATRIX */}
          <div className="flex-1 w-full">

            {/* Header / Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-start gap-4 mb-8 pb-4 border-b border-slate-200/40">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {searchQuery || selectedBrands.length > 0 || selectedBodyType
                    ? 'Search Results'
                    : 'All Electric Vehicles'}
                </h2>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-1">
                  {filteredCars.length} vehicles matching
                </p>
              </div>

              {/* Search input in Listings top bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brand, model, variant..."
                  className="bg-white border border-slate-200 text-slate-800 pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0249ad] focus:bg-white transition w-full"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Unified Page Scrolling Matrix Block (Original Card Layouts Restored) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              <AnimatePresence>
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.serial_no}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: 'easeInOut', delay: Math.min(index, 5) * 0.03 }}
                    className="group bg-white border border-slate-200/60 rounded-2xl p-4 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Enforced premium proportional image thumbnail frame */}
                      <div className="w-full aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden mb-4 relative">
                        <img
                          src={car.vehicle_image}
                          alt={car.model_name || car.detailed_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </div>

                      <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#0249ad] transition-colors duration-200">
                        {car.model_name || car.detailed_name}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">
                        {car.brand}{car.variant_name ? ` • ${car.variant_name}` : ''}
                      </p>

                      {/* Specification Pill Badges */}
                      <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-bold mt-4">
                        {car.battery_capacity && (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100/60 px-2.5 py-1 rounded-lg text-[11px]">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M11 21l-1-7H4l9-11 1 7h6l-9 11z" />
                            </svg>
                            {car.battery_capacity} kWh
                          </span>
                        )}
                        {car.body_type && (
                          <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap">
                            {car.body_type}
                          </span>
                        )}
                        {car.segment && (
                          <span className="bg-blue-50/40 text-blue-700 border border-blue-100/30 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap">
                            Class {car.segment}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={getCarUrl(car)}
                      className="w-full mt-6 text-center bg-white border-2 border-[#0249ad] text-[#0249ad] group-hover:bg-[#0249ad] group-hover:text-white font-black text-xs tracking-wider uppercase py-3 rounded-xl transition-all duration-300 block shadow-sm"
                    >
                      View Full Details
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Zero Filter Matches State View */}
            {filteredCars.length === 0 && (
              <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="text-5xl mb-4 filter drop-shadow-sm">🔍</div>
                <h3 className="text-lg font-black text-slate-800 mb-1">No Vehicles Match Criteria</h3>
                <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed">We couldn't find matches. Try adjusting your range slider or checking other brands.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 bg-[#0249ad] hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md shadow-blue-600/10"
                >
                  Reset All Filter Options
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}