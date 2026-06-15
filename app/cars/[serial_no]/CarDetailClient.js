'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { getCarUrl } from '@/lib/queries';

export default function CarDetailClient({ car, relatedCars }) {
  // Mobile navigation expansion state hook tracker
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/calculator', label: 'Calculator' },
  ];

  return (
    <>
      {/* ── HEADER ── */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">BudgetEV</Link>
            
            {/* Desktop Link Layout panel */}
            <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900 transition">
                  {link.label}
                </Link>
              ))}
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
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="w-full h-[240px] sm:h-[400px] bg-slate-50 flex items-center justify-center">
                  <img
                    src={car.vehicle_image}
                    alt={car.model_name || car.detailed_name}
                    className="w-full h-full object-cover"
                  />
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

          {relatedCars.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">More from {car.brand}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedCars.map((relCar, index) => (
                  <motion.div
                    key={relCar.serial_no}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                        <img src={relCar.vehicle_image} alt={relCar.model_name || relCar.detailed_name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{relCar.model_name || relCar.detailed_name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{relCar.variant_name || relCar.body_type}</p>
                      {relCar.battery_capacity && (
                        <p className="text-xs font-bold text-[#0249ad] mt-1">{relCar.battery_capacity} kWh</p>
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