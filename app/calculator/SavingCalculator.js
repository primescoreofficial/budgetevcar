'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PETROL_MILEAGE = 50;
const EV_EFFICIENCY = 6;

function fmt(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
}

function SliderRow({ label, value, min, max, step, onChange, display }) {
    return (
        <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-extrabold text-[#1e3a8a] bg-blue-50 px-2.5 py-0.5 rounded-lg">{display}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-100 accent-[#1e40af] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-300 font-medium mt-1.5">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}

function MetricCard({ label, value, sub, accent, wide }) {
    return (
        <div
            className={`rounded-2xl p-5 flex flex-col justify-between ${wide ? 'col-span-2 sm:col-span-2' : ''} ${accent
                    ? 'bg-[#1e40af] text-white'
                    : 'bg-white border border-slate-100 shadow-sm'
                }`}
        >
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${accent ? 'text-blue-200' : 'text-slate-400'}`}>
                {label}
            </p>
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${accent ? 'text-white' : 'text-slate-900'}`}>
                {value}
            </p>
            {sub && (
                <p className={`text-[11px] font-medium mt-2 leading-relaxed ${accent ? 'text-blue-200' : 'text-slate-400'}`}>
                    {sub}
                </p>
            )}
        </div>
    );
}

export default function SavingsCalculator() {
    const [km, setKm] = useState(40);
    const [petrolPrice, setPetrolPrice] = useState(104);
    const [elecPrice, setElecPrice] = useState(7);
    
    // Mobile responsive menu toggle state
    const [menuOpen, setMenuOpen] = useState(false);

    const petrolMonthly = (km / PETROL_MILEAGE) * petrolPrice * 30;
    const evMonthly = (km / EV_EFFICIENCY) * elecPrice * 30;
    const savingMonth = petrolMonthly - evMonthly;
    const savingYear = savingMonth * 12;
    const saving5yr = savingYear * 5;
    const savingPct = petrolMonthly > 0 ? Math.round((savingMonth / petrolMonthly) * 100) : 0;

    const months = [1, 6, 12, 24, 36, 48, 60];
    const labels = ['1 mo', '6 mo', '1 yr', '2 yr', '3 yr', '4 yr', '5 yr'];
    const petrolData = months.map((m) => Math.round(petrolMonthly * m));
    const evData = months.map((m) => Math.round(evMonthly * m));

    const chartData = {
        labels,
        datasets: [
            {
                label: 'EV cost',
                data: evData,
                backgroundColor: '#bfdbfe',
                hoverBackgroundColor: '#93c5fd',
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Petrol cost',
                data: petrolData,
                backgroundColor: '#1e40af',
                hoverBackgroundColor: '#1d4ed8',
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#94a3b8',
                bodyColor: '#f8fafc',
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx) =>
                        '  ' + ctx.dataset.label + ': ₹' + ctx.parsed.y.toLocaleString('en-IN'),
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 11, weight: '600' }, color: '#94a3b8' },
            },
            y: {
                grid: { color: 'rgba(148,163,184,0.08)' },
                border: { display: false },
                ticks: {
                    font: { size: 11 },
                    color: '#94a3b8',
                    callback: (v) =>
                        '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v >= 1000 ? Math.round(v / 1000) + 'k' : v),
                },
            },
        },
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/find-ev', label: 'Find EV' },
        { href: '/compare', label: 'Compare' },
        { href: '/calculator', label: 'Calculator', active: true },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* HEADER */}
            <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6 sm:gap-12">
                        <Link href="/" className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
                            BudgetEV
                        </Link>
                        
                        {/* Desktop Navigation Link Panel */}
                        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[14px] font-medium text-slate-500">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    className={link.active ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-0.5 font-bold" : "hover:text-slate-900 transition"}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Desktop CTA Trigger Button */}
                    <Link
                        href="/find-ev"
                        className="hidden md:block bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                        Get Started
                    </Link>

                    {/* Mobile Hamburger Menu Trigger Icon */}
                    <button 
                        onClick={() => setMenuOpen((p) => !p)}
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition focus:outline-none"
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown Menu Drawer */}
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
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                                  link.active
                                    ? "bg-blue-50 text-[#1e3a8a]"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a]"
                                }`}
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

            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-24">

                {/* HERO */}
                <div className="mb-8 sm:mb-12 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1e40af] text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        <span>⚡</span> EV Savings Calculator
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 leading-tight">
                        How much will you save<br className="hidden sm:block" /> switching to an EV?
                    </h1>
                    <p className="text-slate-400 font-medium text-sm max-w-md mx-auto leading-relaxed">
                        Adjust your daily commute and fuel prices to see real savings over 1 month, 1 year, and 5 years.
                    </p>
                </div>

                {/* SAVINGS HIGHLIGHT BANNER */}
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">You save every month</p>
                        <p className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">{fmt(savingMonth)}</p>
                        <p className="text-blue-200 text-xs font-medium mt-1">{savingPct}% less than petrol</p>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-blue-600" />
                    <div className="text-center">
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Per year</p>
                        <p className="text-white text-2xl font-extrabold">{fmt(savingYear)}</p>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-blue-600" />
                    <div className="text-center sm:text-right">
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Over 5 years</p>
                        <p className="text-white text-2xl font-extrabold">{fmt(saving5yr)}</p>
                    </div>
                </div>

                {/* MAIN LAYOUT */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* SIDEBAR — INPUTS */}
                    <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-[#1e40af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Your usage</h3>
                            </div>

                            <SliderRow label="Daily commute" value={km} min={5} max={200} step={1} onChange={setKm} display={`${km} km/day`} />
                            <SliderRow label="Petrol price" value={petrolPrice} min={80} max={130} step={1} onChange={setPetrolPrice} display={`₹${petrolPrice}/L`} />
                            <SliderRow label="Electricity tariff" value={elecPrice} min={4} max={12} step={0.5} onChange={setElecPrice} display={`₹${elecPrice.toFixed(1)}/kWh`} />

                            <div className="mt-5 pt-4 border-t border-slate-50 space-y-2">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400 font-medium">Petrol mileage</span>
                                    <span className="text-slate-500 font-bold">50 km/litre</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400 font-medium">EV efficiency</span>
                                    <span className="text-slate-500 font-bold">6 km/kWh</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400 font-medium">Days per month</span>
                                    <span className="text-slate-500 font-bold">30 days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — RESULTS */}
                    <div className="flex-1 min-w-0">

                        {/* METRIC CARDS */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
                            <MetricCard
                                label="Monthly petrol cost"
                                value={fmt(petrolMonthly)}
                                sub="Your current spend on fuel"
                            />
                            <MetricCard
                                label="Monthly EV cost"
                                value={fmt(evMonthly)}
                                sub="Electricity cost for same distance"
                                accent
                            />
                            <MetricCard
                                label="Monthly savings"
                                value={fmt(savingMonth)}
                                sub={`You save ${savingPct}% switching to EV`}
                            />
                            <MetricCard
                                label="Break-even boost"
                                value={`${savingPct}%`}
                                sub="Cost reduction vs petrol per month"
                            />
                        </div>

                        {/* CHART */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                                        Cumulative cost over time
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Petrol vs EV — total spent</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-[#bfdbfe] flex-shrink-0 inline-block" />
                                        EV cost
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-[#1e40af] flex-shrink-0 inline-block" />
                                        Petrol cost
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: '240px', position: 'relative' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                            <p className="text-[11px] text-slate-300 font-medium mt-4 text-center">
                                The gap between bars = your total savings at that point
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-5 bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                                    Ready to make the switch?
                                </p>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                                    Browse EVs that fit your budget and daily commute of {km} km.
                                </p>
                            </div>
                            <Link
                                href="/find-ev"
                                className="w-full sm:w-auto text-center bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-extrabold text-xs tracking-wide px-6 py-3 rounded-xl transition whitespace-nowrap"
                            >
                                Find My EV →
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-white py-10 sm:py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">BudgetEV</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                India&apos;s most trusted platform for finding and comparing electric vehicles within your budget.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                                <li><Link href="/find-ev" className="hover:text-white transition">Find EV</Link></li>
                                <li><Link href="/compare" className="hover:text-white transition">Compare</Link></li>
                                <li><Link href="/calculator" className="hover:text-white transition">Calculator</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>📞 +91 7852085341</li>
                                <li>📧 mouliksharma618@gmail.com</li>
                                <li>📍 Jodhpur, India</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-600">
                        <p>© 2026 BudgetEV. All rights reserved. Made with for India&apos;s EV revolution.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}