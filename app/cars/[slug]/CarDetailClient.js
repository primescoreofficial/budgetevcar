'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { getCarUrl } from '@/lib/queries';

// -------------------- SPEC / PRICE MAP HELPER --------------------
function getCarSpecs(car) {
  if (!car) return { minPrice: 0, maxPrice: 0, rangeKm: 0, chargeTime: '', chargeMinutes: 0 };
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

// -------------------- SIMILARITY SCORE CALCULATION --------------------
function getSimilarityScore(otherCar, currentCar) {
  const currentSpecs = getCarSpecs(currentCar);
  const otherSpecs = getCarSpecs(otherCar);
  
  const currentBattery = parseFloat(currentCar.battery_capacity) || 30;
  const otherBattery = parseFloat(otherCar.battery_capacity) || 30;
  
  let score = 0;
  
  // 1. Similar price range (highest priority)
  const priceDiff = Math.abs(currentSpecs.minPrice - otherSpecs.minPrice);
  score += Math.max(0, 100 - priceDiff * 8);
  
  // 2. Similar body type
  if (currentCar.body_type && otherCar.body_type && 
      currentCar.body_type.toLowerCase() === otherCar.body_type.toLowerCase()) {
    score += 40;
  }
  
  // 3. Similar battery size
  const batteryDiff = Math.abs(currentBattery - otherBattery);
  score += Math.max(0, 30 - batteryDiff * 1.5);
  
  // 4. Similar driving range
  const rangeDiff = Math.abs(currentSpecs.rangeKm - otherSpecs.rangeKm);
  score += Math.max(0, 30 - rangeDiff * 0.2);
  
  // 5. Similar segment
  if (currentCar.segment && otherCar.segment && 
      currentCar.segment.toLowerCase() === otherCar.segment.toLowerCase()) {
    score += 15;
  }
  
  return score;
}

export default function CarDetailClient({ car, relatedCars, localImages = [], allCars = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Get similar electric vehicles
  const currentModel = (car.model_name || '').toLowerCase();
  const seenModels = new Set([currentModel]);
  const similarEVs = (allCars || [])
    .filter(c => c.serial_no !== car.serial_no && (c.model_name || '').toLowerCase() !== currentModel)
    .map(c => ({
      car: c,
      score: getSimilarityScore(c, car)
    }))
    .sort((a, b) => b.score - a.score)
    .reduce((acc, current) => {
      const modelLower = (current.car.model_name || '').toLowerCase();
      if (!seenModels.has(modelLower)) {
        seenModels.add(modelLower);
        acc.push(current.car);
      }
      return acc;
    }, [])
    .slice(0, 4); // Keep exactly 4 recommended EVs

  const images = localImages && localImages.length > 0
    ? localImages
    : [car.vehicle_image || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const navigate = (newDirection) => {
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    setDirection(newDirection);
    setCurrentIndex(nextIndex);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      navigate(1);
    } else if (info.offset.x > swipeThreshold) {
      navigate(-1);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  return (
    <>
      {/* ── HEADER ── */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <Link href="/" className="flex items-center gap-1 text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 overflow-hidden  flex-shrink-0">
                <Image src="/logo/newlogo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 40px, 44px" priority />
              </div>
            </Link>
            
            {/* Desktop Link Layout panel */}
            <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900 transition">
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
            <Link href="/find-ev" className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm">
              Get Started
            </Link>

            {/* Mobile Hamburger Menu Toggle Trigger Icon */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer Navigation */}
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
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
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
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
          <Link href="/" className="hover:text-[#0249ad] transition">Home</Link>
          <span>/</span>
          <Link href="/find-ev" className="hover:text-[#0249ad] transition">Find EV</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">{car.model_name || car.detailed_name}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group">
                <div className="w-full h-[240px] sm:h-[400px] bg-slate-50 relative flex items-center justify-center overflow-hidden touch-pan-y">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      key={currentIndex}
                      src={images[currentIndex]}
                      alt={`${car.model_name || car.detailed_name} - View ${currentIndex + 1}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={handleDragEnd}
                      className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
                    />
                  </AnimatePresence>

                  {/* Left Arrow Button */}
                  {images.length > 1 && (
                    <button
                      onClick={() => navigate(-1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 hover:bg-white hover:scale-105 transition-all duration-200 shadow-md z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Right Arrow Button */}
                  {images.length > 1 && (
                    <button
                      onClick={() => navigate(1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 hover:bg-white hover:scale-105 transition-all duration-200 shadow-md z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Indicators / Pagination Dots */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-slate-900/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                {car.brand && (
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md mb-3">{car.brand}</span>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                  {car.detailed_name || car.model_name}
                </h1>
                {car.variant_name && (
                  <p className="text-sm text-slate-400 font-medium mb-4">{car.variant_name}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {car.body_type && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Body Type</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">{car.body_type}</p>
                    </div>
                  )}
                  {car.battery_capacity && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Battery</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">{car.battery_capacity} kWh</p>
                    </div>
                  )}
                  {car.segment && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Segment</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">{car.segment}</p>
                    </div>
                  )}
                  {car.brand && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">{car.brand}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/compare?car1=${car.serial_no}`}
                    className="w-full text-center bg-[#0249ad] hover:bg-blue-700 text-white font-extrabold text-xs tracking-wide py-3 rounded-xl transition-all duration-200 block"
                  >
                    Compare with Other Cars
                  </Link>
                  <Link
                    href="/find-ev"
                    className="w-full text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-3 rounded-xl transition-all duration-200 block"
                  >
                    Browse All EVs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {car.web_search_summary && (
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">About this vehicle</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{car.web_search_summary}</p>
            </div>
          )}

          {similarEVs.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Similar Electric Vehicles</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Compare alternatives with similar pricing, range, body style, and features.
                </p>
              </div>

              {/* Mobile Swipe Indicator */}
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-4 sm:hidden text-xs font-semibold">
                <motion.span
                  animate={{ x: [-3, 0, -3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  ←
                </motion.span>
                <span>Swipe to explore</span>
                <motion.span
                  animate={{ x: [3, 0, 3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:px-0 sm:mx-0 sm:pb-0">
                {similarEVs.map((simCar, index) => (
                  <motion.div
                    key={simCar.serial_no}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-[82vw] max-w-[340px] snap-center sm:min-w-0 sm:max-w-none"
                  >
                    <div>
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                        <img src={simCar.vehicle_image} alt={simCar.model_name || simCar.detailed_name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{simCar.model_name || simCar.detailed_name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{simCar.variant_name || simCar.body_type || ''}</p>
                      {simCar.battery_capacity && (
                        <p className="text-sm font-black text-[#0249ad] mt-1">{simCar.battery_capacity} kWh</p>
                      )}
                    </div>
                    <Link href={getCarUrl(simCar)} className="w-full mt-4 text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-2 rounded-xl transition-all duration-200 block">
                      View Details
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {relatedCars.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">More from {car.brand}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Explore more electric vehicles from {car.brand}
                </p>
              </div>

              {/* Mobile Swipe Indicator */}
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-4 sm:hidden text-xs font-semibold">
                <motion.span
                  animate={{ x: [-3, 0, -3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  ←
                </motion.span>
                <span>Swipe to explore</span>
                <motion.span
                  animate={{ x: [3, 0, 3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:px-0 sm:mx-0 sm:pb-0">
                {relatedCars.map((relCar, index) => (
                  <motion.div
                    key={relCar.serial_no}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-[82vw] max-w-[340px] snap-center sm:min-w-0 sm:max-w-none"
                  >
                    <div>
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                        <img src={relCar.vehicle_image} alt={relCar.model_name || relCar.detailed_name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{relCar.model_name || relCar.detailed_name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{relCar.variant_name || relCar.body_type || ''}</p>
                      {relCar.battery_capacity && (
                        <p className="text-sm font-black text-[#0249ad] mt-1">{relCar.battery_capacity} kWh</p>
                      )}
                    </div>
                    <Link href={getCarUrl(relCar)} className="w-full mt-4 text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-2 rounded-xl transition-all duration-200 block">
                      View Details
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </>
  );
}
