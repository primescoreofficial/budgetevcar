'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Spacing System Tokens: 8px (0.5rem) base
// 8px = space-2 (0.5rem)
// 16px = space-4 (1rem)
// 24px = space-6 (1.5rem)
// 32px = space-8 (2rem)
// 40px = space-10 (2.5rem)
// 48px = space-12 (3rem)

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 text-sm font-normal">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '', hover = false, onClick }) {
  const baseClasses = "bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-sm overflow-hidden";
  const hoverClasses = hover ? "hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300" : "";
  
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${hoverClasses} text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

export function Button({ 
  children, 
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'medium',     // 'small' | 'medium' | 'large'
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10 focus:ring-blue-500",
    secondary: "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 focus:ring-slate-700",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-650/10 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-900/60 text-slate-400 hover:text-white focus:ring-slate-700",
  };

  const sizeClasses = {
    small: "text-xs px-3 py-1.5 gap-1.5 h-8",
    medium: "text-xs px-4 py-2.5 gap-2 h-10",
    large: "text-sm px-6 py-3.5 gap-2.5 h-12",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className={`shrink-0 ${size === 'small' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'}`} />}
      {children}
    </button>
  );
}

export function Input({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <input
          className={`w-full bg-slate-950/50 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
            Icon ? 'pl-11' : 'px-4'
          } py-2.5 h-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-semibold mt-1 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

export function TextArea({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea
        className={`w-full bg-slate-950/50 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all px-4 py-2.5 min-h-[100px] ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-semibold mt-1">⚠ {error}</p>}
    </div>
  );
}

export function Select({ 
  label, 
  error, 
  children,
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-2 w-full font-sans">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <select
        className={`w-full bg-slate-950/50 border border-slate-800/80 rounded-xl text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all px-4 py-2.5 h-10 cursor-pointer ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 font-semibold mt-1">⚠ {error}</p>}
    </div>
  );
}

export function Badge({ 
  children, 
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  className = ''
}) {
  const styles = {
    default: 'bg-slate-850 text-slate-300 border border-slate-800',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-hidden border border-slate-900 bg-slate-950/20 rounded-2xl ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-300 border-collapse table-auto">
          {children}
        </table>
      </div>
    </div>
  );
}
