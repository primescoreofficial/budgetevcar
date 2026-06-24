'use client';
import { useEffect, useState } from 'react';

export default function TableOfContents({ items = [] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -40% 0px', threshold: 0.1 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      items.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-5 md:p-6 sticky top-28">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Table of Contents</h4>
      <nav className="space-y-2.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
              setActiveId(item.id);
            }}
            className={`block text-xs font-bold transition-all ${
              item.level === 3 ? 'pl-4 text-slate-500' : 'text-slate-700'
            } ${
              activeId === item.id 
                ? 'text-blue-600 font-extrabold translate-x-1' 
                : 'hover:text-slate-900'
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
