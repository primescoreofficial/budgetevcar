'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Calculator, Zap, Fuel, BatteryCharging, ArrowRight } from 'lucide-react';

export default function ToolsLandingPage() {

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
      name: 'EV Trip Cost Calculator',
      desc: 'Compare charging electrical expenses with standard internal combustion engine fuel expenses.',
      href: '/tools/ev-running-cost-calculator',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      tag: 'Active',
      comingSoon: false,
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
        <Header />

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
            <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0249ad] text-[11px] font-extrabold uppercase tracking-widest px-4.5 py-1.5 rounded-full mb-4 border border-blue-100/60 shadow-sm">
              <div className="relative w-4.5 h-4.5 overflow-hidden rounded-full border border-blue-100 flex-shrink-0">
                <Image src="/logo/newlogo-removebg.png" alt="BudgetEV Logo" fill className="object-cover" sizes="18px" />
              </div>
              <span>Ecosystem Directory</span>
            </span>
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

          {/* SEO Informational Content Section */}
          <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Interactive EV Utilities & Financial Calculators</h2>
            <div className="text-slate-650 text-sm font-medium leading-relaxed space-y-6">
              <p>
                Switching to an electric vehicle involves analyzing new financial paradigms, charging schedules, and energy metrics. Our suite of free <Link href="/tools" className="text-[#0249ad] font-bold hover:underline">EV calculators</Link> is engineered to help Indian car buyers transition from internal combustion engine (ICE) cars to electric vehicles with confidence. By planning your loan EMI, trip budgets, and home charging configurations, you ensure complete clarity before stepping into a dealership.
              </p>
              
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">How Our Specialized EV Tools Help You Make Smart Decisions</h3>
              <p>
                Each utility addresses a specific concern that car buyers face when selecting their vehicle:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>EV EMI Calculator:</strong> Auto loans for electric cars often have different parameters, and many banks offer lower "green car loan" interest rates. Use our <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">EV EMI calculator</Link> to estimate monthly payments, compute total accumulated interest, and configure terms to fit your budget.
                </li>
                <li>
                  <strong>EV Savings Calculator:</strong> Estimate your potential savings on energy, fuel, and routine services compared to petrol or diesel. Calculate monthly, annual, and 5-year accumulations using our specialized <Link href="/calculator" className="text-[#0249ad] font-bold hover:underline">EV savings calculator</Link>.
                </li>
                <li>
                  <strong>EV Trip Cost Calculator:</strong> Highway journeys require mapping DC fast chargers and estimating electrical consumption. Check out our <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV running cost calculator</Link> to budget trip costs and compare them with standard fuel costs.
                </li>
                <li>
                  <strong>EV Charging Time Calculator:</strong> Compute the exact duration needed to charge your battery pack using our <Link href="/tools/ev-charging-time-calculator" className="text-[#0249ad] font-bold hover:underline">EV charging time calculator</Link>. Model scenarios for standard home AC sockets (15A, 3.3 kW, 7.2 kW) and public DC fast chargers (30 kW, 50 kW, 60 kW, 120 kW).
                </li>
              </ul>
              
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Maximizing Value from Your First Electric Car</h3>
              <p>
                Using these tools collectively lets you draft a comprehensive ownership budget. For instance, you can use the EMI calculator to set your target purchase price, check the savings calculator to see how quickly you cover that initial price premium, and utilize the charging time calculator to plan your weekly charging routine. Discover and filter all available options in our <Link href="/find-ev" className="text-[#0249ad] font-bold hover:underline">electric car finder</Link> and make side-by-side spec comparisons on our <Link href="/compare" className="text-[#0249ad] font-bold hover:underline">compare EVs</Link> portal.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
