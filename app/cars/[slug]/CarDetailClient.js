'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getCarUrl } from '@/lib/queries';

const MotionImage = motion(Image);

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

export default function CarDetailClient({ car, relatedCars, localImages = [], allCars = [], categorizedImages }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleShare = async () => {
    const url = `https://www.budgetevcar.com${getCarUrl(car)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyLink = async () => {
    try {
      const url = `https://www.budgetevcar.com${getCarUrl(car)}`;
      await navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsShareModalOpen(false);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

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

  const categories = categorizedImages || {
    exterior: {
      label: 'Exterior',
      images: localImages && localImages.length > 0
        ? localImages
        : [car.vehicle_image || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80']
    },
    interior: {
      label: 'Interior',
      images: []
    }
  };

  const [activeTab, setActiveTab] = useState('exterior');
  const activeImages = categories[activeTab]?.images || [];
  const images = activeImages.length > 0
    ? activeImages
    : (categories.exterior?.images || [car.vehicle_image || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80']);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleTabChange = (tabKey) => {
    const tabImages = categories[tabKey]?.images || [];
    if (tabImages.length === 0) return;
    if (currentIndex >= tabImages.length) {
      setCurrentIndex(0);
    }
    setActiveTab(tabKey);
  };

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



  return (
    <>
      <Header />

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
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <AnimatePresence initial={false} custom={direction}>
                        <MotionImage
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
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px"
                          priority={currentIndex === 0}
                          quality={100}
                          className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
                        />
                      </AnimatePresence>
                    </motion.div>
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
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Categories Tab Switcher */}
              <div className="mt-5 flex justify-center sm:justify-start">
                <div className=" p-1 rounded-full flex gap-2 w-full  ">
                  {Object.keys(categories).map((tabKey) => {
                    const cat = categories[tabKey];
                    const hasImages = cat.images && cat.images.length > 0;
                    const isActive = activeTab === tabKey;

                    return (
                      <button
                        key={tabKey}
                        onClick={() => handleTabChange(tabKey)}
                        disabled={!hasImages}
                        aria-selected={isActive}
                        aria-disabled={!hasImages ? "true" : "false"}
                        role="tab"
                        className={`relative flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40 select-none ${isActive
                            ? 'bg-[#0249ad] text-white shadow-md shadow-blue-500/10 scale-[1.02]'
                            : !hasImages
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : 'bg-white border-2 border-[#0249ad] text-[#0249ad] hover:text-[#0249ad] hover:bg-slate-50 hover:scale-[1.01] active:scale-[0.98]'
                          }`}
                      >
                        {isActive && (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {car.brand && (
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md mb-3">{car.brand}</span>
                    )}
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                      {car.detailed_name || car.model_name}
                    </h1>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-[#0249ad] hover:bg-blue-50/50 transition-all duration-200 shadow-sm flex items-center justify-center shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                    title="Share vehicle"
                    aria-label="Share vehicle"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
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

      {/* ── SHARE MODAL ── */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Share vehicle</h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0249ad] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span>Copy Link</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`https://www.budgetevcar.com${getCarUrl(car)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.453L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.805 1.452 5.518 0 10.006-4.486 10.01-10.002.002-2.673-1.03-5.185-2.907-7.063-1.878-1.878-4.383-2.912-7.058-2.913-5.523 0-10.012 4.488-10.016 10.005-.001 1.77.462 3.5 1.34 5.024l-1.012 3.693 3.78-1.002zM17.51 14.3c-.303-.15-1.793-.88-2.054-.975-.26-.1-.45-.15-.64.15-.19.3-.74.95-.91 1.15-.17.19-.34.22-.64.07-1.125-.565-1.92-1.01-2.686-2.324-.2-.34.2-.32.57-1.07.09-.18.04-.34-.02-.49-.07-.15-.64-1.54-.87-2.11-.23-.55-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44s1.05 2.84 1.2 3.04c.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.11.56-.08 1.79-.73 2.05-1.41.26-.68.26-1.27.18-1.41-.08-.12-.3-.2-.6-.35z"/>
                    </svg>
                  </div>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.budgetevcar.com${getCarUrl(car)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span>X (Twitter)</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.budgetevcar.com${getCarUrl(car)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span>Facebook</span>
                </a>

                <a
                  href={`mailto:?body=${encodeURIComponent(`https://www.budgetevcar.com${getCarUrl(car)}`)}`}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0249ad]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span>Email</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
