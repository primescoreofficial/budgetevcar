'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Zap, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FooterQueryForm from './FooterQueryForm';

export default function Footer({ brands = [], bodyTypes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const triggerRef = useRef(null);

  const displayBrands = brands.length > 0
    ? brands.slice(0, 5)
    : ['Tata', 'MG', 'Mahindra', 'BYD', 'Hyundai'];

  const displayBodyTypes = ['Hatchback', 'Micro SUV', 'Compact SUV', 'Coupe SUV', 'SUV'];

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/tools', label: 'Tools' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close bottom sheet
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const openSheet = () => {
    setIsOpen(true);
  };

  const closeSheet = () => {
    setIsOpen(false);
    // Restore focus to trigger button
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleSuccess = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      closeSheet();
    }, 2000);
  };

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-100 pt-16 pb-12 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col flex-wrap gap-8 md:gap-12 pb-12 border-b border-slate-900">

          {/* Brand Column */}
          <div className="w-full space-y-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="relative w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 flex-shrink-0">
                <Image
                  src="/logo/1.png"
                  alt="BudgetEV Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  priority
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              {"India's"} most trusted platform for finding, comparing, and analyzing electric vehicles within your budget. Simplifying your switch to green energy.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3.5 pt-2">
              {['twitter', 'facebook', 'linkedin', 'instagram'].map((platform) => (
                <a key={platform} href={`#${platform}`} className="text-slate-500 hover:text-white transition-colors duration-200" aria-label={platform}>
                  <span className="capitalize text-xs font-bold">{platform}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Wrapper Grid */}
          <div className="w-full flex flex-wrap justify-between gap-8">
            {/* Quick Links Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* EV Categories Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">EV Categories</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {displayBodyTypes.map((type) => (
                  <li key={type}>
                    <Link
                      href={`/find-ev?bodyType=${encodeURIComponent(type)}`}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {type}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* News Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">News</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/news', label: 'Latest EV News' },
                  { href: '/news', label: 'Industry Updates' },
                  { href: '/news', label: 'New Launches' },
                  { href: '/news', label: 'Charging Network Updates' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blogs Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Blogs</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/blog/category/buying-guide', label: 'EV Buying Guides' },
                  { href: '/blog/category/analysis', label: 'EV Comparisons' },
                  { href: '/blog/category/charging', label: 'Charging Guides' },
                  { href: '/blog/category/technology', label: 'Battery & Technology' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tools</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/tools/ev-emi-calculator', label: 'EMI Calculator' },
                  { href: '/tools/ev-running-cost-calculator', label: 'Trip Cost Calculator' },
                  { href: '/tools/ev-savings-calculator', label: 'Savings Calculator' },
                  { href: '/tools/ev-charging-time-calculator', label: 'Charging Calculator' }
                ].map((tool) => (
                  <li key={tool.label}>
                    <Link
                      href={tool.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {tool.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px] text-left">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact</h4>

              {/* Desktop View Form Container */}
              <div className="hidden md:block pt-2">
                <FooterQueryForm />
              </div>

              {/* Mobile View Contact support placeholder CTA */}
              <div className="md:hidden pt-1">
                <p
                  ref={triggerRef}
                  onClick={openSheet}
                  className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5 space-y-2.5 text-xs font-semibold "
                >
                  Submit a Query?
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} BudgetEV. All rights reserved.</p>

          <div className="relative group">
            <button
              onClick={handleScrollToTop}
              aria-label="Back to Top"
              className="w-10 h-10 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:text-white flex items-center justify-center shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:hover:transform-none"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            
            {/* Premium Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out origin-bottom flex flex-col items-center z-30">
              <div className="bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                Want To Go To Top?
              </div>
              <div className="w-1.5 h-1.5 bg-slate-900 border-r border-b border-slate-800 rotate-45 -mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Made for {"India's"} EV revolution</span>
            <Zap className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM SHEET MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sheet-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex items-end justify-center"
          >
            {/* Backdrop Fade & Blur */}
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px]"
            />

            {/* Bottom Sheet Slide Up */}
            <motion.div
              key="sheet-content"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-slate-950 border-t border-slate-900 rounded-t-[2rem] shadow-2xl p-6 z-10 pb-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
            >
              {/* Drag Handle Indicator */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Header inside Bottom Sheet */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 id="sheet-title" className="text-base font-black text-slate-100 uppercase tracking-wider">Contact Support</h3>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Please fill out your query below.</p>
                </div>
                <button
                  onClick={closeSheet}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-slate-800"
                  aria-label="Close form"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Embedded Existing Form */}
              <FooterQueryForm onSuccess={handleSuccess} isMobileSheet={isOpen} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST MESSAGE */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-semibold"
          >
            <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Query Submitted Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}