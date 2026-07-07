'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Car, 
  BookOpen, 
  Newspaper, 
  FolderHeart, 
  Bot, 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Cars', icon: Car, path: '/admin/cars' },
  { name: 'Blogs', icon: BookOpen, path: '/admin/blogs' },
  { name: 'News', icon: Newspaper, path: '/admin/news' },
  { name: 'Media Library', icon: FolderHeart, path: '/admin/media' },
  { name: 'AI Settings', icon: Bot, path: '/admin/ai-settings' },
  { name: 'Website Settings', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img src="/logo/2.png" alt="BudgetEV Logo" className="h-8 object-contain" />
          <span className="text-slate-900 font-extrabold text-xs tracking-tight uppercase">Admin Panel</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Drawer Backdrop) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-5 flex flex-col z-50 shrink-0 transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-20 lg:pt-6
      `}>
        {/* Logo Section */}
        <div className="hidden lg:flex items-center gap-2.5 px-1 mb-8">
          <img src="/logo/2.png" alt="BudgetEV Logo" className="h-10 object-contain shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-slate-950 font-black text-sm tracking-tight font-sans leading-tight">BudgetEV</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-205 group border
                  ${isActive 
                    ? 'bg-blue-50 text-[#1e40af] border-blue-100 shadow-sm shadow-blue-500/5' 
                    : 'text-slate-600 hover:text-[#1e40af] hover:bg-slate-50 border-transparent'}
                `}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1e40af]' : 'text-slate-400 group-hover:text-[#1e40af]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4" />

        {/* Footer Area */}
        <div className="space-y-2">
          {/* User Profile display card */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-[#1e40af] uppercase shrink-0">
              {userEmail ? userEmail.slice(0, 2) : 'AD'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-800 truncate leading-none">{userEmail || 'Administrator'}</p>
              <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Superuser</p>
            </div>
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:opacity-90"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
