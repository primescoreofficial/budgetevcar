'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { Zap, HelpCircle, TrendingUp, DollarSign, Leaf, Sparkles, ChevronRight } from 'lucide-react';
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

const PETROL_MILEAGE = 12;
const EV_EFFICIENCY = 6;

function fmt(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
}

function SliderRow({ label, value, min, max, step, onChange, prefix = '', suffix = '' }) {
    return (
        <div className="mb-5">
            <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-lg text-[#0249ad] text-sm font-extrabold border border-blue-100/60 shadow-sm">
                    {prefix && <span className="text-xs text-blue-400 font-bold">{prefix}</span>}
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            onChange(val);
                        }}
                        onBlur={() => {
                            let val = Number(value);
                            if (isNaN(val) || val < min) val = min;
                            if (val > max) val = max;
                            onChange(val);
                        }}
                        className="w-12 bg-transparent text-right outline-none text-[#0249ad] font-extrabold focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {suffix && <span className="text-[11px] font-semibold text-slate-450">{suffix}</span>}
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value || min}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-100 accent-[#0249ad] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                <span>{prefix}{min}{suffix}</span>
                <span>{prefix}{max}{suffix}</span>
            </div>
        </div>
    );
}

function MetricCard({ label, value, sub, accent, wide }) {
    return (
        <div
            className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between ${wide ? 'col-span-2 sm:col-span-2' : ''} ${accent
                    ? 'bg-white border-2 border-[#0249ad] shadow-sm relative'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
        >
            {accent && <span className="absolute top-4 right-4 text-[9px] font-extrabold text-[#0249ad] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Primary</span>}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {label}
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {value}
            </p>
            {sub && (
                <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-relaxed">
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
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);

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
                backgroundColor: '#93c5fd',
                hoverBackgroundColor: '#60a5fa',
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Petrol cost',
                data: petrolData,
                backgroundColor: '#0249ad',
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
        { href: '/charging-stations', label: 'Charging Stations' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col justify-between">
            {/* HEADER */}
            <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-6 md:space-x-12">
                        <Link href="/" className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
                            BudgetEV
                        </Link>
                        
                        {/* Desktop Navigation Link Panel */}
                        <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    className="hover:text-slate-900 transition"
                                >
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
                                    <Link href="/tools/ev-savings-calculator" className="block px-5 py-2.5 text-sm text-[#0249ad] bg-blue-50/50 font-bold transition">
                                        EV Savings Calculator
                                    </Link>
                                    <Link href="/tools/ev-charging-time-calculator" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0249ad] font-bold transition">
                                        EV Charging Time Calculator
                                    </Link>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Desktop CTA Trigger Button */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/find-ev"
                            className="hidden md:inline-flex bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm"
                        >
                            Get Started
                        </Link>

                        {/* Mobile Hamburger Menu Trigger Icon */}
                        <button 
                            onClick={() => setMenuOpen((p) => !p)}
                            className="md:hidden p-2 rounded-xl text-slate-650 hover:bg-slate-100 transition focus:outline-none"
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
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-755 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
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
                                            className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-[#0249ad] bg-blue-50/50"
                                        >
                                            EV Savings Calculator
                                        </Link>
                                        <Link
                                            href="/tools/ev-charging-time-calculator"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50"
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
                    <span className="text-slate-700 font-bold">EV Savings Calculator</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
                {/* HERO */}
                <div className="mb-8">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md mb-2">Savings Analysis</span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">EV Savings Calculator</h1>
                    <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl leading-relaxed">
                        Adjust your daily commute and fuel prices to calculate how much you will save over a month, a year, and five years by switching to an electric vehicle.
                    </p>
                </div>

                {/* MAIN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* INPUTS PANEL */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-[#0249ad]" />
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Your Commute Settings</h2>
                        </div>

                        <SliderRow label="Daily Commute" value={km} min={5} max={400} step={1} onChange={setKm} suffix=" km/day" />
                        <SliderRow label="Petrol Price" value={petrolPrice} min={80} max={200} step={1} onChange={setPetrolPrice} prefix="₹" suffix="/L" />
                        <SliderRow label="Electricity Tariff" value={elecPrice} min={4} max={25} step={0.5} onChange={setElecPrice} prefix="₹" suffix="/kWh" />

                        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400 font-medium">Standard Petrol Mileage</span>
                                <span className="text-slate-800">12 km/litre</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400 font-medium">Standard EV Efficiency</span>
                                <span className="text-slate-800">6 km/kWh</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400 font-medium">Days Per Month</span>
                                <span className="text-slate-800">30 days</span>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS PANEL */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* METRIC CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <MetricCard
                                label="Monthly Petrol Cost"
                                value={fmt(petrolMonthly)}
                                sub="Your current spend on fuel"
                            />
                            <MetricCard
                                label="Monthly EV Cost"
                                value={fmt(evMonthly)}
                                sub="Electricity cost for same distance"
                                accent
                            />
                            <div className="sm:col-span-2">
                                <MetricCard
                                    label="Monthly Savings"
                                    value={fmt(savingMonth)}
                                    sub={`You save ${savingPct}% switching to EV`}
                                    wide
                                />
                            </div>
                        </div>

                        {/* CHART */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Cumulative Cost
                                    </h4>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-450">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-[#93c5fd] flex-shrink-0 inline-block" />
                                        EV Cost
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-[#0249ad] flex-shrink-0 inline-block" />
                                        Petrol Cost
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                            <p className="text-[10px] text-slate-405 font-medium mt-4 text-center">
                                The gap between bars represents your total accumulated savings
                            </p>
                        </div>
                    </div>
                </div>

                {/* SAVINGS HIGHLIGHT BANNER */}
                <div className="mt-8 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10">
                        <Zap className="w-96 h-96" />
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/25 px-3 py-1 rounded-md mb-3 border border-white/10">
                                Monthly Boost
                            </span>
                            <p className="text-3xl sm:text-4xl font-black tracking-tight">{fmt(savingMonth)}</p>
                            <p className="text-blue-200 text-xs font-medium mt-1">{savingPct}% less expenditure than petrol</p>
                        </div>
                        <div className="hidden sm:block w-px h-16 bg-white/20" />
                        <div className="text-center">
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/25 px-3 py-1 rounded-md mb-3 border border-white/10">
                                Annual Savings
                            </span>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight">{fmt(savingYear)}</p>
                        </div>
                        <div className="hidden sm:block w-px h-16 bg-white/20" />
                        <div className="text-center sm:text-right">
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/25 px-3 py-1 rounded-md mb-3 border border-white/10">
                                5-Year Savings
                            </span>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight">{fmt(saving5yr)}</p>
                        </div>
                    </div>
                </div>

                {/* LEAD GENERATION CONVERSION FUNNEL */}
                <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center shadow-sm">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Ready to make the switch?</h3>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-md mx-auto leading-relaxed">
                        Explore electric vehicles that fit your budget and daily commute profile of {km} km.
                    </p>
                    <div className="mt-5">
                        <Link
                            href="/find-ev"
                            className="inline-flex items-center gap-2 bg-[#0249ad] hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-md"
                        >
                            <span>Find My EV</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Why Use Our Savings Calculator */}
                <div className="mt-12">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Why Use Our EV Savings Calculator?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        {[
                            { title: 'Estimate Fuel Savings', desc: 'Forecast daily, monthly, and yearly outgoings saved compared to petrol cars.', icon: <DollarSign className="w-6 h-6 text-[#0249ad]" /> },
                            { title: 'Predict Break-even', desc: 'Understand how quickly your lower running costs will cover the initial EV price premium.', icon: <TrendingUp className="w-6 h-6 text-[#0249ad]" /> },
                            { title: 'Environmental Impact', desc: 'Visualize your carbon emission reduction by switching to a zero-emission commute.', icon: <Leaf className="w-6 h-6 text-[#0249ad]" /> },
                            { title: 'Commute Efficiency', desc: 'Calculate energy efficiency metrics based on actual local electricity rates.', icon: <Zap className="w-6 h-6 text-[#0249ad]" /> }
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
                                q: 'How is EV savings calculated?',
                                a: 'EV savings is calculated by comparing fuel costs: (Commute Distance ÷ Petrol Mileage) × Petrol Price vs electrical charging costs: (Commute Distance ÷ EV Efficiency) × Electricity Tariff. The difference represents the net monthly/yearly savings.'
                            },
                            {
                                q: 'What is the running cost difference between EV and petrol?',
                                a: 'Petrol vehicles average around ₹7 to ₹10 per km depending on mileage. EVs typically run on less than ₹1.5 per km, resulting in savings of over 80% on commute energy expenses.'
                            },
                            {
                                q: 'Is maintenance cheaper for an EV?',
                                a: 'Yes, EVs have far fewer moving parts (no engine, gearbox, spark plugs, or exhaust systems), which translates to significantly lower routine maintenance costs over time.'
                            },
                            {
                                q: 'How long does it take to break even on an EV purchase?',
                                a: 'Depending on daily usage, most EV owners break even on the higher initial purchase price within 3 to 5 years through accumulated fuel and maintenance savings.'
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

                {/* Related Tools Links */}
                <div className="mt-16 pt-8 border-t border-slate-200">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">Explore More EV Tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { name: 'EV EMI Calculator', desc: 'Forecast loan details and monthly interest schedules.', href: '/tools/ev-emi-calculator' },
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

            {/* FOOTER */}
            <Footer />
        </div>
    );
}