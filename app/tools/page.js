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
        </main>
      </div>

      <Footer />
    </div>
  );
}
