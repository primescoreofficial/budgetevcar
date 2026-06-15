'use client';

import { subscribeNewsletter } from '@/lib/newsletter';
import { getCarUrl } from '@/lib/queries';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Footer from '@/components/Footer';
import {
  IndianRupee,
  Scale,
  ShieldCheck,
} from "lucide-react";

// ─── Dynamic Scroll Reveal Section Wrapper ─────────────────────────────────
function LazySection({ children, className = '' }) {
  const ref = useRef(null);
  // Monitors intersection state to trigger pop up exactly when entering screen
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Car Card ───────────────────────────────────────────────────────────────
function CarCard({ car, index, variant = 'grid' }) {
  if (variant === 'category') {
    return (
      <motion.div
        key={car.serial_no}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div className="w-full h-40 bg-slate-50 rounded-xl overflow-hidden mb-4">
            <img
              src={car.vehicle_image}
              alt={car.model_name || car.detailed_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{car.model_name || car.detailed_name}</h4>
          <p className="text-sm font-black text-[#0249ad] mt-1">
            {car.battery_capacity ? `${car.battery_capacity} kWh` : 'N/A'}
            <span className="text-[10px] font-medium text-slate-400"> Battery</span>
          </p>
        </div>
        <Link
          href={getCarUrl(car)}
          className="w-full mt-4 text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-2.5 rounded-xl transition-all duration-200 block"
        >
          View Details
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index % 4, 3) * 0.06 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col"
    >
      <div className="h-44 bg-slate-50 overflow-hidden">
        <img
          src={car.vehicle_image}
          alt={car.model_name || car.detailed_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{car.model_name || car.detailed_name}</h3>
          {car.brand && (
            <span className="text-[10px] font-bold text-[#0249ad] bg-blue-50 px-2 py-0.5 rounded-md ml-2 whitespace-nowrap">{car.brand}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium mb-2">{car.variant_name || car.body_type || ''}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
          {car.battery_capacity && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 21l-1-7H4l9-11 1 7h6l-9 11z" />
              </svg>
              {car.battery_capacity} kWh
            </span>
          )}
          {car.segment && <span className="text-slate-400">• {car.segment}</span>}
        </div>
        <Link
          href={getCarUrl(car)}
          className="mt-3 w-full text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-2 rounded-xl transition-all duration-200 block"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomeClient({ cars, brands, bodyTypes }) {
  const [activeCategory, setActiveCategory] = useState('SUV');
  const [searchCriteria, setSearchCriteria] = useState('budget');
  const [activeTab, setActiveTab] = useState('new');
  const [visibleCount, setVisibleCount] = useState(4);
  const [menuOpen, setMenuOpen] = useState(false);

  // Newsletter Submit State Handlers
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    setNewsletterMessage('');
    const result = await subscribeNewsletter(newsletterEmail);
    if (result.success) {
      setNewsletterMessage('✅ Successfully subscribed!');
      setNewsletterEmail('');
    } else {
      setNewsletterMessage(
        result?.error?.code === '23505'
          ? '⚠️ This email is already subscribed.'
          : '❌ Failed to subscribe. Please try again.'
      );
    }
    setNewsletterLoading(false);
  };

  const carsByBodyType = useMemo(() => {
    const grouped = { SUV: [], Hatchback: [], Sedan: [], Luxury: [] };
    cars.forEach(car => {
      const bt = (car.body_type || '').toLowerCase();
      if (bt.includes('suv') || bt.includes('crossover')) grouped['SUV'].push(car);
      else if (bt.includes('hatchback') || bt.includes('compact')) grouped['Hatchback'].push(car);
      else if (bt.includes('sedan') || bt.includes('saloon')) grouped['Sedan'].push(car);
      else if (bt.includes('luxury') || bt.includes('premium') || bt.includes('coupe')) grouped['Luxury'].push(car);
      else grouped['SUV'].push(car);
    });
    return grouped;
  }, [cars]);

  const currentCategoryCars = carsByBodyType[activeCategory] || [];
  const visibleCars = cars.slice(0, visibleCount);
  const hasMore = visibleCount < cars.length;

  const handleLoadMore = () => setVisibleCount(prev => prev + 4);
  const handleCategoryChange = (cat) => setActiveCategory(cat);

  const navLinks = [
    { href: '/', label: 'Home', active: true },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/calculator', label: 'Calculator' },
  ];

  return (
    <>
      {/* ── HEADER ── */}
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-12">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">BudgetEV</Link>
            <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={link.active ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 font-semibold" : "hover:text-slate-900 transition"}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/find-ev" className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm">
              Get Started
            </Link>
            <button onClick={() => setMenuOpen(prev => !prev)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 pb-6 pt-3 absolute left-0 right-0 z-40">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${link.active ? "bg-blue-50 text-[#1e3a8a]" : "text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a]"}`}>
                    <span>{link.label}</span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link href="/find-ev" onClick={() => setMenuOpen(false)} className="w-full block text-center bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl text-sm transition shadow-sm">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 main-container-reveal">

        {/* ── HERO ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 pt-12">
          <div className="lg:col-span-6 space-y-7">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Find the Best Electric Car{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-[#1e40af]">Within Your Budget</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-xl leading-relaxed">
              Simplify your transition to electric. Compare range, battery life and safety ratings across every EV available in India.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/find-ev" className="inline-flex items-center bg-[#1e40af] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition text-sm shadow-sm">
                Find My EV
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link href="/compare" className="inline-flex items-center bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 px-6 py-3 rounded-full font-semibold transition text-sm">Compare Cars</Link>
            </div>
            <div className="pt-5 grid grid-cols-3 gap-4 max-w-sm border-t border-slate-200/60">
              {[
                { val: `${cars.length}+`, label: 'EV Models' },
                { val: '₹0', label: 'Fuel Cost' },
                { val: '4.8/5', label: 'User Rating' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">{s.val}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wide uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#0b131f] rounded-[2rem] p-4 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col justify-between relative">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
                alt="Electric Car Charging"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-black/80 pointer-events-none" />
              <div className="mt-auto relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M11 21l-1-7H4l9-11 1 7h6l-9 11z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Fast Charging</h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">80% in 45 mins</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Eco Friendly
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINDER WIDGET ── */}
        <LazySection className="mb-10">
          <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[440px]">
            <div className="w-full lg:w-[38%] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-5">Find your right car</h3>
                <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                  {['new', 'used'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{tab === 'new' ? 'New Car' : 'Used Car'}</button>
                  ))}
                </div>

                <div className="flex items-center gap-6 mb-5 pl-1">
                  {['budget', 'brand'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                      <input type="radio" name="search-criteria" value={opt} checked={searchCriteria === opt} onChange={() => setSearchCriteria(opt)} className="w-4 h-4 text-[#0249ad] border-slate-300 focus:ring-[#0249ad]" />
                      <span className={searchCriteria === opt ? 'border-b-2 border-[#0249ad] pb-0.5' : 'text-slate-400'}>By {opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'primary', options: searchCriteria === 'budget' ? [{ value: 'all', label: 'Select Budget Range' }, { value: 'under-10', label: 'Under ₹10 Lakh' }, { value: '10-15', label: '₹10L – ₹15 Lakh' }, { value: '15-20', label: '₹15L – ₹20 Lakh' }, { value: 'above-20', label: 'Above ₹20 Lakh' }] : [{ value: 'all', label: 'Select Brand' }, ...brands.map(b => ({ value: b, label: b }))] },
                    { id: 'secondary', options: [{ value: 'all', label: 'Select Body Type' }, ...bodyTypes.map(bt => ({ value: bt, label: bt }))] },
                  ].map(sel => (
                    <div key={sel.id} className="relative">
                      <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-[#0249ad] focus:bg-white transition cursor-pointer">
                        {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/find-ev" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg text-center text-xs tracking-wider uppercase transition block">Search Available EVs</Link>
                <div className="text-center">
                  <Link href="/find-ev" className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#0249ad] transition">Advanced Smart Search <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></Link>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[62%] flex flex-col justify-between p-6 sm:p-10 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-black text-sm text-blue-400">EV</div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-extrabold">Premium Campaign Live</span>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">BUDGET-EV EXCLUSIVE SPOTLIGHT</h4>
                  </div>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 text-[11px] font-bold">⚡ Smart Driving Transition</div>
              </div>

              <div className="my-auto py-8">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md mb-3">Limited Period Offer</span>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-none mb-3">THE ALL-NEW HECTOR<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">BENEFITS UP TO</span> <span className="text-yellow-400 font-black">₹60,000*</span></h2>
                <p className="text-slate-300 text-xs font-semibold max-w-md leading-relaxed">Experience India&apos;s advanced connected driving. Special interest rates with zero down-payment options.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-slate-200"><span className="text-blue-400 font-extrabold">📞 Booking Hub:</span> 1800 102 1363</div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold">
                  <span className="text-white border-b-2 border-blue-500 pb-1 cursor-pointer">MG Central</span>
                  <span className="hover:text-white cursor-pointer transition">Punch Spotlight</span>
                  <span className="hover:text-white cursor-pointer transition">Windsor Live</span>
                </div>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ── CATEGORY TABS — Most Searched ── */}
        <LazySection className="mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">The most searched electric cars</h3>
              <div className="flex flex-wrap gap-2">
                {['SUV', 'Hatchback', 'Sedan', 'Luxury'].map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-5 py-2 text-xs font-extrabold tracking-wide rounded-lg transition-all duration-200 ${activeCategory === cat ? 'bg-[#0249ad] text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="wait">
                {currentCategoryCars.slice(0, 4).map((car, i) => (
                  <CarCard key={car.serial_no} car={car} index={i} variant="category" />
                ))}
              </AnimatePresence>
              {currentCategoryCars.length === 0 && (
                <div className="col-span-4 text-center py-12 text-slate-400 text-sm font-medium">No cars found in this category.</div>
              )}
            </div>
          </div>
        </LazySection>

        {/* ── DISCOVER SECTION ── */}
        <LazySection>
          <section id="discover-section">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Discover Electric Vehicles</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Showing {Math.min(visibleCount, cars.length)} of {cars.length} EVs</p>
              </div>
              <Link href="/find-ev" className="text-xs font-bold text-[#0249ad] hover:underline">View with filters →</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {visibleCars.map((car, i) => (
                  <CarCard key={car.serial_no} car={car} index={i} variant="grid" />
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={handleLoadMore} className="inline-flex items-center gap-2 bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all duration-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>Load More ({cars.length - visibleCount} remaining)</button>
              </div>
            )}

            {!hasMore && cars.length > 4 && (
              <p className="text-center mt-8 text-xs font-bold text-slate-300 uppercase tracking-wider">✓ All {cars.length} EVs loaded</p>
            )}
          </section>
        </LazySection>

        {/* ── SAVINGS CTA ── */}
        <LazySection className="mt-12">
          <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Content */}
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                  The Future is{" "}
                  <span className="text-emerald-500">Electric</span>
                </h1>

                <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-xl">
                  Switching to an EV is more than a purchase; it's an investment
                  in a cleaner, more efficient way to travel.
                </p>

                {/* Feature 1 */}
                <div className="flex gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <IndianRupee />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                      Huge Savings
                    </h3>
                    <p className="text-slate-500 max-w-md">
                      Save up to ₹1.5L per year on fuel and maintenance
                      compared to ICE cars.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Scale />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                      Zero Emissions
                    </h3>
                    <p className="text-slate-500 max-w-md">
                      Help reduce the carbon footprint and noise pollution
                      in your city.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <ShieldCheck />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                      Advanced Safety
                    </h3>
                    <p className="text-slate-500 max-w-md">
                      Modern EVs come with the latest driver-assistance
                      and safety technologies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="bg-[#030f24] rounded-[40px] p-8 md:p-14 shadow-2xl min-h-[500px] flex flex-col justify-center">

                <span className="text-emerald-400 uppercase tracking-wider text-sm font-bold mb-6">
                  Indian EV Ecosystem
                </span>

                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                  Calculate Your Monthly
                  <br />
                  Savings Instantly
                </h2>

                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                  Input your daily commute and current fuel price to see
                  how much you can save by switching to an EV.
                </p>

                <Link
                  href="/calculator"
                  className="w-fit bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all"
                >
                  Go to Calculator
                </Link>
              </div>

            </div>
          </section>
        </LazySection>

        {/* ── NEWSLETTER ── */}
        <LazySection className="mt-10 mb-12">
          <section className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-3">Stay Updated on Indian EVs</h2>
            <p className="text-slate-500 text-sm font-medium max-w-lg mx-auto mb-6">Get the latest news, price updates, and exclusive offers on electric vehicles delivered to your inbox.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email address" required className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0249ad] focus:bg-white transition" />
              <button type="submit" disabled={newsletterLoading} className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-sm whitespace-nowrap disabled:opacity-50">{newsletterLoading ? 'Subscribing...' : 'Subscribe'}</button>
            </form>
            {newsletterMessage && <p className="mt-4 text-sm font-medium text-slate-600">{newsletterMessage}</p>}
          </section>
        </LazySection>

      </main>

      {/* ── FOOTER ── */}
      <Footer brands={brands} bodyTypes={bodyTypes} />
    </>
  );
}