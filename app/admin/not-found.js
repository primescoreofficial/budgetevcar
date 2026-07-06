'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-blue-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">404 — Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-8">
        The admin page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/admin/dashboard" 
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 px-6 rounded-2xl transition shadow-lg shadow-blue-500/10 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
