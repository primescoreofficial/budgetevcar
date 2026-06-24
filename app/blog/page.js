import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAllPosts } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'EV Guides & Blogs — BudgetEV',
  description: 'Learn everything about electric vehicles in India. Read expert guides, battery technology analyses, charging tips, and cost comparisons.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage({ searchParams }) {
  const { search = '' } = await searchParams;
  const posts = getAllPosts('blogs', { search });
  const allPosts = getAllPosts('blogs'); // For category/tag listing calculations
  
  // Extract unique categories and tags
  const categories = [...new Set(allPosts.map(p => p.category).filter(Boolean))];
  const tags = [...new Set(allPosts.flatMap(p => p.tags || []).filter(Boolean))];
  
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }]} />

        {/* Page Title & Search Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/50">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              EV Guides & Blogs
            </h1>
            <p className="text-slate-500 text-sm font-semibold mt-1.5 max-w-xl leading-relaxed">
              Explore resources, cost comparisons, battery longevity tips, and charging manuals to make your switch to electric easy.
            </p>
          </div>

          {/* Search Form */}
          <form action="/blog" method="GET" className="relative w-full md:w-80">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search guides, categories, tags..."
              className="bg-white border border-slate-200 text-slate-800 pl-4 pr-10 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0249ad] focus:bg-white transition w-full shadow-sm"
            />
            <button type="submit" className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Listings */}
          <div className="lg:col-span-8 space-y-8">
            {search && (
              <p className="text-sm font-bold text-slate-500 bg-blue-50/50 border border-blue-100/50 rounded-xl px-4 py-3">
                Showing search results for: <span className="text-[#0249ad]">"{search}"</span> ({posts.length} matches)
              </p>
            )}

            {posts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-black text-slate-800 mb-1">No Guides Found</h3>
                <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                  We couldn't find any articles matching your search query. Try another keyword.
                </p>
                <Link
                  href="/blog"
                  className="mt-6 bg-[#0249ad] hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md inline-block"
                >
                  Clear Search Filter
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <article 
                    key={post.slug} 
                    className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Featured Image */}
                      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        {post.category && (
                          <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wide">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readingTime}</span>
                        </div>
                        
                        <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#0249ad] transition-colors duration-200 mb-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>
                        
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                          {post.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="w-full text-center bg-white border-2 border-slate-200 text-slate-700 hover:border-[#0249ad] hover:text-[#0249ad] font-black text-xs tracking-wider uppercase py-2.5 rounded-xl transition-all duration-200 block shadow-sm"
                      >
                        Read Full Guide
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Categories */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Categories</h4>
              <div className="space-y-2">
                {categories.map(c => {
                  const slug = c.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={c}
                      href={`/blog/category/${slug}`}
                      className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#0249ad] py-1.5 transition-colors"
                    >
                      <span>{c}</span>
                      <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {allPosts.filter(p => p.category === c).length}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 font-bold">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => {
                  const slug = t.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={t}
                      href={`/blog/tag/${slug}`}
                      className="bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#0249ad] border border-slate-200/60 hover:border-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      #{t}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
