'use client';

import { subscribeNewsletter } from '@/lib/newsletter';
import { getCarUrl } from '@/lib/queries';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Footer from '@/components/Footer';
import {
  IndianRupee,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    const isTrending = index % 3 === 0; // Show trending badge on some cards
    return (
      <motion.div
        key={car.serial_no}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between snap-start w-[280px] shrink-0 md:w-auto relative group/card"
      >
        {isTrending && (
          <span className="absolute top-6 right-6 bg-orange-50 text-orange-600 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 z-10 shadow-sm">
            <span>🔥</span> Trending
          </span>
        )}
        <div>
          <div className="w-full h-40 bg-slate-50 rounded-xl overflow-hidden mb-4 relative">
            <img
              src={car.vehicle_image}
              alt={car.model_name || car.detailed_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
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

const ads = [
  {
    image: "/ad/be6ad.webp",
    slug: "mahindra-be-6",
    href: "/cars/mahindra-be-6",
    title: "Mahindra BE 6"
  },
  {
    image: "/ad/i4ad.webp",
    slug: "bmw-i4",
    href: "/cars/bmw-i4",
    title: "BMW i4"
  },
  {
    image: "/ad/punchad.jpg",
    slug: "tata-motors-punch-ev",
    href: "/cars/tata-motors-punch-ev",
    title: "Tata Motors Punch EV"
  },
  {
    image: "/ad/windsorad.jpg",
    slug: "mg-jsw-mg-motor--windsor-ev",
    href: "/cars/mg-jsw-mg-motor--windsor-ev",
    title: "MG Windsor EV"
  }
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomeClient({ cars, brands, bodyTypes }) {
  const [activeCategory, setActiveCategory] = useState('SUV');
  const [searchCriteria, setSearchCriteria] = useState('budget');
  const [activeTab, setActiveTab] = useState('new');
  const [visibleCount, setVisibleCount] = useState(4);
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedPrimary, setSelectedPrimary] = useState('all');
  const [selectedSecondary, setSelectedSecondary] = useState('all');

  useEffect(() => {
    setSelectedPrimary('all');
  }, [searchCriteria]);

  const getSearchHref = () => {
    const params = new URLSearchParams();
    if (selectedSecondary !== 'all') {
      params.append('bodyType', selectedSecondary);
    }
    if (searchCriteria === 'brand' && selectedPrimary !== 'all') {
      params.append('brand', selectedPrimary);
    }
    if (searchCriteria === 'budget' && selectedPrimary !== 'all') {
      params.append('budget', selectedPrimary);
    }
    const queryString = params.toString();
    return queryString ? `/find-ev?${queryString}` : '/find-ev';
  };

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
    
    // Luxury brand matching set
    const luxuryBrands = new Set([
      'bmw', 'mercedes-benz', 'audi', 'porsche', 'volvo', 'mini', 'jaguar'
    ]);

    // Track uniqueness per category (brand + model_name) to avoid duplicate variants
    const seenSUV = new Set();
    const seenHatchback = new Set();
    const seenSedan = new Set();
    const seenLuxury = new Set();

    cars.forEach(car => {
      const brandLower = (car.brand || '').toLowerCase();
      const modelLower = (car.model_name || '').toLowerCase();
      const detailedLower = (car.detailed_name || '').toLowerCase();
      const bt = (car.body_type || '').toLowerCase();
      const segmentLower = (car.segment || '').toLowerCase();

      const modelKey = `${brandLower}-${modelLower}`;

      // Check if the car is luxury
      const isLuxury =
        luxuryBrands.has(brandLower) ||
        (brandLower === 'kia' && (modelLower.includes('ev9') || detailedLower.includes('ev9'))) ||
        (brandLower === 'hyundai' && (modelLower.includes('ioniq 5') || detailedLower.includes('ioniq 5'))) ||
        segmentLower.includes('luxury') ||
        segmentLower.includes('premium') ||
        bt.includes('luxury') ||
        bt.includes('premium');

      if (isLuxury) {
        if (!seenLuxury.has(modelKey)) {
          seenLuxury.add(modelKey);
          grouped['Luxury'].push(car);
        }
      }

      // Categorize under body types (a car can belong to both Luxury and its body type)
      if (bt.includes('suv') || bt.includes('crossover')) {
        if (!seenSUV.has(modelKey)) {
          seenSUV.add(modelKey);
          grouped['SUV'].push(car);
        }
      } else if (bt.includes('hatchback') || bt.includes('compact')) {
        if (!seenHatchback.has(modelKey)) {
          seenHatchback.add(modelKey);
          grouped['Hatchback'].push(car);
        }
      } else if (bt.includes('sedan') || bt.includes('saloon')) {
        if (!seenSedan.has(modelKey)) {
          seenSedan.add(modelKey);
          grouped['Sedan'].push(car);
        }
      } else {
        // Fallback to SUV if no other body type matches
        if (!seenSUV.has(modelKey)) {
          seenSUV.add(modelKey);
          grouped['SUV'].push(car);
        }
      }
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
    { href: '/charging-stations', label: 'Charging Stations' },
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
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-1 text-[13px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black">✓</span> 100+ EV Models
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black">✓</span> Live Charging Stations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black">✓</span> Updated Specifications
              </span>
            </div>
            <div className="pt-5 text-center grid grid-cols-3 gap-4 max-w-sm border-t border-slate-200/60">
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
            <div className="bg-transparent rounded-[2rem] shadow-2xl overflow-hidden aspect-[4/3] relative group">
              <div className="absolute inset-0 w-full h-full z-0">
                <Swiper
                  modules={[Autoplay, Navigation, Pagination]}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  navigation={{
                    nextEl: '.swiper-button-next-hero',
                    prevEl: '.swiper-button-prev-hero',
                  }}
                  pagination={{
                    clickable: true,
                    el: '.swiper-pagination-hero',
                    bulletClass: 'swiper-pagination-bullet-custom',
                    bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                  }}
                  className="w-full h-full"
                >
                  {ads.map((ad, index) => (
                    <SwiperSlide key={index} className="relative w-full h-full">
                      <Link href={ad.href} className="block w-full h-full cursor-pointer relative overflow-hidden group/slide">
                        <Image
                          src={ad.image}
                          alt={ad.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0}
                          loading={index === 0 ? undefined : "lazy"}
                          className="object-contain w-full h-full bg-[#0b131f] transition-all duration-500 hover:scale-[1.02] hover:brightness-105"
                        />
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Custom navigation arrows (Desktop only) */}
              <button className="swiper-button-prev-hero hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-[#0249ad] shadow-lg backdrop-blur-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="swiper-button-next-hero hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-[#0249ad] shadow-lg backdrop-blur-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Custom pagination dots */}
              <div className="swiper-pagination-hero absolute bottom-4 left-0 right-0 mx-auto z-30 flex gap-2 justify-center items-center w-max" />
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
                  <div className="relative">
                    <select
                      value={selectedPrimary}
                      onChange={(e) => setSelectedPrimary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-[#0249ad] focus:bg-white transition cursor-pointer"
                    >
                      {searchCriteria === 'budget' ? (
                        <>
                          <option value="all">Select Budget Range</option>
                          <option value="under-10">Under ₹10 Lakh</option>
                          <option value="10-15">₹10L – ₹15 Lakh</option>
                          <option value="15-20">₹15L – ₹20 Lakh</option>
                          <option value="above-20">Above ₹20 Lakh</option>
                        </>
                      ) : (
                        <>
                          <option value="all">Select Brand</option>
                          {brands.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedSecondary}
                      onChange={(e) => setSelectedSecondary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-[#0249ad] focus:bg-white transition cursor-pointer"
                    >
                      <option value="all">Select Body Type</option>
                      {bodyTypes.map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href={getSearchHref()} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg text-center text-xs tracking-wider uppercase transition block">Search Available EVs</Link>
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
            <div className="border-b border-slate-100 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">The most searched electric cars</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">Explore current trending electric vehicles by body style</p>
              </div>
              <Link href="/find-ev" className="text-xs font-bold text-[#0249ad] hover:underline whitespace-nowrap self-start sm:self-center">
                View All Cars →
              </Link>
            </div>

            {/* Premium Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  id: 'SUV',
                  name: 'SUV & Crossover',
                  svg: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 17h20M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM4 13h16l-2-5H6L4 13z" />
                    </svg>
                  )
                },
                {
                  id: 'Hatchback',
                  name: 'Hatchback & Compact',
                  svg: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18M6 15a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4zM5 11l2-4h10l2 4H5z" />
                    </svg>
                  )
                },
                {
                  id: 'Sedan',
                  name: 'Sedan & Saloon',
                  svg: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 16h20M5 16a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM3 12l3-5h12l3 5H3z" />
                    </svg>
                  )
                },
                {
                  id: 'Luxury',
                  name: 'Luxury & Premium',
                  svg: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M2 17h20M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM4 13h16l-1-6H5l-1 6z" />
                    </svg>
                  )
                }
              ].map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive ? 'bg-[#0249ad] text-white border-[#0249ad] shadow-md shadow-blue-100' : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-slate-50'}`}
                  >
                    <div className={`mb-3 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-[#0249ad]'}`}>
                      {cat.svg}
                    </div>
                    <span className="text-xs font-extrabold tracking-wide">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 scroll-smooth snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <AnimatePresence mode="wait">
                {currentCategoryCars.slice(0, 4).map((car, i) => (
                  <CarCard key={car.serial_no} car={car} index={i} variant="category" />
                ))}
              </AnimatePresence>
              {currentCategoryCars.length === 0 && (
                <div className="col-span-4 text-center py-12 text-slate-400 text-sm font-medium">No cars found in this category.</div>
              )}
            </div>

            {/* ── QUICK COMPARE STRIP ── */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <span className="text-[#0249ad]">⚡</span> Compare Top EVs
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/compare?car1=tata-motors-nexon-ev" className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-[#0249ad] hover:border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition">
                  Tata Nexon EV
                </Link>
                <Link href="/compare?car1=mg-jsw-mg-motor--windsor-ev" className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-[#0249ad] hover:border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition">
                  MG Windsor EV
                </Link>
                <Link href="/compare?car1=mahindra-be-6" className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-[#0249ad] hover:border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition">
                  Mahindra BE 6
                </Link>
                <Link href="/compare" className="bg-[#0249ad] text-white hover:bg-blue-800 text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-sm ml-0 md:ml-4">
                  Compare
                </Link>
              </div>
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

        {/* ── WHY CHOOSE BUDGETEV ── */}
        <LazySection className="mb-16">
          <section className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[#0249ad] uppercase tracking-wider text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg">Why Choose BudgetEV</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 leading-tight">Your Complete EV Transition Partner</h2>
              <p className="text-slate-50 text-xs font-semibold mt-2">We simplify electric mobility with smart tools and unbiased data.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Smart Comparison',
                  desc: 'Compare charging speeds, battery capacities, safety ratings, and price side-by-side.',
                  icon: (
                    <svg className="w-6 h-6 text-[#0249ad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                  )
                },
                {
                  title: 'Charging Maps',
                  desc: 'Locate nearby charging stations across major Indian highway corridors easily.',
                  icon: (
                    <svg className="w-6 h-6 text-[#0249ad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )
                },
                {
                  title: 'Savings Calculator',
                  desc: 'Calculate exact daily commuting fuel savings compared to petrol/diesel ICE cars.',
                  icon: (
                    <svg className="w-6 h-6 text-[#0249ad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M9 11h.01M12 7h.01M15 11h.01M12 14h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                  )
                },
                {
                  title: 'Battery Tech Insights',
                  desc: 'Understand chemistry (LFP vs NMC), lifecycle health, and smart charging habits.',
                  icon: (
                    <svg className="w-6 h-6 text-[#0249ad]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                }
              ].map((feat, i) => (
                <div key={i} className="bg-white border border-slate-100 hover:border-blue-200 p-6 rounded-2xl hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </LazySection>

        {/* ── EV STATISTICS ── */}
        <LazySection className="mb-16">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {[
                { val: `${cars.length}+`, label: 'EV Models Available' },
                { val: `${brands.length}+`, label: 'Top Trusted Brands' },
                { val: '5,000+', label: 'Charging Stations' },
                { val: '4.8 / 5', label: 'Average User Rating' }
              ].map((stat, i) => (
                <div key={i} className="pt-4 lg:pt-0 lg:px-4 space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-[#0249ad] tracking-tight">{stat.val}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </LazySection>

        {/* ── FEATURED BRANDS ── */}
        <LazySection className="mb-16">
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900 text-center uppercase tracking-widest mb-6">Explore Top EV Brands</h3>
            <div className="flex overflow-x-auto gap-3 pb-3 w-full scrollbar-none lg:grid lg:grid-cols-9 lg:gap-4 lg:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { name: 'Tata', slug: 'tata-motors' },
                { name: 'Mahindra', slug: 'mahindra' },
                { name: 'MG', slug: 'mg-jsw-mg-motor-' },
                { name: 'BYD', slug: 'byd' },
                { name: 'Hyundai', slug: 'hyundai' },
                { name: 'Kia', slug: 'kia' },
                { name: 'BMW', slug: 'bmw' },
                { name: 'Mercedes', slug: 'mercedes-benz' },
                { name: 'Toyota', slug: 'toyota' }
              ].map((b, i) => (
                <Link key={i} href={`/find-ev?brand=${b.slug}`} className="w-full min-w-[100px] shrink-0 lg:min-w-0 lg:shrink bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-[#0249ad] py-4 rounded-xl text-center text-xs font-extrabold transition-all duration-200 shadow-sm block">
                  {b.name}
                </Link>
              ))}
            </div>
          </section>
        </LazySection>

        {/* ── EV BUYING GUIDE ── */}
        <LazySection id="guides" className="mb-16">
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">New to Electric Vehicles?</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Our comprehensive guides help simplify the switch to electric mobility</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'How EV Charging Works',
                  desc: 'Understand DC fast charging vs AC home wallbox charging, connection types, and speeds.',
                  tag: 'Charging Guide',
                  time: '5 min read'
                },
                {
                  title: 'Understanding Range',
                  desc: 'Learn about WLTP vs MIDC certification range, battery efficiency, and real-world range factors.',
                  tag: 'Range Guide',
                  time: '4 min read'
                },
                {
                  title: 'Battery Health Tips',
                  desc: 'Best practices for NMC and LFP batteries, depth of discharge, temperature impact, and degradation.',
                  tag: 'Battery Life',
                  time: '6 min read'
                },
                {
                  title: 'EV Ownership Cost',
                  desc: 'A breakdown of electricity costs, maintenance, parts replacement, and long-term savings.',
                  tag: 'Cost Analysis',
                  time: '5 min read'
                }
              ].map((guide, i) => (
                <div key={i} className="bg-white border border-slate-100 hover:border-blue-100 rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-extrabold text-[#0249ad] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{guide.tag}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{guide.time}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-2">{guide.title}</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">{guide.desc}</p>
                  </div>
                  <button className="text-xs font-bold text-[#0249ad] hover:text-blue-800 transition flex items-center gap-1 mt-auto cursor-pointer">
                    Read Guide <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              ))}
            </div>
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

        {/* ── STRONG CTA ── */}
        <LazySection className="mb-12">
          <section className="bg-gradient-to-r from-[#1e40af] to-[#0249ad] text-white rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to Find Your Perfect EV?</h2>
              <p className="text-blue-100 text-sm sm:text-base font-semibold leading-relaxed">
                Compare models, find charging networks, and see fuel cost savings instantly. No commitment, just pure electric data.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/find-ev" className="bg-white hover:bg-slate-50 text-[#0249ad] px-8 py-3.5 rounded-xl font-bold transition shadow-sm text-sm">
                  Explore Cars
                </Link>
                <Link href="/compare" className="bg-transparent hover:bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold transition text-sm">
                  Compare EVs
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
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