import Link from 'next/link';
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
    { href: '/calculator', label: 'Calculator' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-100 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-900">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity">
              <Zap className="w-6 h-6 text-blue-500 fill-blue-500/20 animate-pulse" />
              <span>BudgetEV</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              India's most trusted platform for finding, comparing, and analyzing electric vehicles within your budget. Simplifying your switch to green energy.
            </p>
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

          {/* Popular Brands Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Popular Brands</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              {displayBrands.map((brand) => (
                <li key={brand}>
                  <Link 
                    href={`/find-ev?brand=${encodeURIComponent(brand)}`} 
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 block py-0.5"
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support Column */}
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
              <li className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Jodhpur, India</span>
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
