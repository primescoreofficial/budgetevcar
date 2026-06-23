'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getCarUrl } from '@/lib/queries';

export default function CompareClient({ cars }) {
  const [selectedCar1, setSelectedCar1] = useState('');
  const [selectedCar2, setSelectedCar2] = useState('');
  const [selectedCar3, setSelectedCar3] = useState('');

  const car1 = cars.find(c => String(c.serial_no) === selectedCar1) || null;
  const car2 = cars.find(c => String(c.serial_no) === selectedCar2) || null;
  const car3 = cars.find(c => String(c.serial_no) === selectedCar3) || null;

  const selectedCars = [car1, car2, car3].filter(Boolean);

  const comparisonRows = [
    { label: 'Brand', key: 'brand' },
    { label: 'Model', key: 'model_name' },
    { label: 'Variant', key: 'variant_name' },
    { label: 'Body Type', key: 'body_type' },
    { label: 'Battery Capacity', key: 'battery_capacity', suffix: ' kWh' },
    { label: 'Segment', key: 'segment' },
  ];

  return (
    <>
      <Header />

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Compare Electric Vehicles</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Select up to 3 cars to compare side by side</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { value: selectedCar1, setter: setSelectedCar1, label: 'Select First Car', others: [selectedCar2, selectedCar3] },
            { value: selectedCar2, setter: setSelectedCar2, label: 'Select Second Car', others: [selectedCar1, selectedCar3] },
            { value: selectedCar3, setter: setSelectedCar3, label: 'Select Third Car (Optional)', others: [selectedCar1, selectedCar2] },
          ].map((selector, idx) => (
            <div key={idx} className="relative">
              <select
                value={selector.value}
                onChange={(e) => selector.setter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-[#0249ad] focus:bg-white transition cursor-pointer"
              >
                <option value="">{selector.label}</option>
                {cars.map(car => (
                  <option
                    key={car.serial_no}
                    value={String(car.serial_no)}
                    disabled={selector.others.includes(String(car.serial_no))}
                  >
                    {car.brand} - {car.model_name || car.detailed_name} {car.variant_name ? `(${car.variant_name})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          ))}
        </div>

        {selectedCars.length >= 2 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`grid gap-4 mb-8 grid-cols-2 md:grid-cols-${selectedCars.length}`}>
              {selectedCars.map((car, idx) => (
                <motion.div
                  key={car.serial_no}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm"
                >
                  <div className="w-full h-28 sm:h-44 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                    <img src={car.vehicle_image} alt={car.model_name || car.detailed_name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{car.model_name || car.detailed_name}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{car.brand}</p>
                </motion.div>
              ))}
            </div>

            {/* Responsive Table Wrapper element */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full min-w-[600px] md:min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Specification</th>
                    {selectedCars.map(car => (
                      <th key={car.serial_no} className="text-left px-6 py-4 text-xs font-bold text-[#0249ad] uppercase tracking-wider">
                        {car.model_name || car.detailed_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">{row.label}</td>
                      {selectedCars.map(car => (
                        <td key={car.serial_no} className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {car[row.key] ? `${car[row.key]}${row.suffix || ''}` : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-blue-50/50 border-t border-slate-200">
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">Summary</td>
                    {selectedCars.map(car => (
                      <td key={car.serial_no} className="px-6 py-4 text-xs font-medium text-slate-600 leading-relaxed min-w-[200px]">
                        {car.web_search_summary ? car.web_search_summary.substring(0, 150) + '...' : 'No summary available'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`grid gap-4 mt-6 grid-cols-2 md:grid-cols-${selectedCars.length}`}>
              {selectedCars.map(car => (
                <Link
                  key={car.serial_no}
                  href={getCarUrl(car)}
                  className="w-full text-center bg-white border-2 border-[#0249ad] text-[#0249ad] hover:bg-[#0249ad] hover:text-white font-extrabold text-xs tracking-wide py-3 rounded-xl transition-all duration-200 block"
                >
                  View {car.model_name || 'Details'}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white border border-slate-200 rounded-2xl px-4">
            <div className="flex justify-center items-center mb-4">
              {/* Compare section placeholder image */}
              <img
                src="/cars.png"
                alt="Cars"
                className="w-[280px] md:w-[500px] lg:w-[650px] xl:w-[800px] h-auto object-contain"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">Select at least 2 cars to compare</h3>
            <p className="text-slate-400 text-sm font-medium">Use the dropdowns above to pick cars from our database.</p>
          </div>
        )}

        {/* SEO Informational Content Section */}
        <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Why Comparing Electric Vehicles Matters</h2>
          <div className="text-slate-600 text-sm font-medium leading-relaxed space-y-6">
            <p>
              Transitioning to electric mobility is a major milestone, but finding the right vehicle can feel overwhelming given the rapidly growing options. Performing a detailed <Link href="/compare" className="text-[#0249ad] font-bold hover:underline">electric vehicle comparison</Link> is essential to ensure that your investment aligns with your daily driving routine, budget constraints, and charging availability. By evaluating specifications side-by-side, you can make an informed decision that prevents range anxiety and maximizes long-term savings.
            </p>
            
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">Key Factors to Evaluate When You Compare Electric Cars</h3>
            <p>
              To choose the best model, it is crucial to analyze several key criteria that directly impact your ownership experience. An effective <Link href="/compare" className="text-[#0249ad] font-bold hover:underline">EV comparison in India</Link> should focus on these aspects:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Compare EV Prices:</strong> Look beyond the ex-showroom cost. Factor in state-level subsidies, road tax exemptions, and registration discounts, which vary significantly across regions.
              </li>
              <li>
                <strong>Compare EV Range:</strong> Understand the difference between certified range (like MIDC) and real-world range. Select a battery capacity that covers your daily commute comfortably with a 20-30% safety margin.
              </li>
              <li>
                <strong>Battery Capacity and Lifespan:</strong> Compare chemistry types like LFP (Lithium Iron Phosphate) and NMC (Nickel Manganese Cobalt) along with their thermal management systems to ensure durability.
              </li>
              <li>
                <strong>Charging Speeds:</strong> Check the maximum DC charging rate accepted by each vehicle. A car that supports faster charging saves valuable time on long-distance highway road trips.
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-6">How to Choose the Right EV for Your Lifestyle</h3>
            <p>
              Your driving habits dictate the perfect EV specifications. For daily city runs and tight parking spots, compact hatchbacks with moderate battery packs offer high efficiency. For regular highway travel or family trips, prioritising aerodynamic SUVs with high DC fast-charging support is key. Before finalizing your choice, use our <Link href="/tools/ev-running-cost-calculator" className="text-[#0249ad] font-bold hover:underline">EV running cost calculator</Link> to estimate fuel savings, and plan your budgets using our <Link href="/tools/ev-emi-calculator" className="text-[#0249ad] font-bold hover:underline">EV EMI calculator</Link>.
            </p>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </>
  );
}
