import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAllPosts } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');
  return {
    title: `EV Guides on #${tagName} — BudgetEV`,
    description: `Read all our expert electric vehicle articles and guides tagged with #${tagName}.`
  };
}

export default async function BlogTagPage({ params }) {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');
  const posts = await getAllPosts('blogs', { tag: slug });

  
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        <Breadcrumbs 
          items={[
            { label: 'Blog', href: '/blog' },
            { label: `#${tagName}`, href: `/blog/tag/${slug}` }
          ]} 
        />

        <div className="mb-10 pb-6 border-b border-slate-200/50">
          <span className="text-[10px] font-black text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md uppercase tracking-widest">
            Tag
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 capitalize">
            #{tagName} Guides
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1.5 max-w-xl">
            Browse all EV guides and analysis posts tagged with #{tagName}.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-1">No Guides Found</h3>
            <p className="text-slate-400 text-sm font-semibold mb-6">
              We couldn't find any articles tagged with "#{tagName}".
            </p>
            <Link href="/blog" className="bg-[#0249ad] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:bg-blue-700">
              Back to Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article 
                key={post.slug} 
                className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>
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
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
