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
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles
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
      <div className="lg:hidden h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-900/60 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span className="text-white font-extrabold text-sm tracking-tight">BudgetEV Admin</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-400 hover:text-white transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Drawer Backdrop) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-900/80 p-5 flex flex-col z-50 shrink-0 transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-20 lg:pt-6
      `}>
        {/* Logo Section */}
        <div className="hidden lg:flex items-center gap-3 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-blue-650/10 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <span className="text-white font-extrabold text-base tracking-tight font-sans">BudgetEV Admin</span>
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
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group border
                  ${isActive 
                    ? 'bg-blue-650/10 text-white border-blue-500/20 shadow-md shadow-blue-500/5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'}
                `}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-350'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-slate-900/80 my-4" />

        {/* Footer Area */}
        <div className="space-y-2">
          {/* User Profile display card */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/20 border border-slate-900/60">
            <div className="w-7 h-7 rounded-lg bg-blue-650/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 uppercase shrink-0">
              {userEmail ? userEmail.slice(0, 2) : 'AD'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200 truncate leading-none">{userEmail || 'Administrator'}</p>
              <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Superuser</p>
            </div>
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/5 hover:text-red-300 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
