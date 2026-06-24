import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAllPosts } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'EV News — Latest Electric Vehicle Updates in India',
  description: 'Stay updated with the latest electric vehicle news, new EV launches, pricing revisions, and charging infrastructure projects in India.',
  alternates: {
    canonical: '/news',
  },
};

export default async function NewsPage({ searchParams }) {
  const { search = '' } = await searchParams;
  const news = getAllPosts('news', { search });
  
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        <Breadcrumbs items={[{ label: 'News', href: '/news' }]} />

        {/* Header / Search bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/50">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              EV News Room
            </h1>
            <p className="text-slate-500 text-sm font-semibold mt-1.5 max-w-xl leading-relaxed">
              Stay ahead of the curve with latest updates on EV launches, manufacturer revisions, subsidy adjustments, and infrastructure plans.
            </p>
          </div>

          {/* Search bar */}
          <form action="/news" method="GET" className="w-full md:w-80 md:translate-y-5">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search news, brands, variants..."
                className="bg-white border border-slate-200 text-slate-800 pl-4 pr-10 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0249ad] focus:bg-white transition w-full shadow-sm"
              />
              <button type="submit" className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {search && (
          <p className="text-sm font-bold text-slate-500 bg-blue-50/50 border border-blue-100/50 rounded-xl px-4 py-3 mb-8 max-w-3xl">
            Showing search results for: <span className="text-[#0249ad]">"{search}"</span> ({news.length} matches)
          </p>
        )}

        {news.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-lg font-black text-slate-800 mb-1">No News Articles Found</h3>
            <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              We couldn't find any news articles matching your search query. Try another keyword.
            </p>
            <Link
              href="/news"
              className="mt-6 bg-[#0249ad] hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md inline-block"
            >
              Clear News Search Filter
            </Link>
          </div>
        ) : (
          <div className="w-full">
            {/* News listing layout grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <article
                  key={item.slug}
                  className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* News Image */}
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      {item.category && (
                        <span className="absolute top-4 left-4 bg-orange-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Meta and Body */}
                    <div className="p-5">
                      <span className="text-[11px] font-extrabold text-slate-400 block mb-2 uppercase tracking-wide">
                        {item.date}
                      </span>
                      <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#0249ad] transition-colors duration-200 mb-2">
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <Link
                      href={`/news/${item.slug}`}
                      className="w-full text-center bg-white border-2 border-slate-200 text-slate-700 hover:border-[#0249ad] hover:text-[#0249ad] font-black text-xs tracking-wider uppercase py-2.5 rounded-xl transition-all duration-200 block shadow-sm"
                    >
                      Read Full Article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
