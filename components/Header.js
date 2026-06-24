'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ extraMobileActions, menuOpen: customMenuOpen, setMenuOpen: customSetMenuOpen }) {
  const pathname = usePathname();
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [newsBlogsOpen, setNewsBlogsOpen] = useState(false);

  const menuOpen = customMenuOpen !== undefined ? customMenuOpen : localMenuOpen;
  const setMenuOpen = customSetMenuOpen !== undefined ? customSetMenuOpen : setLocalMenuOpen;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm shadow-slate-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-12">
          <Link href="/" className="flex items-center gap-1 text-xl sm:text-2xl font-black text-[#1e3a8a] tracking-tight hover:opacity-90 transition">
            {/* INCREASED LOGO SIZE CONTAINER: 
              - Mobile/Default: Bumped from w-24 h-24 to w-36 h-24
              - SM: Bumped to w-40 h-24
              - MD: Bumped to w-44 h-24
              - LG/XL: Bumped to w-48 h-24
            */}
            <div className="relative w-24 h-14 sm:w-32 sm:h-16 md:w-32 md:h-16 lg:w-32 lg:h-16 overflow-hidden flex-shrink-0">
              <Image
                src="/logo/2.png"
                alt="BudgetEV Logo"
                fill
                className="object-contain"
                // Adjusted sizes prop to match the new max-widths for accurate performance budget optimization

                priority
              />
            </div>
          </Link>

          <nav className="hidden min-[960px]:flex items-center gap-2 p-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? "#1e40af" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer text-slate-600 font-medium">
                <span>Tools</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 hidden group-hover:block z-50 animate-fadeIn">
                <Link href="/tools/ev-emi-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  EV EMI Calculator
                </Link>
                <Link href="/tools/ev-running-cost-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  EV Trip Cost Calculator
                </Link>
                <Link href="/tools/ev-savings-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  EV Savings Calculator
                </Link>
                <Link href="/tools/ev-charging-time-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  EV Charging Time Calculator
                </Link>
              </div>
            </div>

            {/* News/Blogs Dropdown */}
            <div className="relative group py-2 px-2 ml-4">
              <button className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer text-slate-600 font-medium">
                <span>News/Blogs</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 hidden group-hover:block z-50 animate-fadeIn">
                <Link href="/news" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  News
                </Link>
                <Link href="/blog" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                  Blogs
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/find-ev"
            className="hidden min-[960px]:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm shadow-blue-900/10"
          >
            Get Started
          </Link>

          {extraMobileActions}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="min-[960px]:hidden p-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition focus:outline-none"
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
            className="min-[960px]:hidden bg-white border-t border-slate-100 shadow-xl px-4 pb-6 pt-3 absolute left-0 right-0 z-40"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${isActive
                      ? "bg-blue-50 text-[#1e3a8a]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a]"
                      }`}
                  >
                    <span>{link.label}</span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}

              {/* Tools accordion */}
              <div>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
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

              {/* News/Blogs accordion */}
              <div>
                <button
                  onClick={() => setNewsBlogsOpen(!newsBlogsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                >
                  <span>News/Blogs</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${newsBlogsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {newsBlogsOpen && (
                  <div className="pl-4 pr-2 flex flex-col gap-1 mt-1 border-l-2 border-slate-100">
                    <Link
                      href="/news"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      News
                    </Link>
                    <Link
                      href="/blog"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Blogs
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}