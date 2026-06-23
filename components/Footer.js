import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Zap } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-900">
          
          {/* Brand Column */}
          <div className="md:col-span-3 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity">
              <div className="relative w-6 h-6 overflow-hidden rounded-full border border-white/10 flex-shrink-0">
                <Image src="/logo/logo_white_bg.png" alt="BudgetEV Logo" fill className="object-cover" sizes="24px" />
              </div>
              <span>BudgetEV</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              India's most trusted platform for finding, comparing, and analyzing electric vehicles within your budget. Simplifying your switch to green energy.
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

          {/* Quick Links Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
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
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">EV Categories</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
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

          {/* Tools Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tools</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              {[
                { href: '/tools/ev-emi-calculator', label: 'EV EMI Calculator' },
                { href: '/tools/ev-running-cost-calculator', label: 'EV Trip Cost Calculator' },
                { href: '/tools/ev-savings-calculator', label: 'EV Savings Calculator' },
                { href: '/tools/ev-charging-time-calculator', label: 'EV Charging Time Calculator' }
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
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Support</h4>
            <ul className="space-y-3.5 text-sm font-semibold">
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="tel:+916350671636" className="hover:text-blue-400 transition-colors duration-200">
                  +91 63506-71636
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="mailto:info@budgetevcar.com" className="hover:text-blue-400 transition-colors duration-200">
                  info@budgetevcar.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} BudgetEV. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Made for India's EV revolution</span>
            <Zap className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
