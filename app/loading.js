export default function Loading() {
  return (
    <>
      {/* HEADER SKELETON */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="w-24 h-7 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="w-12 h-4 bg-slate-100 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-slate-100 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-slate-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-24 h-9 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
      </header>
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
