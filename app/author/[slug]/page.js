import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAuthorBySlug, getAuthorContributions } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};

  return {
    title: `${author.name} — Author Profile BudgetEV`,
    description: author.bio,
    alternates: {
      canonical: `/author/${slug}`,
    },
  };
}

export default async function AuthorProfilePage({ params }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author || author.slug !== slug) notFound();

  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();
  const { blogs = [], news = [] } = getAuthorContributions(slug);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        <Breadcrumbs
          items={[
            { label: 'Authors', href: '#' },
            { label: author.name }
          ]}
        />

        {/* Profile Card Header */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50 relative shadow-sm">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center md:text-left space-y-3">
            <div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-md uppercase tracking-wider shadow-sm shadow-blue-50/40">
                {author.role}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                {author.name}
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed max-w-2xl">
              {author.bio}
            </p>
          </div>
        </section>

        {/* Contributions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Blogs/Guides Written */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-200/60 flex items-center justify-between">
              <span>Articles & Guides</span>
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {blogs.length}
              </span>
            </h2>

            {blogs.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 py-6">No articles written by this author yet.</p>
            ) : (
              <div className="space-y-4">
                {blogs.map(post => (
                  <div 
                    key={post.slug}
                    className="group bg-white border border-slate-200/50 hover:border-blue-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300 flex gap-4"
                  >
                    <div className="w-20 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0249ad] transition-colors line-clamp-1 leading-snug">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1">
                          {post.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 mt-2 uppercase tracking-wide">
                        <span>{post.date}</span>
                        <span>{post.readingTime} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* News Written */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-200/60 flex items-center justify-between">
              <span>EV News Reports</span>
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {news.length}
              </span>
            </h2>

            {news.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 py-6">No news reports published by this author yet.</p>
            ) : (
              <div className="space-y-4">
                {news.map(item => (
                  <div 
                    key={item.slug}
                    className="group bg-white border border-slate-200/50 hover:border-blue-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300 flex gap-4"
                  >
                    <div className="w-20 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0249ad] transition-colors line-clamp-1 leading-snug">
                          <Link href={`/news/${item.slug}`}>{item.title}</Link>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 mt-2 uppercase tracking-wide">
                        <span>{item.date}</span>
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
