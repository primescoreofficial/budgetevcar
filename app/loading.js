'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center select-none">
      <div className="relative flex flex-col items-center">
        {/* Blue Glow Backdrop Pulse */}
        <motion.div
          initial={{ opacity: 0.15, scale: 0.95 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.95, 1.05, 0.95] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="absolute w-40 h-40 rounded-full bg-blue-100/50 blur-2xl -z-10"
        />

        {/* Logo/Brand Name & Subtitle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <span className="text-4xl sm:text-5xl font-extrabold text-[#0249ad] tracking-tight">
            BudgetEV
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Discover Electric Mobility
          </span>

          {/* Thin, elegant charging line animation */}
          <div className="w-24 h-[1px] bg-slate-100 overflow-hidden relative mt-4">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 1.0,
                ease: "easeInOut",
                repeat: Infinity
              }}
              className="absolute h-full w-1/2 bg-[#0249ad]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
