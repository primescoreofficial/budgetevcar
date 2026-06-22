'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { BatteryCharging, ArrowLeft } from 'lucide-react';

export default function ChargingTimeComingSoon() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('success');
    setEmail('');
  };

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
                    <Link href="/tools/ev-charging-time-calculator" className="block px-5 py-2.5 text-sm text-[#0249ad] bg-blue-50/50 font-bold transition">
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
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-[#0249ad] bg-blue-50/50"
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
            <Link href="/tools" className="hover:text-[#0249ad] transition">Tools</Link>
            <span>/</span>
            <span className="text-slate-700 font-bold">EV Charging Time Calculator</span>
          </div>
        </div>

        {/* ── LANDING MAIN ── */}
        <main className="max-w-xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0249ad] border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <BatteryCharging className="w-8 h-8 animate-pulse" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight mb-3">EV Charging Time Calculator</h1>
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md mb-6 border border-amber-100">Coming Soon</span>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            Estimate EV charging time based on battery capacity, initial charge status, charger type (AC/DC slow/fast), and vehicle onboard charger limits.
          </p>

          {/* Registration Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Get Notified on Launch</h4>
            
            {status === 'success' ? (
              <div className="text-xs font-bold text-emerald-600 py-4">
                ✅ You have successfully registered for the waitlist!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0249ad] focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="bg-[#0249ad] hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </div>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0249ad] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools Directory</span>
          </Link>
        </main>
      </div>

      <Footer />
    </div>
  );
}
