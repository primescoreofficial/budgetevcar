'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { getCarUrl } from '@/lib/queries';

export default function FindEvClient({ cars, brands, segments, bodyTypes }) {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') || '';
  const initialBodyType = searchParams.get('bodyType') || '';
  const initialBudget = searchParams.get('budget') || '';

  let initialBattery = '';
  if (initialBudget === 'under-10') initialBattery = '0-30';
  else if (initialBudget === '10-15') initialBattery = '30-50';
  else if (initialBudget === '15-20') initialBattery = '50-75';
  else if (initialBudget === 'above-20') initialBattery = '75';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState(initialBodyType);
  const [selectedBattery, setSelectedBattery] = useState(initialBattery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredCars = useMemo(() => {
    let result = [...cars];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        (car.brand || '').toLowerCase().includes(q) ||
        (car.model_name || '').toLowerCase().includes(q) ||
        (car.detailed_name || '').toLowerCase().includes(q) ||
        (car.variant_name || '').toLowerCase().includes(q)
      );
    }
    if (selectedBrand) result = result.filter(car => car.brand === selectedBrand);
    if (selectedSegment) result = result.filter(car => car.segment === selectedSegment);
    if (selectedBodyType) result = result.filter(car => car.body_type === selectedBodyType);
    if (selectedBattery) {
      const [min, max] = selectedBattery.split('-').map(Number);
      result = result.filter(car => {
        const cap = parseFloat(car.battery_capacity);
        if (isNaN(cap)) return false;
        if (max) return cap >= min && cap <= max;
        return cap >= min;
      });
    }
    return result;
  }, [cars, searchQuery, selectedBrand, selectedSegment, selectedBodyType, selectedBattery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedSegment('');
    setSelectedBodyType('');
    setSelectedBattery('');
  };

  const activeFilterCount = [selectedBrand, selectedSegment, selectedBodyType, selectedBattery, searchQuery].filter(Boolean).length;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV', active: true },
    { href: '/compare', label: 'Compare' },
    { href: '/calculator', label: 'Calculator' },
  ];

  // Upgraded interactive button styling variables
  const filterBtn = (active, onClick, label, key) => (
    <button
      key={key}
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
        active 
          ? 'bg-[#0249ad] text-white shadow-md shadow-blue-600/10 border border-[#0249ad]' 
          : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-extrabold text-[#0249ad] hover:text-blue-800 transition">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Search Vehicle</label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, model, variant..."
            className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 pl-4 pr-10 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0249ad] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition duration-200 placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Brand</label>
        <div className="flex flex-wrap gap-1.5">
          {filterBtn(!selectedBrand, () => setSelectedBrand(''), 'All', 'brand-all')}
          {brands.map(brand => filterBtn(selectedBrand === brand, () => setSelectedBrand(selectedBrand === brand ? '' : brand), brand, `brand-${brand}`))}
        </div>
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Body Style</label>
        <div className="flex flex-wrap gap-1.5">
          {filterBtn(!selectedBodyType, () => setSelectedBodyType(''), 'All', 'body-all')}
          {bodyTypes.map(bt => filterBtn(selectedBodyType === bt, () => setSelectedBodyType(selectedBodyType === bt ? '' : bt), bt, `body-${bt}`))}
        </div>
      </div>

      {/* Segment */}
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Segment</label>
        <div className="flex flex-wrap gap-1.5">
          {filterBtn(!selectedSegment, () => setSelectedSegment(''), 'All', 'segment-all')}
          {segments.map(seg => filterBtn(selectedSegment === seg, () => setSelectedSegment(selectedSegment === seg ? '' : seg), seg, `segment-${seg}`))}
        </div>
      </div>

      {/* Battery */}
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Battery Capacity</label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All Battery Sizes', value: '' },
            { label: 'City Commute (< 30 kWh)', value: '0-30' },
            { label: 'Mid-Range (30-50 kWh)', value: '30-50' },
            { label: 'Long Range (50-75 kWh)', value: '50-75' },
            { label: 'Ultra Range (75+ kWh)', value: '75' },
          ].map((opt, i) => filterBtn(selectedBattery === opt.value, () => setSelectedBattery(selectedBattery === opt.value ? '' : opt.value), opt.label, `battery-${opt.value || 'all'}-${i}`))}
        </div>
      </div>

      <Link
        href="/compare"
        className="w-full mt-2 bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 text-center block shadow-sm shadow-blue-900/10"
      >
        Compare Selected Vehicles
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
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
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/find-ev"
              className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm shadow-blue-900/10"
            >
              Get Started
            </Link>

            {/* Filter Toggle — mobile only */}
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

            {/* Hamburger Menu Toggle — mobile only */}
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

        {/* Mobile Navigation Drawer */}
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
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                      link.active
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
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href="/find-ev"
                  onClick={() => setMenuOpen(false)}
                  className="w-full block text-center bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Filter Drawer */}
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
                className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition shadow-md"
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

          {/* SIDEBAR CONTAINER — Sticky locked viewport parameters to protect flow hierarchy */}
          <aside className="hidden lg:block w-76 flex-shrink-0 sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
              <FilterPanel />
            </div>
          </aside>

          {/* PRODUCT DIRECTORY RESULTS MATRIX */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-start gap-4 mb-8 pb-4 border-b border-slate-200/40">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {searchQuery || selectedBrand || selectedSegment || selectedBodyType || selectedBattery
                    ? 'Search Results'
                    : 'All Electric Vehicles'}
                </h2>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-1">{filteredCars.length} vehicles matching</p>
              </div>
              
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="lg:hidden text-xs font-bold text-[#0249ad] bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 transition shadow-sm"
                >
                  Clear Active Filters ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Unified Page Scrolling Matrix Block */}
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
                <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed">We couldn't find matches. Try broadening your battery capacity threshold limits or choosing another brand.</p>
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