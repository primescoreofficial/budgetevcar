'use client';

import { subscribeNewsletter } from '@/lib/newsletter';
import { getCarUrl } from '@/lib/queries';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring, useVelocity, useAnimationFrame } from 'framer-motion';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
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
    const isTrending = index % 3 === 0; // Show trending badge on some cards
    return (
      <motion.div
        key={car.serial_no}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between snap-center min-w-[82vw] max-w-[340px] sm:min-w-0 sm:max-w-none relative group/card"
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
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col min-w-[82vw] max-w-[340px] sm:min-w-0 sm:max-w-none snap-center"
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
    image: "/ad/be6.png",
    slug: "mahindra-be-6",
    href: "/cars/mahindra-be-6",
    title: "Mahindra BE 6"
  },
  {
    image: "/ad/i4.webp",
    slug: "bmw-i4",
    href: "/cars/bmw-i4",
    title: "BMW i4"
  },
  {
    image: "/ad/windsor.jpg",
    slug: "mg-jsw-mg-motor--windsor-ev",
    href: "/cars/mg-jsw-mg-motor--windsor-ev",
    title: "MG Windsor EV"
  },
  {
    image: "/ad/urbancruiser.webp",
    slug: "toyota-urban-cruiser-ebella",
    href: "/cars/toyota-urban-cruiser-ebella",
    title: "Toyota Urban Cruiser ebella"
  },
  {
    image: "/ad/xev9s.webp",
    slug: "mahindra-xev-9s",
    href: "/cars/mahindra-xev-9s",
    title: "mahindra-xev-9s"
  }
];

// ─── EV buying guides data ──────────────────────────────────────────────────
const guides = [
  {
    id: 'charging',
    title: 'How EV Charging Works',
    description: 'Understand DC fast charging vs AC home wallbox charging, connection types, and speeds.',
    tag: 'Charging Guide',
    videoId: 'XU2xd2b-GTs'
  },
  {
    id: 'range',
    title: 'Understanding EV Range',
    description: 'Learn about WLTP vs MIDC certification range, battery efficiency, and real-world range factors.',
    tag: 'Range Guide',
    videoId: '-UbDbsle_Yk'
  },
  {
    id: 'battery',
    title: 'Battery Health & Longevity',
    description: 'Best practices for NMC and LFP batteries, depth of discharge, temperature impact, and degradation.',
    tag: 'Battery Life',
    videoId: 'eMWLuxUfK5I'
  },
  {
    id: 'cost',
    title: 'EV Ownership Cost Explained',
    description: 'A breakdown of electricity costs, maintenance, parts replacement, and long-term savings.',
    tag: 'Cost Analysis',
    videoId: 'DJUk8zNMq6U'
  }
];

// ─── EV reviews data ────────────────────────────────────────────────────────
const reviewsRow1 = [
  {
    name: "Rahul Sharma",
    initials: "RS",
    city: "Jaipur",
    profession: "Software Engineer",
    label: "EV Enthusiast",
    rating: 5,
    review: "BudgetEV helped me compare charging costs and range before buying my EV.",
    model: "Tata Nexon EV"
  },
  {
    name: "Priya Verma",
    initials: "PV",
    city: "Pune",
    profession: "Doctor",
    label: "Community Member",
    rating: 5,
    review: "The comparison tools made choosing the right electric SUV much easier.",
    model: "MG Windsor EV"
  },
  {
    name: "Arjun Patel",
    initials: "AP",
    city: "Ahmedabad",
    profession: "Business Owner",
    label: "EV Buyer",
    rating: 5,
    review: "I discovered charging stations during a long trip using BudgetEV.",
    model: "BYD Atto 3"
  },
  {
    name: "Sneha Kapoor",
    initials: "SK",
    city: "Delhi",
    profession: "Teacher",
    label: "BudgetEV User",
    rating: 5,
    review: "The EV guides explained battery health in a very simple way.",
    model: "Mahindra BE 6"
  },
  {
    name: "Amit Mishra",
    initials: "AM",
    city: "Indore",
    profession: "Consultant",
    label: "Community Member",
    rating: 5,
    review: "The charging station finder is highly accurate and saved me multiple times.",
    model: "Tata Punch EV"
  }
];

const reviewsRow2 = [
  {
    name: "Vikram Singh",
    initials: "VS",
    city: "Udaipur",
    profession: "Chartered Accountant",
    label: "EV Enthusiast",
    rating: 5,
    review: "Clean design, accurate information, and excellent EV comparisons.",
    model: "Hyundai Ioniq 5"
  },
  {
    name: "Neha Joshi",
    initials: "NJ",
    city: "Bengaluru",
    profession: "Product Manager",
    label: "Community Member",
    rating: 5,
    review: "The ownership cost calculator was surprisingly useful.",
    model: "Tata Punch EV"
  },
  {
    name: "Rohan Mehta",
    initials: "RM",
    city: "Hyderabad",
    profession: "Consultant",
    label: "EV Buyer",
    rating: 5,
    review: "A must-visit tool before planning any EV purchase in India.",
    model: "Kia EV6"
  },
  {
    name: "Karan Johar",
    initials: "KJ",
    city: "Chandigarh",
    profession: "Student",
    label: "BudgetEV User",
    rating: 5,
    review: "Calculated my daily college commute savings in seconds. Brilliant tool!",
    model: "Tata Tiago EV"
  },
  {
    name: "Suresh Raina",
    initials: "SR",
    city: "Surat",
    profession: "Business Owner",
    label: "EV Buyer",
    rating: 5,
    review: "Comparing multiple battery packs side by side made my choice extremely clear.",
    model: "MG Windsor EV"
  }
];

function ReviewCard({ review }) {
  return (
    <div
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-[320px] sm:w-[350px] shrink-0 whitespace-normal select-none"
    >
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          {/* Avatar Circle */}
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0249ad] font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
            {review.initials}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{review.name}</h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                {review.profession}
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                {review.city}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex gap-0.5 text-amber-400 mb-3">
          {[...Array(review.rating)].map((_, idx) => (
            <svg key={idx} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
          &ldquo;{review.review}&rdquo;
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[9px] font-extrabold text-[#0249ad] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
          {review.label}
        </span>
        {review.model && (
          <span className="text-[10px] text-slate-400 font-bold">
            {review.model}
          </span>
        )}
      </div>
    </div>
  );
}

function ReviewsSection() {
  const allReviews = [...reviewsRow1, ...reviewsRow2];
  const doubledReviews = [...allReviews, ...allReviews];

  return (
    <LazySection id="reviews" className="mb-16">
      <section className="overflow-hidden py-12 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/80">
        <div className="max-w-7xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Trusted by EV Buyers Across India
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-xl mx-auto leading-relaxed">
            Real experiences from professionals, families, and daily commuters exploring electric mobility.
          </p>
        </div>

        {/* Style injection for prefers-reduced-motion fallback, marquee keyframes, and GPU layer promotion */}
        <style>{`
          .marquee-container {
            position: relative;
            width: 100%;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
            mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
          }
          .marquee-track {
            display: flex;
            gap: 1.5rem;
            width: max-content;
            will-change: transform;
            animation: marquee-scroll 45s linear infinite;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          @keyframes marquee-scroll {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-50%, 0, 0);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .marquee-track {
              transform: none !important;
              will-change: auto !important;
              animation: none !important;
              overflow-x: auto !important;
              white-space: nowrap !important;
            }
          }
        `}</style>
        {/* Single Row Infinite Marquee Container */}
        <div className="marquee-container py-2">
          <div className="marquee-track">
            {doubledReviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      </section>
    </LazySection>
  );
}

function VideoThumbnail({ videoId, alt }) {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center select-none"
    >
      <div className="relative flex flex-col items-center">
        {/* Blue Glow Backdrop Pulse */}
        <motion.div
          initial={{ opacity: 0.15, scale: 0.95 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.95, 1.05, 0.95] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="absolute w-40 h-40 rounded-full bg-blue-100/50 blur-2xl -z-10"
        />

        {/* Logo/Brand Name & Subtitle */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-full border border-slate-100 shadow-sm flex-shrink-0"
          >
            <Image src="/logo/2.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 80px, 96px" priority />
          </motion.div>
        </div>

        {/* Thin, elegant charging line animation */}
        <div className="w-24 h-[1px] bg-slate-100 overflow-hidden relative mt-4">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.0,
              ease: "easeInOut",
              repeat: Infinity
            }}
            className="absolute h-full w-1/2 bg-[#0249ad]"
          />
        </div>
      </div>
    </motion.div>
  );
}
// ─── Brand Card Component ───────────────────────────────────────────────────
function BrandCard({ brand }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/find-ev?brand=${brand.slug}`}
      className="flex flex-col items-center justify-center bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md text-slate-700 hover:text-[#0249ad] p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.04] shadow-sm cursor-pointer group"
    >
      {brand.logo && !imageError ? (
        <div className="relative w-12 h-12 mb-3 flex items-center justify-center overflow-hidden">
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            fill
            sizes="48px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            priority={false}
          />
        </div>
      ) : null}
      <span className="text-xs font-extrabold tracking-wide">{brand.name}</span>
    </Link>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomeClient({ cars, brands, bodyTypes, latestBlogs = [], latestNews = [] }) {
  const [activeCategory, setActiveCategory] = useState('SUV');
  const [searchCriteria, setSearchCriteria] = useState('budget');
  const [activeTab, setActiveTab] = useState('new');
  const [visibleCount, setVisibleCount] = useState(4);

  const [selectedPrimary, setSelectedPrimary] = useState('all');
  const [selectedSecondary, setSelectedSecondary] = useState('all');

  const [activeVideo, setActiveVideo] = useState(null);
  const modalRef = useRef(null);
  const discoverContainerRef = useRef(null);

  const [showSplash, setShowSplash] = useState(null);
  const [hasScrolledSearched, setHasScrolledSearched] = useState(false);
  const [hasScrolledDiscover, setHasScrolledDiscover] = useState(false);

  const handleScrollSearched = (e) => {
    if (e.currentTarget.scrollLeft > 10 && !hasScrolledSearched) {
      setHasScrolledSearched(true);
    }
  };

  const handleScrollDiscover = (e) => {
    if (e.currentTarget.scrollLeft > 10 && !hasScrolledDiscover) {
      setHasScrolledDiscover(true);
    }
  };

  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('budgetev_has_visited');
      if (!hasVisited) {
        setShowSplash(true);
        const timer = setTimeout(() => {
          localStorage.setItem('budgetev_has_visited', 'true');
          setShowSplash(false);
        }, 1400); // 1.4 seconds. Since exit animation duration is 0.4s, total is exactly 1.8s!
        return () => clearTimeout(timer);
      }
      setShowSplash(false);
    } catch (e) {
      // Fallback
      setShowSplash(false);
    }
  }, []);

  // Prevent scroll when modal or splash is open
  useEffect(() => {
    if (activeVideo || showSplash === true) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeVideo, showSplash]);

  // Escape key closes modal
  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideo]);

  // Focus modal on mount
  useEffect(() => {
    if (activeVideo && modalRef.current) {
      modalRef.current.focus();
    }
  }, [activeVideo]);

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

  const handleLoadMore = () => {
    const currentCount = visibleCars.length;
    setVisibleCount(prev => prev + 4);
    setTimeout(() => {
      if (discoverContainerRef.current) {
        const children = discoverContainerRef.current.children;
        if (children && children[currentCount]) {
          children[currentCount].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }
    }, 100);
  };
  const handleCategoryChange = (cat) => setActiveCategory(cat);

  if (showSplash === null) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Header />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 main-container-reveal">

            {/* ── HERO ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 pt-6">
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

              <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[300px] lg:min-h-[400px] py-6">
                {/* Float & Fade-in Motion wrapper */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: [0, -12, 0]
                  }}
                  className="relative w-full flex items-center justify-center z-10"
                >
                  <Link href="/cars/mahindra-be-6?v=32" className="relative w-full max-w-[350px] sm:max-w-[550px] lg:max-w-[700px] aspect-[16/10] block cursor-pointer">
                    <Image
                      src="/ad/be6transparentbg.png"
                      alt="Mahindra BE 6"
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 640px) 350px, (max-width: 1024px) 550px, 700px"
                    />
                  </Link>
                </motion.div>

                {/* Soft shadow underneath the vehicle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.6, 0.4, 0.6],
                    scale: [1, 0.9, 1]
                  }}
                  transition={{
                    opacity: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                    scale: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                    duration: 0.8
                  }}
                  className="w-[70%] h-4 bg-slate-950/10 rounded-[100%] blur-lg -mt-3 z-0"
                />
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

                <Link href="/cars/tata-motors-sierra-ev" className="w-full lg:w-[62%] relative overflow-hidden min-h-[250px] lg:min-h-full block cursor-pointer">
                  <img src='/ad/sierra.png' alt='Banner Image' className="absolute inset-0 w-full h-full lg:object-cover md:object-cover" />
                </Link>
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
                <div className="flex gap-2 mb-8 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                  {[
                    {
                      id: 'SUV',
                      name: '[SUV & Crossover]',
                      shortName: 'SUV',
                      svg: (
                        <svg className="w-10 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.0} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 14h2a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h2V9.5L18.5 7h-9L7 10H3v4z" />
                          <circle cx="7" cy="14" r="2" />
                          <circle cx="17" cy="14" r="2" />
                          <path d="M10 5.5h7" />
                        </svg>
                      )
                    },
                    {
                      id: 'Hatchback',
                      name: '[Hatchback & Compact]',
                      shortName: 'Hatchback',
                      svg: (
                        <svg className="w-10 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.0} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 15h2a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h2v-3.5L18 8h-7L7.5 11.5H3V15z" />
                          <circle cx="7" cy="15" r="2" />
                          <circle cx="17" cy="15" r="2" />
                        </svg>
                      )
                    },
                    {
                      id: 'Sedan',
                      name: '[Sedan & Saloon]',
                      shortName: 'Sedan',
                      svg: (
                        <svg className="w-10 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.0} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 14h3a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h3v-2.5l-2.5-3h-9L8 11.5H2V14z" />
                          <circle cx="7" cy="14" r="2" />
                          <circle cx="17" cy="14" r="2" />
                        </svg>
                      )
                    },
                    {
                      id: 'Luxury',
                      name: '[Luxury & Premium]',
                      shortName: 'Luxury',
                      svg: (
                        <svg className="w-10 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.0} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 14h3a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h3v-3l-3.5-3.5h-8L5.5 11H2v3z" />
                          <circle cx="7" cy="14" r="2" />
                          <circle cx="17" cy="14" r="2" />
                          <path d="M9 11h5" />
                        </svg>
                      )
                    }
                  ].map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${isActive ? 'bg-[#0249ad] text-white border-[#0249ad] shadow-md shadow-blue-100' : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-slate-50'}`}
                      >
                        <div className={`hidden sm:block mb-3 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-[#0249ad]'}`}>
                          {cat.svg}
                        </div>
                        <span className="text-[11px] sm:text-xs font-extrabold tracking-wide">{cat.shortName}</span>
                        <span className="hidden sm:block text-[10px] font-extrabold tracking-wide opacity-70 mt-0.5">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Swipe Indicator */}
                {currentCategoryCars.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hasScrolledSearched ? 0 : 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-4 sm:hidden"
                  >
                    <motion.span
                      animate={{ x: [-3, 0, -3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      ←
                    </motion.span>
                    <span>Swipe for more cars</span>
                    <motion.span
                      animate={{ x: [3, 0, 3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                )}

                <div
                  onScroll={handleScrollSearched}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-auto overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:px-0 sm:mx-0 sm:pb-0"
                >
                  <AnimatePresence mode="wait">
                    {currentCategoryCars.slice(0, 4).map((car, i) => (
                      <CarCard key={car.serial_no} car={car} index={i} variant="category" />
                    ))}
                  </AnimatePresence>
                  {currentCategoryCars.length === 0 && (
                    <div className="col-span-4 text-center py-12 text-slate-400 text-sm font-medium">No cars found in this category.</div>
                  )}
                </div>

                {/* ── QUICK COMPARE STRIP ── hidden on mobile, visible sm and above */}
                <div className="hidden sm:flex mt-8 pt-6 border-t border-slate-100 flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <span className="text-[#0249ad]"></span> Compare Top EVs
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

                {/* Mobile Swipe Indicator */}
                {visibleCars.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hasScrolledDiscover ? 0 : 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-4 sm:hidden"
                  >
                    <motion.span
                      animate={{ x: [-3, 0, -3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      ←
                    </motion.span>
                    <span>Swipe for more cars</span>
                    <motion.span
                      animate={{ x: [3, 0, 3] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                )}

                <div
                  ref={discoverContainerRef}
                  onScroll={handleScrollDiscover}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-auto overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 sm:px-0 sm:mx-0 sm:pb-0"
                >
                  <AnimatePresence>
                    {visibleCars.map((car, i) => (
                      <CarCard key={car.serial_no} car={car} index={i} variant="grid" />
                    ))}
                  </AnimatePresence>

                  {/* Mobile Load More Card */}
                  {hasMore && (
                    <div
                      onClick={handleLoadMore}
                      className="sm:hidden group/loadmore flex flex-col items-center justify-center bg-white border-2 border-dashed border-blue-200 hover:border-[#0249ad] rounded-3xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer min-w-[82vw] max-w-[340px] snap-center hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-[#0249ad] text-white flex items-center justify-center transition-transform duration-300 group-hover/loadmore:scale-110 mb-4 shadow-md">
                        <svg className="w-6 h-6 transform group-hover/loadmore:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                        Load More Vehicles
                      </h3>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                        Explore additional EV options
                      </p>
                    </div>
                  )}
                </div>

                {hasMore && (
                  <div className="hidden sm:flex justify-center mt-10">
                    <button onClick={handleLoadMore} className="inline-flex items-center gap-2 bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all duration-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>Load More ({cars.length - visibleCount} remaining)</button>
                  </div>
                )}

                {!hasMore && cars.length > 4 && (
                  <p className="text-center mt-8 text-xs font-bold text-slate-300 uppercase tracking-wider">✓ All {cars.length} EVs loaded</p>
                )}
              </section>
            </LazySection>

            {/* ── FEATURED BRANDS ── */}
            <LazySection className="my-16">
              <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 text-center uppercase tracking-widest mb-6">Explore Top EV Brands</h3>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-9 lg:gap-4">
                  {[
                    { name: 'Tata', slug: 'tata-motors', logo: '/brands/tata.avif' },
                    { name: 'Mahindra', slug: 'mahindra', logo: '/brands/mahindra.webp' },
                    { name: 'MG', slug: 'mg-jsw-mg-motor-', logo: '/brands/mg.webp' },
                    { name: 'BYD', slug: 'byd', logo: '/brands/byd.webp' },
                    { name: 'Hyundai', slug: 'hyundai', logo: '/brands/hyundai.webp' },
                    { name: 'Kia', slug: 'kia', logo: '/brands/kia.webp' },
                    { name: 'BMW', slug: 'bmw', logo: '/brands/bmw.png' },
                    { name: 'Mercedes', slug: 'mercedes-benz', logo: '/brands/mercedes.webp' },
                    { name: 'Toyota', slug: 'toyota', logo: '/brands/toyota.webp' }
                  ].map((b, i) => (
                    <BrandCard key={i} brand={b} />
                  ))}
                </div>
              </section>
            </LazySection>

            {/* ── CUSTOMER REVIEWS MARQUEE ── */}
            <ReviewsSection />

            {/* ── EV BUYING GUIDE ── */}
            <LazySection id="guides" className="mb-16">
              <section>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">New to Electric Vehicles?</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Our comprehensive guides help simplify the switch to electric mobility</p>
                  </div>
                </div>

                {/* Mobile Swipe Indicator */}
                <div className="flex justify-center items-center gap-1.5 text-[11px] font-bold text-slate-400 sm:hidden mb-4 uppercase tracking-wider">
                  <motion.span
                    animate={{ x: [-3, 0, -3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    ←
                  </motion.span>
                  <span>Swipe for more guides</span>
                  <motion.span
                    animate={{ x: [3, 0, 3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-auto overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:px-0 sm:mx-0 sm:pb-0">
                  {guides.map((guide) => (
                    <div
                      key={guide.id}
                      onClick={() => setActiveVideo(guide)}
                      className="group bg-white border border-slate-100 hover:border-blue-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 min-w-[82vw] max-w-[340px] sm:min-w-0 sm:max-w-none snap-center"
                    >
                      <div>
                        {/* 16:9 Video Thumbnail Wrapper */}
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                          <VideoThumbnail videoId={guide.videoId} alt={guide.title} />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white text-[#0249ad] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col">
                          <div className="mb-3">
                            <span className="text-[10px] font-extrabold text-[#0249ad] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                              {guide.tag}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm mb-2 group-hover:text-[#0249ad] transition-colors duration-300">
                            {guide.title}
                          </h3>
                          <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                            {guide.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <button className="text-xs font-bold text-[#0249ad] hover:text-blue-800 transition-colors flex items-center gap-1.5 mt-auto">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Watch Guide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </LazySection>

            {/* ── LATEST EV NEWS ── */}
            {latestNews && latestNews.length > 0 && (
              <LazySection className="mb-16">
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Latest EV News</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Stay updated with the latest happenings in the Indian EV ecosystem</p>
                    </div>
                    <Link href="/news" className="text-xs font-bold text-[#0249ad] hover:underline whitespace-nowrap">
                      View All News →
                    </Link>
                  </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-auto overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:px-0 sm:mx-0 sm:pb-0">
                    {latestNews.map((item) => (
                      <article
                        key={item.slug}
                        className="group bg-white border border-slate-100 hover:border-blue-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-w-[82vw] max-w-[340px] sm:min-w-0 sm:max-w-none snap-center"
                      >
                        <div>
                          <div className="aspect-video bg-slate-50 relative overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                            {item.category && (
                              <span className="absolute top-3 left-3 bg-orange-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5">{item.date}</span>
                            <h3 className="font-extrabold text-slate-900 text-sm mb-2 group-hover:text-[#0249ad] transition-colors line-clamp-2 leading-snug">
                              <Link href={`/news/${item.slug}`}>{item.title}</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-1">
                          <Link
                            href={`/news/${item.slug}`}
                            className="text-xs font-bold text-[#0249ad] hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                          >
                            Read Article →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </LazySection>
            )}

            {/* ── LATEST EV GUIDES & BLOGS ── */}
            {latestBlogs && latestBlogs.length > 0 && (
              <LazySection className="mb-16">
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Latest EV Guides & Blogs</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Expert buying guides, charging specs, and detailed total cost analyses</p>
                    </div>
                    <Link href="/blog" className="text-xs font-bold text-[#0249ad] hover:underline whitespace-nowrap">
                      View All Blogs →
                    </Link>
                  </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-auto overscroll-x-contain scroll-pl-4 px-4 -mx-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:px-0 sm:mx-0 sm:pb-0">
                    {latestBlogs.map((post) => (
                      <article
                        key={post.slug}
                        className="group bg-white border border-slate-100 hover:border-blue-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-w-[82vw] max-w-[340px] sm:min-w-0 sm:max-w-none snap-center"
                      >
                        <div>
                          <div className="aspect-video bg-slate-50 relative overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                            {post.category && (
                              <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                {post.category}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-[9px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>{post.readingTime} read</span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-sm mb-2 group-hover:text-[#0249ad] transition-colors line-clamp-2 leading-snug">
                              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-2">
                              {post.description}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-xs font-bold text-[#0249ad] hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                          >
                            Read Guide →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </LazySection>
            )}

            {/* ── SAVINGS CTA ── */}
            <LazySection className="mt-12">
              <section className="max-w-7xl mx-auto px-6 mb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                  {/* Left Content */}
                  <div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                      The Future is{" "}
                      <span className="text-emerald-500">Electric</span>
                    </h2>

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

          {/* ── LIGHTBOX MODAL ── */}
          <AnimatePresence>
            {activeVideo && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveVideo(null)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                  ref={modalRef}
                  tabIndex={-1}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl relative z-10 border border-slate-100 focus:outline-none"
                >
                  {/* Header/Close bar */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#0249ad] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-1 inline-block">
                        {activeVideo.tag}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {activeVideo.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveVideo(null)}
                      aria-label="Close video"
                      className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Video Player aspect-video */}
                  <div className="aspect-video w-full bg-black relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                      title={activeVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ── FOOTER ── */}
          <Footer brands={brands} bodyTypes={bodyTypes} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
