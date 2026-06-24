'use client';
import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3.5px] bg-slate-100 z-[100]">
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(37,99,235,0.5)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
