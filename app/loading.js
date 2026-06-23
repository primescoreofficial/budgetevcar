import Header from '@/components/Header';

export default function Loading() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="w-3/4 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
              <div className="w-1/2 h-12 bg-blue-100 rounded-xl animate-pulse"></div>
            </div>
            <div className="w-full h-6 bg-slate-100 rounded animate-pulse"></div>
            <div className="w-3/4 h-6 bg-slate-100 rounded animate-pulse"></div>
            <div className="flex gap-4 pt-2">
              <div className="w-32 h-12 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="w-36 h-12 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-slate-200 rounded-[2rem] aspect-[4/3] animate-pulse"></div>
          </div>
        </div>
        <div className="mt-16">
          <div className="w-64 h-8 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="w-full h-40 bg-slate-100 rounded-xl animate-pulse mb-4"></div>
                <div className="w-3/4 h-5 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="w-1/2 h-4 bg-blue-100 rounded animate-pulse mb-4"></div>
                <div className="w-full h-10 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
