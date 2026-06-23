import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <>
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold text-[#1e3a8a] tracking-tight">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 overflow-hidden rounded-full border border-slate-100 flex-shrink-0">
                <Image src="/logo/logo.png" alt="BudgetEV Logo" fill className="object-cover" sizes="(max-width: 640px) 40px, 44px" priority />
              </div>
              <span>BudgetEV</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-slate-600">
              <Link href="/" className="hover:text-slate-900 transition">Home</Link>
              <Link href="/find-ev" className="hover:text-slate-900 transition">Find EV</Link>
              <Link href="/compare" className="hover:text-slate-900 transition font-medium">Compare</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 text-center">
        <div className="text-7xl mb-6">🔌</div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Page Not Found</h1>
        <p className="text-slate-500 text-lg font-medium mb-8">The vehicle or page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-full text-sm font-semibold transition shadow-sm">
            Go Home
          </Link>
          <Link href="/find-ev" className="bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 px-6 py-3 rounded-full text-sm font-semibold transition">
            Browse EVs
          </Link>
        </div>
      </main>
    </>
  );
}
