'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '@/app/admin/components/DesignSystem';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/admin/dashboard');
      } else {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data?.session) {
        try {
          await supabase.from('activity_logs').insert({
            admin_name: data.user.email,
            action: 'Admin logged in',
            details: `Logged in successfully`
          });
        } catch (logErr) {
          console.warn('Logging error:', logErr);
        }
        router.replace('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative radial glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-50 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 space-y-6 border border-slate-200 bg-white shadow-xl">
          <div className="text-center">
            <img src="/logo/2.png" alt="BudgetEV Logo" className="h-12 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">BudgetEV Admin</h1>
            <p className="text-slate-500 text-xs mt-1 uppercase font-bold tracking-widest">Sign in to control center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-55/60 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budgetev@superadmin.com"
              icon={Mail}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="large"
              className="w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
