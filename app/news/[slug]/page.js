import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { getPostBySlug, getAllPosts } from '@/lib/content';
import { getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import '@/app/blog.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getPostBySlug(slug, 'news');
  if (!item) return {};

  return {
    title: `${item.frontmatter.title} — EV News BudgetEV`,
    description: item.frontmatter.description,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      title: item.frontmatter.title,
      description: item.frontmatter.description,
      type: 'article',
      publishedTime: item.frontmatter.date,
      authors: [item.author?.name || 'BudgetEV Team'],
      images: [
        {
          url: item.frontmatter.image,
          width: 800,
          height: 500,
          alt: item.frontmatter.title,
        },
      ],
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const item = await getPostBySlug(slug, 'news');
  if (!item) notFound();

  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  // Find related news (excluding current)
  const allNews = getAllPosts('news');
  const relatedNews = allNews
    .filter(n => n.slug !== slug)
    .slice(0, 3);

  // Schema Markups
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.frontmatter.title,
    description: item.frontmatter.description,
    image: item.frontmatter.image,
    datePublished: item.frontmatter.date,
    author: {
      '@type': 'Person',
      name: item.author?.name || 'BudgetEV Team',
      url: `https://budgetevcar.com/author/${item.author?.slug || 'budgetev-team'}`
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
      '@id': `https://budgetevcar.com/news/${slug}`
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
        name: 'News',
        item: 'https://budgetevcar.com/news'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.frontmatter.title,
        item: `https://budgetevcar.com/news/${slug}`
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
            { label: 'News', href: '/news' },
            { label: item.frontmatter.title }
          ]}
        />

        {/* Article Layout */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center sm:text-left">
            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-md uppercase tracking-wider shadow-sm shadow-orange-100">
              {item.frontmatter.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mt-4 mb-6">
              {item.frontmatter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mb-6 border-b border-slate-200/50 pb-5 justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span>Reported by</span>
                  <Link 
                    href={`/author/${item.author?.slug || 'budgetev-team'}`} 
                    className="text-[#0249ad] hover:underline"
                  >
                    {item.author?.name || 'BudgetEV Team'}
                  </Link>
                </div>
                <span>•</span>
                <span>{item.frontmatter.date}</span>
              </div>
              
              <ShareButtons title={item.frontmatter.title} url={`/news/${slug}`} />
            </div>
          </header>

          {/* Featured Image */}
          <div className="w-full aspect-[21/10] bg-slate-100 rounded-3xl overflow-hidden mb-10 shadow-sm border border-slate-200/40">
            <img
              src={item.frontmatter.image}
              alt={item.frontmatter.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: item.contentHtml }}
              />

              {/* Tags block */}
              {item.frontmatter.tags && item.frontmatter.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {item.frontmatter.tags.map(t => (
                    <span
                      key={t}
                      className="bg-slate-50 text-slate-500 border border-slate-200/60 text-[10px] font-bold px-3 py-1 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar with related news */}
            <aside className="lg:col-span-4 space-y-6">
              {relatedNews.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Latest EV News</h4>
                  <div className="space-y-4">
                    {relatedNews.map(n => (
                      <div key={n.slug} className="group flex gap-3">
                        <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                          <img
                            src={n.image}
                            alt={n.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#0249ad] transition-colors line-clamp-2 leading-snug">
                            <Link href={`/news/${n.slug}`}>{n.title}</Link>
                          </h5>
                          <span className="text-[9px] text-slate-400 font-extrabold block mt-1">
                            {n.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer brands={brands} bodyTypes={bodyTypes} />
    </div>
  );
}
