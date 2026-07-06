'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from './components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let authSubscription;

    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (pathname !== '/admin/login' && !currentSession) {
        router.replace('/admin/login');
      } else if (pathname === '/admin/login' && currentSession) {
        router.replace('/admin/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (pathname !== '/admin/login' && !currentSession) {
        router.replace('/admin/login');
      } else if (pathname === '/admin/login' && currentSession) {
        router.replace('/admin/dashboard');
      }
      setLoading(false);
    });

    authSubscription = subscription;

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      {/* Sidebar - statically placed on desktop, absolute on mobile */}
      <Sidebar />
      
      {/* Content wrapper */}
      <div className="flex-1 min-w-0 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
