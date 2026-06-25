import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Zap } from 'lucide-react';
import FooterQueryForm from './FooterQueryForm';

export default function Footer({ brands = [], bodyTypes = [] }) {
  const displayBrands = brands.length > 0
    ? brands.slice(0, 5)
    : ['Tata', 'MG', 'Mahindra', 'BYD', 'Hyundai'];

  const displayBodyTypes = bodyTypes.length > 0
    ? bodyTypes.slice(0, 5)
    : ['SUV', 'Hatchback', 'Sedan', 'Luxury'];

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-ev', label: 'Find EV' },
    { href: '/compare', label: 'Compare' },
    { href: '/tools', label: 'Tools' },
    { href: '/charging-stations', label: 'Charging Stations' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-100 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-8 md:gap-12 pb-12 border-b border-slate-900">

          {/* Brand Column */}
          <div className="w-full md:w-1/4 space-y-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="relative w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 flex-shrink-0">
                <Image
                  src="/logo/1.png"
                  alt="BudgetEV Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  priority
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              {"India's"} most trusted platform for finding, comparing, and analyzing electric vehicles within your budget. Simplifying your switch to green energy.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3.5 pt-2">
              {['twitter', 'facebook', 'linkedin', 'instagram'].map((platform) => (
                <a key={platform} href={`#${platform}`} className="text-slate-500 hover:text-white transition-colors duration-200" aria-label={platform}>
                  <span className="capitalize text-xs font-bold">{platform}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Wrapper Grid */}
          <div className="w-full md:w-3/4 flex flex-wrap md:flex-nowrap justify-between gap-8 md:gap-4">
            {/* Quick Links Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* EV Categories Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">EV Categories</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {displayBodyTypes.map((type) => (
                  <li key={type}>
                    <Link
                      href={`/find-ev?bodyType=${encodeURIComponent(type)}`}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {type}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* News Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">News</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/news', label: 'Latest EV News' },
                  { href: '/news', label: 'Industry Updates' },
                  { href: '/news', label: 'New Launches' },
                  { href: '/news', label: 'Charging Network Updates' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blogs Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Blogs</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/blog/category/buying-guide', label: 'EV Buying Guides' },
                  { href: '/blog/category/analysis', label: 'EV Comparisons' },
                  { href: '/blog/category/charging', label: 'Charging Guides' },
                  { href: '/blog/category/technology', label: 'Battery & Technology' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools Column */}
            <div className="w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[140px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tools</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  { href: '/tools/ev-emi-calculator', label: 'EMI Calculator' },
                  { href: '/tools/ev-running-cost-calculator', label: 'Trip Cost Calculator' },
                  { href: '/tools/ev-savings-calculator', label: 'Savings Calculator' },
                  { href: '/tools/ev-charging-time-calculator', label: 'Charging Calculator' }
                ].map((tool) => (
                  <li key={tool.label}>
                    <Link
                      href={tool.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                    >
                      {tool.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="w-full sm:w-[calc(50%-1rem)] md:w-auto md:flex-1 space-y-4 min-w-[220px]">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Support</h4>
              <div className="pt-2">
                <FooterQueryForm />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} BudgetEV. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Made for {"India's"} EV revolution</span>
            <Zap className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
