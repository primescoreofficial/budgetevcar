import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { getPostBySlug, getAllPosts } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes, getCarUrl } from '@/lib/queries';
import '@/app/blog.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'blogs');
  if (!post) return {};

  return {
    title: `${post.frontmatter.title} — BudgetEV`,
    description: post.frontmatter.description,
    keywords: [
      ...(post.frontmatter.tags || []),
      post.frontmatter.category,
      'electric vehicle',
      'EV India',
      'BudgetEV',
    ].filter(Boolean),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.author?.name || 'BudgetEV Team'],
      images: [
        {
          url: post.frontmatter.image,
          width: 800,
          height: 500,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description?.slice(0, 200),
      images: [post.frontmatter.image],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'blogs');
  if (!post) notFound();

  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  // Find related articles (same category or sharing tags, excluding current)
  const allPosts = await getAllPosts('blogs');

  const relatedArticles = allPosts
    .filter(p => p.slug !== slug && (p.category === post.frontmatter.category || (p.tags || []).some(t => (post.frontmatter.tags || []).includes(t))))
    .slice(0, 3);

  // Schema Markups
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    image: post.frontmatter.image,
    datePublished: post.frontmatter.date,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'BudgetEV Team',
      url: `https://budgetevcar.com/author/${post.author?.slug || 'budgetev-team'}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'BudgetEV',
      logo: {
        '@type': 'ImageObject',
        url: 'https://budgetevcar.com/logo/2.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://budgetevcar.com/blog/${slug}`
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://budgetevcar.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://budgetevcar.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.frontmatter.title,
        item: `https://budgetevcar.com/blog/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <ReadingProgressBar />
      <Header />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.frontmatter.title }
          ]}
        />

        {/* Hero Section */}
        <header className="mb-10 max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <Link
              href={`/blog/category/${post.frontmatter.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[10px] font-black text-[#0249ad] bg-blue-50 px-3 py-1 rounded-md uppercase tracking-wider"
            >
              {post.frontmatter.category}
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            {post.frontmatter.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500 mb-6">
            <div className="flex items-center gap-2">
              <span>By</span>
              <Link 
                href={`/author/${post.author?.slug || 'budgetev-team'}`} 
                className="text-[#0249ad] hover:underline"
              >
                {post.author?.name || 'BudgetEV Team'}
              </Link>
            </div>
            <span>•</span>
            <span>{post.frontmatter.date}</span>
            <span>•</span>
            <span>{post.frontmatter.readingTime} read</span>
          </div>

          <div className="flex justify-center border-y border-slate-200/55 py-3">
            <ShareButtons title={post.frontmatter.title} url={`/blog/${slug}`} />
          </div>
        </header>

        {/* Featured Image */}
        <div className="w-full max-w-5xl mx-auto aspect-[21/9] bg-slate-100 rounded-3xl overflow-hidden mb-12 shadow-md">
          <img
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto items-start">
          {/* Article Body */}
          <div className="flex-1 w-full">
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Tags block */}
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                {post.frontmatter.tags.map(t => (
                  <Link
                    key={t}
                    href={`/blog/tag/${t.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#0249ad] border border-slate-200/60 text-[10px] font-bold px-3 py-1 rounded-md transition"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Profile Box */}
            {post.author && (
              <div className="mt-12 p-6 bg-slate-50 border border-slate-200/60 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-white relative">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    {post.author.role}
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    <Link href={`/author/${post.author.slug}`} className="hover:text-[#0249ad] transition-colors">
                      {post.author.name}
                    </Link>
                  </h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Related EVs Deck */}
            {post.relatedEvs && post.relatedEvs.length > 0 && (
              <section className="mt-16 border-t border-slate-200/60 pt-10">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Related Electric Vehicles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {post.relatedEvs.map(car => (
                    <div 
                      key={car.serial_no}
                      className="group bg-white border border-slate-200/60 hover:border-blue-300 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 flex items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 relative border border-slate-100">
                        <img
                          src={car.vehicle_image}
                          alt={car.model_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          {car.brand}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 truncate leading-snug">
                          {car.model_name}
                        </h4>
                        <span className="text-xs text-[#0249ad] font-bold block mt-1">
                          {car.battery_capacity ? `${car.battery_capacity} kWh` : ''}
                        </span>
                        <Link
                          href={getCarUrl(car)}
                          className="text-[10px] font-black text-[#0249ad] hover:text-blue-800 uppercase tracking-wider mt-2 inline-flex items-center gap-1"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (TOC & Related Articles) */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <TableOfContents items={post.toc} />

            {/* Related Articles Card */}
            {relatedArticles.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Related Guides</h4>
                <div className="space-y-4">
                  {relatedArticles.map(art => (
                    <div key={art.slug} className="group flex gap-3">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#0249ad] transition-colors line-clamp-2 leading-snug">
                          <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                        </h5>
                        <span className="text-[9px] text-slate-400 font-extrabold block mt-1">
                          {art.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
