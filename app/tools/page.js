'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Calculator, Zap, Fuel, BatteryCharging, ArrowRight } from 'lucide-react';

export default function ToolsLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  const tools = [
    {
      name: 'EV EMI Calculator',
      desc: 'Estimate monthly loan repayments, down payment margins, and total accumulated interest costs.',
      href: '/tools/ev-emi-calculator',
      icon: <Calculator className="w-8 h-8 text-blue-600" />,
      tag: 'Popular',
      comingSoon: false,
    },
    {
      name: 'EV Savings Calculator',
      desc: 'Calculate total financial savings compared to traditional petrol and diesel vehicles.',
      href: '/tools/ev-savings-calculator',
      icon: <Fuel className="w-8 h-8 text-emerald-600" />,
      tag: 'Active',
      comingSoon: false,
    },
    {
      name: 'EV Running Cost Calculator',
      desc: 'Compare charging electrical expenses with standard internal combustion engine fuel expenses.',
      href: '/tools/ev-running-cost-calculator',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      tag: 'Coming Soon',
      comingSoon: true,
    },
    {
      name: 'EV Charging Time Calculator',
      desc: 'Determine charging durations under different electrical power supply levels and chargers.',
      href: '/tools/ev-charging-time-calculator',
      icon: <BatteryCharging className="w-8 h-8 text-indigo-500" />,
      tag: 'Active',
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col justify-between">
      <div>
        {/* ── HEADER ── */}
        <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-6 md:space-x-12">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">BudgetEV</Link>
              
              <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-slate-900 transition">
                    {link.label}
                  </Link>
                ))}

                {/* Tools Dropdown */}
                <div className="relative group py-2">
                  <button className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer text-[#1e3a8a] font-bold">
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

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 pb-6 pt-3 absolute left-0 right-0 z-40">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* Tools accordion */}
                <div>
                  <button
                    onClick={() => setToolsOpen(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#1e3a8a] hover:bg-slate-50 transition"
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
            </div>
          )}
        </header>

        {/* ── BREADCRUMBS ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-[#0249ad] transition">Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-bold">Tools</span>
          </div>
        </div>

        {/* ── LANDING MAIN ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          <div className="mb-10">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md mb-2">Ecosystem Directory</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV Financial & Utility Tools</h1>
            <p className="text-slate-500 text-sm font-medium mt-2 max-w-xl leading-relaxed">
              Explore our range of interactive smart calculators designed to simplify electric vehicle financing, savings analysis, and cost planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map(tool => (
              <div
                key={tool.name}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between group transition hover:shadow-md hover:border-blue-100"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                      {tool.icon}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${tool.comingSoon ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2 group-hover:text-[#0249ad] transition-colors">{tool.name}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">{tool.desc}</p>
                </div>

                <Link
                  href={tool.href}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition ${tool.comingSoon ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-[#0249ad] hover:text-white text-slate-700 border border-slate-200'}`}
                  onClick={(e) => tool.comingSoon && e.preventDefault()}
                >
                  <span>{tool.comingSoon ? 'Coming Soon' : 'Launch Tool'}</span>
                  {!tool.comingSoon && <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
