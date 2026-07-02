'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Graceful delay of 1.6s to align with a full breath cycle before fading out
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  // Prevent scrolling and interaction while splash screen is visible
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  // Completely unmount 400ms after the fade-out animation completes
  const [render, setRender] = useState(true);
  useEffect(() => {
    if (!visible) {
      const unmountTimer = setTimeout(() => {
        setRender(false);
      }, 400);
      return () => clearTimeout(unmountTimer);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breath {
          0%, 100% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-breath {
          animation: breath 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-breath {
            animation: none !important;
            transform: scale(1) !important;
          }
        }
      `}} />
      <div
        className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center select-none transition-opacity duration-350 ease-out ${
          !visible ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        <div className="relative w-44 h-20 sm:w-48 sm:h-24 md:w-52 md:h-28 animate-breath">
          <Image
            src="/logo/2.png"
            alt="BudgetEV Logo"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 640px) 176px, (max-width: 768px) 192px, 208px"
          />
        </div>
      </div>
    </>
  );
}
