'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Footer from '@/components/Footer';
import { Zap, Share2, BatteryCharging, AlertTriangle, Search, Lightbulb, HelpCircle, ArrowLeft } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

function ChargingCalculatorContent() {
  const searchParams = useSearchParams();

  // Inputs
  const [batterySize, setBatterySize] = useState(50);
  const [currentBattery, setCurrentBattery] = useState(20);
  const [targetBattery, setTargetBattery] = useState(80);
  const [chargerPower, setChargerPower] = useState(7.2);

  // States
  const [shareCopied, setShareCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Parse URL query parameters on mount
  useEffect(() => {
    const b = searchParams.get('battery');
    const c = searchParams.get('current');
    const t = searchParams.get('target');
    const p = searchParams.get('charger');

    if (b) setBatterySize(Number(b));
    if (c) setCurrentBattery(Number(c));
    if (t) setTargetBattery(Number(t));
    if (p) setChargerPower(Number(p));
  }, [searchParams]);

  // Validation
  useEffect(() => {
    if (targetBattery <= currentBattery) {
      setValidationError('Target battery percentage must be greater than the current battery percentage.');
    } else {
      setValidationError('');
    }
  }, [currentBattery, targetBattery]);

  // Calculations
  const chargeNeededPct = Math.max(0, targetBattery - currentBattery);
  const remainingPct = Math.max(0, 100 - targetBattery);
  
  const energyRequired = batterySize * (chargeNeededPct / 100);
  
  let chargingTimeHours = 0;
  if (chargerPower > 0) {
    chargingTimeHours = energyRequired / chargerPower;
  }

  // Format Charging Time
  const formatTime = (hoursFraction) => {
    if (hoursFraction <= 0) return '0 Minutes';
    const totalMinutes = Math.round(hoursFraction * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs === 0) {
      return `${mins} Minute${mins !== 1 ? 's' : ''}`;
    }
    if (mins === 0) {
      return `${hrs} Hour${hrs !== 1 ? 's' : ''}`;
    }
    return `${hrs} Hour${hrs !== 1 ? 's' : ''} ${mins} Minute${mins !== 1 ? 's' : ''}`;
  };

  // Chart Configuration
  const chartData = {
    labels: ['Current Charge', 'Added Charge', 'Remaining Capacity'],
    datasets: [
      {
        data: [currentBattery, chargeNeededPct, remainingPct],
        backgroundColor: ['#e2e8f0', '#0249ad', '#93c5fd'],
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
            return ` ${context.label}: ${context.raw}%`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Quick Presets
  const applyBatteryPreset = (size) => {
    setBatterySize(size);
  };

  const applyChargerPreset = (power) => {
    setChargerPower(power);
  };

  // Share URL Generator
  const shareCalculation = () => {
    const shareUrl = `${window.location.origin}/tools/ev-charging-time-calculator?battery=${batterySize}&current=${currentBattery}&target=${targetBattery}&charger=${chargerPower}`;
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* ── HEADER ── */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <Link href="/" className="flex items-center gap-1 text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden flex-shrink-0">
                <Image src="/logo/newlogo-removebg.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 64px, 80px" priority />
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
                  <Link href="/tools/ev-emi-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV EMI Calculator
                  </Link>
                  <Link href="/tools/ev-running-cost-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                    EV Trip Cost Calculator
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
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50"
                    >
                      EV EMI Calculator
                    </Link>
                    <Link
                      href="/tools/ev-running-cost-calculator"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50"
                    >
                      EV Trip Cost Calculator
                    </Link>
                    <Link
                      href="/tools/ev-savings-calculator"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50"
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

      {/* ── CALCULATOR BODY ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0249ad] text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-1.5 rounded-full mb-4 border border-blue-100/60 shadow-sm">
            <div className="relative w-4.5 h-4.5 overflow-hidden rounded-full border border-blue-100 flex-shrink-0">
              <Image src="/logo/newlogo-removebg.png" alt="BudgetEV Logo" fill className="object-cover" sizes="18px" />
            </div>
            <span>Charging Tools</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV Charging Time Calculator</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl leading-relaxed">
            Estimate how long it takes to charge your electric vehicle based on battery capacity, current level, target level, and charger power.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6">Charging Setup</h2>

            {/* Validation Display */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-750 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-750 shrink-0" /> {validationError}
              </div>
            )}

            <div className="space-y-6">
              {/* Battery Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="battery-size">Battery Size (kWh)</label>
                  <input
                    id="battery-size"
                    type="number"
                    min="10"
                    max="200"
                    value={batterySize}
                    onChange={(e) => setBatterySize(Math.max(10, Math.min(200, Number(e.target.value))))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="1"
                  value={batterySize}
                  onChange={(e) => setBatterySize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Battery Size Slider"
                />
              </div>

              {/* Current Battery % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="current-battery">Current Battery (%)</label>
                  <input
                    id="current-battery"
                    type="number"
                    min="0"
                    max="100"
                    value={currentBattery}
                    onChange={(e) => setCurrentBattery(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentBattery}
                  onChange={(e) => setCurrentBattery(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Current Battery Slider"
                />
              </div>

              {/* Target Battery % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="target-battery">Target Battery (%)</label>
                  <input
                    id="target-battery"
                    type="number"
                    min="0"
                    max="100"
                    value={targetBattery}
                    onChange={(e) => setTargetBattery(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={targetBattery}
                  onChange={(e) => setTargetBattery(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Target Battery Slider"
                />
              </div>

              {/* Charger Power */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label htmlFor="charger-power">Charger Power (kW)</label>
                  <input
                    id="charger-power"
                    type="number"
                    min="1"
                    max="350"
                    value={chargerPower}
                    onChange={(e) => setChargerPower(Math.max(1, Math.min(350, Number(e.target.value))))}
                    className="w-24 bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-right font-extrabold text-xs focus:outline-none focus:border-[#0249ad]"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="350"
                  step="0.1"
                  value={chargerPower}
                  onChange={(e) => setChargerPower(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0249ad]"
                  aria-label="Charger Power Slider"
                />
              </div>
            </div>

            {/* Quick Presets Grid */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
              {/* Battery Size Presets */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Battery Capacity Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {[30, 40, 50, 75, 100].map(size => (
                    <button
                      key={size}
                      onClick={() => applyBatteryPreset(size)}
                      className={`px-3 py-2 border rounded-xl text-xs font-extrabold transition cursor-pointer ${batterySize === size ? 'bg-blue-50 border-[#0249ad] text-[#0249ad]' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      {size} kWh
                    </button>
                  ))}
                </div>
              </div>

              {/* Charger Presets */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Charger Speed Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '3.3 kW Socket', val: 3.3 },
                    { label: '7.2 kW Wallbox', val: 7.2 },
                    { label: '11 kW AC', val: 11 },
                    { label: '30 kW DC Fast', val: 30 },
                    { label: '60 kW DC Fast', val: 60 },
                    { label: '120 kW DC Fast', val: 120 },
                  ].map(ch => (
                    <button
                      key={ch.label}
                      onClick={() => applyChargerPreset(ch.val)}
                      className={`px-3 py-2 border rounded-xl text-xs font-extrabold transition cursor-pointer ${chargerPower === ch.val ? 'bg-blue-50 border-[#0249ad] text-[#0249ad]' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results + Chart Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* KPI Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estimated Time (Largest Card) */}
              <div className="sm:col-span-2 bg-white border-2 border-[#0249ad] rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="absolute top-4 right-4 text-xs font-extrabold text-[#0249ad] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Primary</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Charging Time</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                  {validationError ? 'N/A' : formatTime(chargingTimeHours)}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-2">Time needed to reach {targetBattery}% charge level.</p>
              </div>

              {/* Energy Required (Medium Card) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Energy Required</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {validationError ? '0 kWh' : `${energyRequired.toFixed(1)} kWh`}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">Electrical energy to add.</p>
              </div>

              {/* Charger Speed (Medium Card) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Charger Speed</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {chargerPower} kW
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">Current power supply rate.</p>
              </div>
            </div>

            {/* Premium Interactive Battery Visualization */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Charging Level Visualization</h3>
              
              <div className="w-full max-w-[240px] flex items-center justify-center flex-col gap-4">
                {/* SVG Battery Shell */}
                <div className="relative w-44 h-24 border-4 border-slate-300 rounded-2xl p-1 flex items-center bg-slate-50/50 shadow-inner">
                  {/* Battery tip */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-slate-300 rounded-r-md" />
                  
                  {/* Frame Motion Animated fill segment */}
                  <motion.div
                    className="h-full rounded-lg bg-gradient-to-r from-blue-600 to-sky-400 shadow-md flex items-center justify-end pr-2 overflow-hidden"
                    initial={{ width: `${currentBattery}%` }}
                    animate={{ width: `${validationError ? currentBattery : targetBattery}%` }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  >
                    <span className="text-[9px] font-black text-white whitespace-nowrap">
                      {validationError ? currentBattery : targetBattery}%
                    </span>
                  </motion.div>
                </div>
                
                <div className="flex justify-between w-full text-[10px] font-bold text-slate-400 px-1">
                  <span>Current: {currentBattery}%</span>
                  <span>Target: {targetBattery}%</span>
                </div>
              </div>
            </div>

            {/* Doughnut Chart Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Capacity Allocation Breakdown</h3>
              
              <div className="relative w-52 h-52 flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="absolute text-center select-none pointer-events-none">
                  <span className="block text-xl font-black text-slate-900">+{chargeNeededPct}%</span>
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Added Charge</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6 text-[11px] font-bold text-slate-650">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#e2e8f0] rounded-full" />
                  <span>Current ({currentBattery}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#0249ad] rounded-full" />
                  <span>Added ({chargeNeededPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#93c5fd] rounded-full" />
                  <span>Remaining ({remainingPct}%)</span>
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
            </div>
          </div>
        </div>

        {/* Dynamic Insights Box */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">Charging Time Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-600">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-1">
              <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Charging from {currentBattery}% to {targetBattery}% adds {energyRequired.toFixed(1)} kWh of energy.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-1">
              <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Using a 60 kW DC charger would reduce charging time significantly vs AC power.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-1">
              <Search className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>If charger power doubles, charging time is nearly halved (assuming constant rate).</span>
            </div>
          </div>
        </div>

        {/* Trust & FAQ Block */}
        <div className="mt-12">
          {/* FAQs */}
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How is EV charging time calculated?',
                a: 'EV charging time is calculated by determining the amount of energy required to reach the target charge level, and dividing it by the power supplied by the charger. Formula: Time = [Battery Capacity × (Target % - Current %) / 100] ÷ Charger Power.'
              },
              {
                q: 'What is the difference between AC and DC charging?',
                a: 'AC charging (Alternating Current) is typically slower and used for home or overnight chargers. DC charging (Direct Current) bypasses the vehicle’s onboard charger to supply power directly to the battery, allowing for high-speed fast charging.'
              },
              {
                q: 'Why is charging from 20% to 80% recommended?',
                a: 'Charging between 20% and 80% maximizes battery lifespan and keeps charging speeds high. EV batteries charge much slower after 80% to protect the cells from overheating and degradation.'
              },
              {
                q: 'Does battery size affect charging speed?',
                a: 'Battery size determines how much capacity needs to be filled, but the charging speed itself is capped by the charger output limits and the vehicle’s maximum accepted charging power.'
              },
              {
                q: 'How fast is DC fast charging?',
                a: 'DC fast chargers (usually 30 kW up to 150 kW or more) can charge a typical EV from 10% to 80% in 30 to 60 minutes, compared to several hours using standard home AC chargers.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0249ad] shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2.5 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Informational Content Section */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">How EV Charging Time Is Calculated</h2>
          <div className="text-slate-600 text-sm font-medium leading-relaxed space-y-6">
            <p>
              Planning your journeys and daily routine requires understanding how long your vehicle will spend plugged in. Our interactive <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">EV charging time calculator</Link> estimates the duration based on your battery capacity, current state of charge, and charger output power. If you often wonder <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">how long does it take to charge an EV</Link>, the answer depends on several key variables.
            </p>
            
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Key Factors Influencing Electric Vehicle Charging Time</h3>
            <p>
              While standard formulas yield solid estimates, real-world conditions create variations. A smart <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">battery charging calculator</Link> models outcomes around these primary dynamics:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Battery Capacity (Size):</strong> Larger battery packs store more kilowatt-hours (kWh) of electricity, which naturally takes longer to fill than smaller commuter packs.
              </li>
              <li>
                <strong>Charger Output Power:</strong> AC home charging (3.3 kW to 11 kW) is best for overnight charging, whereas public DC fast chargers (30 kW to 150+ kW) replenish capacity in minutes.
              </li>
              <li>
                <strong>The 80% Charging Curve Crossover:</strong> Charging speed drops off sharply after reaching 80% capacity to protect battery cell longevity and prevent overheating.
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Estimating Your EV Charging Duration and Routine</h3>
            <p>
              By structuring your charging sessions between 20% and 80%, you maximize battery health and spend less time waiting. Before hitting the road, use our interactive <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">electric vehicle charging time</Link> estimator to map out your stops, check our live <Link href="/charging-stations" className="text-[#0249ad] font-bold hover:underline">EV charger map</Link> to locate stations along your route, and check our <Link href="/find-ev" className="text-[#0249ad] font-bold hover:underline">find EV directory</Link> to analyze range options side-by-side.
            </p>
          </div>
        </div>

        {/* Related Tools Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">Explore More EV Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'EV EMI Calculator', desc: 'Forecast loan details and monthly interest schedules.', href: '/tools/ev-emi-calculator' },
              { name: 'EV Savings Calculator', desc: 'Compute monthly and yearly fuel cost savings.', href: '/tools/ev-savings-calculator' },
              { name: 'EV Trip Cost Calculator', desc: 'Analyze electrical charging cost compared to petrol.', href: '/tools/ev-running-cost-calculator' },
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

export default function ChargingTimeCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-bold text-slate-605">Loading EV Charging Time Calculator...</div>
      </div>
    }>
      <ChargingCalculatorContent />
    </Suspense>
  );
}
