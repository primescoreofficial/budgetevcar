'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Footer from '@/components/Footer';
import { 
  Zap, 
  Share2, 
  TrendingUp, 
  HelpCircle, 
  AlertTriangle, 
  Search, 
  Lightbulb, 
  RefreshCw, 
  Gauge, 
  DollarSign,
  Fuel,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

function TripCostCalculatorContent() {
  const searchParams = useSearchParams();

  // Inputs
  const [distance, setDistance] = useState(1500);
  const [rate, setRate] = useState(8);
  const [efficiency, setEfficiency] = useState(7);
  const [petrolPrice, setPetrolPrice] = useState(100);
  const [petrolMileage, setPetrolMileage] = useState(15);

  // UI States
  const [shareCopied, setShareCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Parse URL query parameters on mount
  useEffect(() => {
    const d = searchParams.get('distance');
    const r = searchParams.get('rate');
    const e = searchParams.get('efficiency');
    const pp = searchParams.get('petrolPrice');
    const pm = searchParams.get('petrolMileage');

    if (d) setDistance(Number(d));
    if (r) setRate(Number(r));
    if (e) setEfficiency(Number(e));
    if (pp) setPetrolPrice(Number(pp));
    if (pm) setPetrolMileage(Number(pm));
  }, [searchParams]);

  // Validation
  useEffect(() => {
    if (distance <= 0) {
      setValidationError('Monthly distance driven must be greater than 0.');
    } else if (rate < 0) {
      setValidationError('Electricity rate cannot be negative.');
    } else if (efficiency <= 0) {
      setValidationError('EV efficiency must be greater than 0 km/kWh.');
    } else if (petrolPrice <= 0) {
      setValidationError('Petrol price must be greater than 0.');
    } else if (petrolMileage <= 0) {
      setValidationError('Petrol car mileage must be greater than 0 km/L.');
    } else {
      setValidationError('');
    }
  }, [distance, rate, efficiency, petrolPrice, petrolMileage]);

  // Calculations
  const evCostPerKm = efficiency > 0 ? rate / efficiency : 0;
  const petrolCostPerKm = petrolMileage > 0 ? petrolPrice / petrolMileage : 0;

  const monthlyChargingCost = efficiency > 0 ? (distance / efficiency) * rate : 0;
  const annualChargingCost = monthlyChargingCost * 12;

  const monthlyEnergyConsumption = efficiency > 0 ? distance / efficiency : 0;
  const annualEnergyConsumption = monthlyEnergyConsumption * 12;

  const monthlyPetrolCost = petrolMileage > 0 ? (distance / petrolMileage) * petrolPrice : 0;
  const annualPetrolCost = monthlyPetrolCost * 12;

  const monthlySavings = Math.max(0, monthlyPetrolCost - monthlyChargingCost);
  const annualSavings = monthlySavings * 12;

  // Chart Configuration
  const chartData = {
    labels: ['EV Charging Cost', 'Petrol Running Savings'],
    datasets: [
      {
        data: [
          Math.round(monthlyChargingCost),
          Math.round(monthlySavings)
        ],
        backgroundColor: ['#0249ad', '#93c5fd'],
        borderWidth: 0,
        hoverOffset: 6,
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
  const applyPreset = (presetDistance) => {
    setDistance(presetDistance);
  };

  // Share URL Generator
  const shareCalculation = () => {
    const shareUrl = `${window.location.origin}/tools/ev-running-cost-calculator?distance=${distance}&rate=${rate}&efficiency=${efficiency}&petrolPrice=${petrolPrice}&petrolMileage=${petrolMileage}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col justify-between">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EV Trip Cost Calculator",
              "url": "https://budget-ev.com/tools/ev-running-cost-calculator",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "description": "Calculate and compare electric vehicle trip costs vs petrol cars, estimating cost per kilometer, monthly savings, and energy consumption."
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How is EV cost per km calculated?",
                  "answer": {
                    "@type": "Answer",
                    "text": "EV running cost per kilometer is calculated by dividing your electricity rate per unit (₹/kWh) by the electric car's real-world efficiency (km/kWh). For example, at ₹8 per unit and an efficiency of 7 km/kWh, the cost is around ₹1.14 per km."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is EV running cost cheaper than petrol?",
                  "answer": {
                    "@type": "Answer",
                    "text": "Yes, electric vehicles are significantly cheaper to run. A typical petrol hatchback costs ₹6-7 per km, whereas an electric car costs approximately ₹1-1.5 per km, leading to massive annual savings."
                  }
                }
              ]
            }
          ])
        }}
      />

      <div>
        {/* ── HEADER ── */}
        <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-6 md:space-x-12">
              <Link href="/" className="flex items-center gap-1 text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 overflow-hidden  flex-shrink-0">
                  <Image src="/logo/newlogo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 40px, 44px" priority />
                </div>
                <span>BudgetEV</span>
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
                    <Link href="/tools/ev-emi-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                      EV EMI Calculator
                    </Link>
                    <Link href="/tools/ev-running-cost-calculator" className="block px-5 py-2.5 text-sm text-[#0249ad] bg-blue-50/50 font-bold transition">
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
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-[#0249ad] bg-blue-50/50"
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
            <span className="text-slate-700 font-bold">EV Trip Cost Calculator</span>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0249ad] text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-1.5 rounded-full mb-4 border border-blue-100/60 shadow-sm">
              <div className="relative w-4.5 h-4.5 overflow-hidden rounded-full border border-blue-100 flex-shrink-0">
                <Image src="/logo/newlogo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="18px" />
              </div>
              <span>Cost Analysis</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV Trip Cost Calculator</h1>
            <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl leading-relaxed">
              Calculate your electric vehicle charging cost-per-kilometer, estimate monthly energy requirements, and compare your ownership expenditure against a petrol car.
            </p>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* INPUTS COLUMN */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6">Usage & Efficiency Configuration</h2>

              {/* Validation Display */}
              {validationError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-750 shrink-0" /> {validationError}
                </div>
              )}

              <div className="space-y-6">
                {/* Distance */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <label htmlFor="distance-input">Monthly Distance Driven (km)</label>
                    <input
                      id="distance-input"
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                      className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                    />
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                    aria-label="Monthly Distance Slider"
                  />
                </div>

                {/* Electricity Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <label htmlFor="rate-input">Electricity Rate (₹/kWh)</label>
                    <input
                      id="rate-input"
                      type="number"
                      step="0.5"
                      value={rate}
                      onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                      className="w-20 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                    aria-label="Electricity Rate Slider"
                  />
                </div>

                {/* EV Efficiency */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <label htmlFor="efficiency-input">EV Efficiency (km/kWh)</label>
                    <input
                      id="efficiency-input"
                      type="number"
                      step="0.1"
                      value={efficiency}
                      onChange={(e) => setEfficiency(Math.max(0.1, Number(e.target.value)))}
                      className="w-20 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                    />
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.1"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                    aria-label="EV Efficiency Slider"
                  />
                </div>

                {/* Divider for comparison */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-500" />
                    <span>Petrol Vehicle Comparison Inputs</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Petrol Price */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <label htmlFor="petrol-price-input">Petrol Price (₹/L)</label>
                        <input
                          id="petrol-price-input"
                          type="number"
                          step="1"
                          value={petrolPrice}
                          onChange={(e) => setPetrolPrice(Math.max(1, Number(e.target.value)))}
                          className="w-20 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                        />
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="150"
                        step="1"
                        value={petrolPrice}
                        onChange={(e) => setPetrolPrice(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        aria-label="Petrol Price Slider"
                      />
                    </div>

                    {/* Mileage */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <label htmlFor="mileage-input">Petrol Mileage (km/L)</label>
                        <input
                          id="mileage-input"
                          type="number"
                          step="0.5"
                          value={petrolMileage}
                          onChange={(e) => setPetrolMileage(Math.max(1, Number(e.target.value)))}
                          className="w-20 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                        />
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="0.5"
                        value={petrolMileage}
                        onChange={(e) => setPetrolMileage(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        aria-label="Petrol Mileage Slider"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">Quick Distance Presets</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'City Driver', dist: 800 },
                    { label: 'Daily Commuter', dist: 1500 },
                    { label: 'Frequent Traveler', dist: 2500 },
                    { label: 'Heavy Usage', dist: 4000 }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.dist)}
                      className={`px-3 py-2.5 border rounded-xl text-[11px] font-extrabold transition cursor-pointer text-center ${
                        distance === p.dist
                          ? 'bg-[#0249ad] text-white border-[#0249ad]'
                          : 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-200 text-slate-600 hover:text-[#0249ad]'
                      }`}
                    >
                      <div className="font-extrabold">{p.label}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{p.dist} km/m</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RESULTS COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PRIMARY KPI CARD - Cost Per KM */}
              <div className="bg-white border-2 border-[#0249ad] rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="absolute top-4 right-4 text-xs font-extrabold text-[#0249ad] bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Primary KPI</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EV Cost Per Kilometer</p>
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1.5">
                  ₹{evCostPerKm.toFixed(2)}<span className="text-lg font-bold text-slate-400">/km</span>
                </h3>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 w-max px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Petrol Costs ₹{petrolCostPerKm.toFixed(2)}/km</span>
                </div>
              </div>

              {/* SECONDARY KPIs GRID */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly charging cost */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monthly Charging Cost</p>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                    ₹{Math.round(monthlyChargingCost).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1">For {distance} km distance</p>
                </div>

                {/* Annual charging cost */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Annual Charging Cost</p>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                    ₹{Math.round(annualChargingCost).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1">Based on monthly average</p>
                </div>

                {/* Monthly energy consumption */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monthly Energy Use</p>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {Math.round(monthlyEnergyConsumption)} <span className="text-xs font-bold text-slate-400">kWh</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1">Approx. electricity units</p>
                </div>

                {/* Annual energy consumption */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Annual Energy Use</p>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {Math.round(annualEnergyConsumption)} <span className="text-xs font-bold text-slate-400">kWh</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1">Yearly grid electricity load</p>
                </div>
              </div>

              {/* DOUGHNUT VISUALIZATION */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Running Cost vs savings ratio</h3>
                
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <Doughnut data={chartData} options={chartOptions} />
                  
                  {/* Center Text */}
                  <div className="absolute text-center select-none pointer-events-none">
                    <span className="block text-2xl font-black text-blue-600">₹{Math.round(monthlySavings).toLocaleString('en-IN')}</span>
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Savings</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <span>EV Cost (₹{Math.round(monthlyChargingCost).toLocaleString('en-IN')})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
                    <span>Savings (₹{Math.round(monthlySavings).toLocaleString('en-IN')})</span>
                  </div>
                </div>
              </div>

              {/* SHARE ACTION & QUICK URL */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <button
                  onClick={shareCalculation}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-[#0249ad] py-3.5 rounded-2xl text-xs font-extrabold transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareCopied ? 'Copied Link!' : 'Share Calculation'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* BREAK-EVEN INSIGHT CARD */}
          <div className="mt-8 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10">
              <Zap className="w-96 h-96" />
            </div>
            <div className="relative z-10">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/25 px-3 py-1 rounded-md mb-3 border border-white/10">
                Break-Even & Savings Highlight
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                At your current driving pattern, you save approximately <span className="text-yellow-300 font-extrabold">₹{Math.round(annualSavings).toLocaleString('en-IN')}</span> per year compared to a petrol vehicle.
              </h2>
              <p className="text-slate-100 text-xs font-medium mt-3.5 max-w-xl leading-relaxed">
                With an EV cost of just <strong>₹{evCostPerKm.toFixed(2)}/km</strong> versus a petrol cost of <strong>₹{petrolCostPerKm.toFixed(2)}/km</strong>, your transition pays back itself rapidly in direct running cost savings.
              </p>
            </div>
          </div>

          {/* LEAD GENERATION CONVERSION FUNNEL */}
          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center shadow-sm">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Looking for an EV with even lower running costs?</h3>
            <p className="text-slate-500 text-xs font-medium mt-2 max-w-md mx-auto leading-relaxed">
              Explore and filter the most energy-efficient electric cars in India fitting your specific budget profile.
            </p>
            <div className="mt-5">
              <Link
                href="/find-ev"
                className="inline-flex items-center gap-2 bg-[#0249ad] hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-md"
              >
                <span>Find Matching EVs</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* TRUST / WHY USE THIS SECTION */}
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Why Evaluate Your Electric Car Trip Cost?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { title: 'Calculate EV Cost Per KM', desc: 'Determine the exact charging expenses incurred for every single kilometer driven on standard grid tariffs.', icon: <Gauge className="w-6 h-6 text-[#0249ad]" /> },
                { title: 'Evaluate EV Charging Cost', desc: 'Forecast monthly grid energy consumption and grid load costs before purchasing your next EV.', icon: <Zap className="w-6 h-6 text-[#0249ad]" /> },
                { title: 'Compare EV vs Petrol Cost', desc: 'Analyze real-time differences in fuel expenses side-by-side to determine overall ROI periods.', icon: <RefreshCw className="w-6 h-6 text-[#0249ad]" /> },
                { title: 'Analyze Ownership Expenses', desc: 'Estimate overall electric vehicle ownership cost compared to high running cost IC engine cars.', icon: <DollarSign className="w-6 h-6 text-[#0249ad]" /> }
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
                  q: 'How do I use this EV trip cost calculator?',
                  a: 'Simply adjust the sliders or enter figures for your Monthly Distance, grid Electricity Rate, and EV Efficiency. The calculator will instantly display your EV cost per km, monthly and annual charging costs, and compare it against standard petrol running costs.'
                },
                {
                  q: 'How does EV cost per km compare with petrol cars?',
                  a: 'Typically, electric vehicle running cost is between ₹1.00 and ₹1.50 per kilometer depending on domestic power tariffs. By comparison, a standard petrol car with a mileage of 15 km/L running on petrol priced at ₹100/L costs around ₹6.67 per km, which is nearly 5-6 times more expensive.'
                },
                {
                  q: 'What factors influence electric vehicle charging cost?',
                  a: 'Your charging cost is mainly dictated by local electricity tariffs (which can range from ₹4 to ₹12 per unit in India) and public charging station pricing, along with your vehicle efficiency, battery state-of-charge capacity, and driving style.'
                },
                {
                  q: 'How does electric vehicle ownership cost compare over 5 years?',
                  a: 'While the initial ex-showroom cost of an electric car is typically higher, the drastically lower EV vs petrol running cost translates to massive savings. Over a 5-year period with an average daily drive of 50 km, an EV owner can easily save over ₹3,00,000 in energy bills.'
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

          {/* SEO INFORMATIONAL BLOCK */}
          <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Optimizing Your Electric Vehicle Ownership Cost</h2>
            <div className="text-slate-600 text-sm font-medium leading-relaxed space-y-6">
              <p>
                Understanding your day-to-day commute expenses is the most critical element when comparing green energy vehicles. With our <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV trip cost calculator</Link>, you can inspect how tweaking variables like domestic power tariffs changes your <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">electric car running cost</Link> values.
              </p>
              
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Evaluating EV Cost Per KM Against Traditional Petrol Vehicles</h3>
              <p>
                Comparing the absolute <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV cost per km</Link> metric with internal combustion engines (ICE) showcases the financial wisdom of upgrading to electric mobility. While petrol prices hover around high benchmarks, calculating the <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV vs petrol running cost</Link> disparity reveals that electric cars pay back their purchase premium within a few years of operation. Evaluate your financing requirements using our dedicated <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">EV EMI Calculator</Link> to build a comprehensive budget structure.
              </p>

              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Factors Impacting Your EV Charging Cost</h3>
              <p>
                Several variables dictate the final <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV charging cost</Link> of a vehicle. Using home-charging options on standard residential energy slabs yields the most cost-effective rates, whereas utilizing public fast-charging terminals increases the rate per unit. Regardless of the source, electric vehicle ownership cost parameters remain substantially lower than liquid-fuel variants, providing a stable solution against volatile fossil-fuel markets. Compare batteries and capacities on our <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">EV charging time calculator</Link> and find tailored options with our <Link href="/tools/ev-savings-calculator" className="text-[#0249ad] font-bold hover:underline">EV savings calculator</Link> tools to make your transition seamless.
              </p>
            </div>
          </div>

          {/* RELATED TOOLS DIRECTORY */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">Explore More EV Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'EV Savings Calculator', desc: 'Compute monthly and yearly fuel cost savings.', href: '/tools/ev-savings-calculator' },
                { name: 'EV EMI Calculator', desc: 'Estimate loan monthly payments and down payments.', href: '/tools/ev-emi-calculator' },
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
      </div>

      <Footer />
    </div>
  );
}

export default function TripCostCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-bold text-slate-600">Loading EV Trip Cost Calculator...</div>
      </div>
    }>
      <TripCostCalculatorContent />
    </Suspense>
  );
}
