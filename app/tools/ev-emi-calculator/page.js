'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Footer from '@/components/Footer';
import { Zap, Share2, Calculator, TrendingUp, ShieldCheck, HelpCircle, AlertTriangle, Search, Lightbulb, RefreshCw } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

function CalculatorContent() {
  const searchParams = useSearchParams();

  // Inputs
  const [price, setPrice] = useState(1500000);
  const [downPayment, setDownPayment] = useState(200000);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(5);

  // States
  const [shareCopied, setShareCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Parse URL query parameters on mount
  useEffect(() => {
    const p = searchParams.get('price');
    const d = searchParams.get('down');
    const r = searchParams.get('rate');
    const y = searchParams.get('years');

    if (p) setPrice(Number(p));
    if (d) setDownPayment(Number(d));
    if (r) setInterestRate(Number(r));
    if (y) setTenure(Number(y));
  }, [searchParams]);

  // Validation
  useEffect(() => {
    if (downPayment > price) {
      setValidationError('Down payment cannot exceed the car price.');
    } else if (interestRate < 0) {
      setValidationError('Interest rate cannot be negative.');
    } else if (tenure < 1) {
      setValidationError('Loan tenure must be at least 1 year.');
    } else {
      setValidationError('');
    }
  }, [price, downPayment, interestRate, tenure]);

  // Calculations
  const principal = price - downPayment;
  const monthlyRate = interestRate / 12 / 100;
  const numberOfMonths = tenure * 12;

  let emi = 0;
  if (principal > 0 && interestRate > 0) {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
          (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
  } else if (principal > 0) {
    emi = principal / numberOfMonths;
  }

  const totalPayment = emi * numberOfMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  const downPaymentPercent = price > 0 ? Math.round((downPayment / price) * 100) : 0;

  // Chart Configuration
  const chartData = {
    labels: ['Principal Amount', 'Interest Amount'],
    datasets: [
      {
        data: [principal > 0 ? principal : 0, totalInterest],
        backgroundColor: ['#0249ad', '#93c5fd'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ₹${Math.round(context.raw).toLocaleString('en-IN')}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Quick Presets
  const applyPreset = (presetPrice) => {
    setPrice(presetPrice);
    setDownPayment(Math.round(presetPrice * 0.15)); // 15% Down Payment default
  };

  // Share URL Generator
  const shareCalculation = () => {
    const shareUrl = `${window.location.origin}/tools/ev-emi-calculator?price=${price}&down=${downPayment}&rate=${interestRate}&years=${tenure}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // Lead Generation Budget Path
  const getFindEvUrl = () => {
    if (price <= 1000000) return '/find-ev?budget=under-10';
    if (price <= 1500000) return '/find-ev?budget=10-15';
    if (price <= 2000000) return '/find-ev?budget=15-20';
    return '/find-ev?budget=above-20';
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* ── HEADER ── */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <Link href="/" className="flex items-center gap-1 text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden flex-shrink-0">
                <Image src="/logo/newlogo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 48px, 56px" priority />
              </div>
            </Link>
            
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
                  <Link href="/tools/ev-emi-calculator" className="block px-5 py-2.5 text-sm text-[#0249ad] bg-blue-50/50 font-bold transition">
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

        {/* Mobile Dropdown Menu */}
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

              {/* Tools Accordion */}
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
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-[#0249ad] bg-blue-50/50"
                    >
                      EV EMI Calculator
                    </Link>
                    <Link
                      href="/tools/ev-running-cost-calculator"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      EV Trip Cost Calculator
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
          <Link href="/tools" className="hover:text-[#0249ad] transition">Tools</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">EV EMI Calculator</span>
        </div>
      </div>

      {/* ── CALCULATOR BODY ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0249ad] text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-1.5 rounded-full mb-4 border border-blue-100/60 shadow-sm">
            <div className="relative w-4.5 h-4.5 overflow-hidden rounded-full border border-blue-100 flex-shrink-0">
              <Image src="/logo/newlogo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="18px" />
            </div>
            <span>Finance Tools</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV EMI Calculator</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl leading-relaxed">
            Estimate your monthly loan payments, interest breakdown, and optimize your down payment scheme for a premium electric vehicle purchase.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6">Loan Configuration</h2>

            {/* Validation Display */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-750 shrink-0" /> {validationError}
              </div>
            )}

            <div className="space-y-6">
              {/* Car Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="car-price">Car Price (₹)</label>
                  <input
                    id="car-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                    className="w-36 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="50000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Car Price Slider"
                />
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="down-payment">Down Payment (₹)</label>
                  <input
                    id="down-payment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                    className="w-36 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Down Payment Slider"
                />
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="interest-rate">Interest Rate (%)</label>
                  <input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Interest Rate Slider"
                />
              </div>

              {/* Loan Tenure */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="loan-tenure">Tenure (Years)</label>
                  <input
                    id="loan-tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Tenure Slider"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">Quick Presets</h3>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '₹10L EV', val: 1000000 },
                  { label: '₹15L EV', val: 1500000 },
                  { label: '₹20L EV', val: 2000000 },
                  { label: '₹25L EV', val: 2500000 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.val)}
                    className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-extrabold text-slate-600 hover:text-[#0249ad] transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results + Chart Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* KPI Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly EMI (Largest) */}
              <div className="sm:col-span-2 bg-white border-2 border-[#0249ad] rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="absolute top-4 right-4 text-xs font-extrabold text-[#0249ad] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Primary</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly EMI</p>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
                  ₹{Math.round(emi).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-2">Estimated payment to be paid per month.</p>
              </div>

              {/* Total Interest (Medium) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Interest</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  ₹{Math.round(totalInterest).toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">Accumulated interest over {tenure} years.</p>
              </div>

              {/* Total Payment (Medium) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payment</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  ₹{Math.round(totalPayment).toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">Principal + Interest sum total.</p>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Payment Breakdown</h3>
              
              <div className="relative w-56 h-56 flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
                
                {/* Center Text */}
                <div className="absolute text-center select-none pointer-events-none">
                  <span className="block text-xl font-black text-slate-900">₹{Math.round(emi).toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Monthly EMI</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#0249ad] rounded-full" />
                  <span>Principal (₹{Math.round(principal).toLocaleString('en-IN')})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#93c5fd] rounded-full" />
                  <span>Interest (₹{Math.round(totalInterest).toLocaleString('en-IN')})</span>
                </div>
              </div>
            </div>

            {/* Share and Action Triggers */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <button
                onClick={shareCalculation}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-[#0249ad] py-3.5 rounded-2xl text-xs font-extrabold transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareCopied ? 'Copied Link!' : 'Share Calculation'}</span>
              </button>

              {/* Conversion Lead Funnel */}
              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4.5 text-center">
                <p className="text-xs font-bold text-slate-700">Looking for the best EV within your budget?</p>
                <Link
                  href={getFindEvUrl()}
                  className="mt-3 w-full bg-[#0249ad] hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition block"
                >
                  Find Matching EVs →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Insight Section */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">Loan Analysis Insight</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-slate-600">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
              <span>You pay <strong className="text-slate-900">₹{Math.round(totalInterest).toLocaleString('en-IN')}</strong> in interest over <strong className="text-slate-900">{tenure} years</strong>.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Down payment covers <strong className="text-slate-900">{downPaymentPercent}%</strong> of the vehicle cost.</span>
            </div>
          </div>
        </div>

        {/* Trust & FAQ Block */}
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Why Use Our EV EMI Calculator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { title: 'Estimate Monthly Budget', desc: 'Forecast monthly outgoings accurately and structure your loan tenure values.', icon: <TrendingUp className="w-6 h-6 text-[#0249ad]" /> },
              { title: 'Compare EV Financing', desc: 'Tweak interest rates and down payments side-by-side to find optimized loan schemes.', icon: <RefreshCw className="w-6 h-6 text-[#0249ad]" /> },
              { title: 'Understand Total Cost', desc: 'Identify absolute accumulated interest payment figures before signing financing documents.', icon: <Search className="w-6 h-6 text-[#0249ad]" /> },
              { title: 'Plan EV Purchase Better', desc: 'Pre-calculate down payment brackets to maximize dynamic loan approval odds.', icon: <Lightbulb className="w-6 h-6 text-[#0249ad]" /> }
            ].map(f => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="mb-3">{f.icon}</div>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mt-3">{f.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How is EV EMI calculated?',
                a: 'EV EMI is calculated using the standard PMT formula: [P x R x (1+R)^N]/[(1+R)^N-1], where P is Principal (Car Price - Down Payment), R is Monthly Interest Rate (Annual Rate / 12 / 100), and N is Loan Tenure in Months.'
              },
              {
                q: 'What is a good down payment for an EV?',
                a: 'A good down payment is generally 15% to 20% of the vehicle ex-showroom price. A larger down payment reduces your loan principal amount, which results in lower monthly EMI and less interest accumulated over time.'
              },
              {
                q: 'Does a longer tenure reduce EMI?',
                a: 'Yes, spreading the loan over a longer tenure (e.g., 7 years instead of 5) reduces the monthly payment. However, it increases the total interest accumulated over the lifetime of the loan.'
              },
              {
                q: 'How much interest will I pay on an EV loan?',
                a: 'The interest paid depends on your interest rate and loan tenure. A higher interest rate or longer tenure increases the total interest paid. You can verify the exact breakdown using the doughnut chart above.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2.5 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Informational Content Section */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Understanding Electric Vehicle Financing</h2>
          <div className="text-slate-600 text-sm font-medium leading-relaxed space-y-6">
            <p>
              Purchasing an electric vehicle is an exciting step toward sustainable living, but understanding how to finance this investment is equally critical. Utilizing a dedicated <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">EV EMI calculator</Link> allows you to forecast monthly outgoings and build a healthy repayment schedule. When exploring options, a reliable <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">electric car loan calculator</Link> helps simplify complicated interest rate components.
            </p>
            
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Factors That Influence Your EV Loan EMI</h3>
            <p>
              If you want to accurately <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">calculate EV EMI</Link> schemes, you need to understand the variables that banks and financial institutions evaluate:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Down Payment Percentage:</strong> Contributing a larger down payment reduces the principal loan amount, which directly decreases both your monthly <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">EV loan EMI</Link> and the overall interest accumulated.
              </li>
              <li>
                <strong>Interest Rates:</strong> Many lenders offer preferential interest rates specifically for green vehicles. Even a 0.5% reduction can save thousands over a multi-year tenure.
              </li>
              <li>
                <strong>Loan Tenure:</strong> While longer tenures (e.g., 7 years) reduce the immediate monthly obligation, they increase the total interest paid compared to shorter tenures (e.g., 3 to 5 years).
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Navigating Electric Vehicle Finance Options</h3>
            <p>
              Securing optimized <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">electric vehicle finance</Link> requires shopping around for lenders who offer green auto loans. In addition to special interest schemes, check if you qualify for tax benefits under Section 80EEB of the Income Tax Act (where applicable), which allows deductions on interest paid. Before making a final commitment, evaluate long-term charging costs on our <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV trip cost calculator</Link> and compare similar vehicles on our <Link href="/compare" className="text-[#0249ad] font-bold hover:underline">compare EVs</Link> portal to ensure complete clarity.
            </p>
          </div>
        </div>

        {/* Related Tools Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">Explore More EV Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'EV Savings Calculator', desc: 'Compute monthly and yearly fuel cost savings.', href: '/tools/ev-savings-calculator' },
              { name: 'EV Trip Cost Calculator', desc: 'Analyze electrical charging cost compared to petrol.', href: '/tools/ev-running-cost-calculator' },
              { name: 'EV Charging Time Calculator', desc: 'Compute battery charging durations.', href: '/tools/ev-charging-time-calculator' },
            ].map(tool => (
              <Link
                key={tool.name}
                href={tool.href}
                className="bg-white border border-slate-200 hover:border-blue-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer block"
              >
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{tool.name}</h4>
                <p className="text-xs text-slate-400 font-medium mt-1.5">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EmiCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-bold text-slate-600">Loading EV EMI Calculator...</div>
      </div>
    }>
      <CalculatorContent />
    </Suspense>
  );
}
