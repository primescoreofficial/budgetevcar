import Header from '@/components/Header';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Header />
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
