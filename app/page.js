import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';
import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  keywords: [
    'best budget electric car India 2026',
    'cheapest electric car under 10 lakh',
    'budget EV car comparison India',
    'electric car price under 15 lakh India',
    'affordable EV specifications India',
    'compare budget electric cars India',
    'budget electric SUV India',
    'cheapest EV with best range India',
  ],
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  // Fetch latest blogs and news (limit to 4)
  const latestBlogs = getAllPosts('blogs').slice(0, 4);
  const latestNews = getAllPosts('news').slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Budget EV Car',
    url: 'https://budgetevcar.com',
    potentialAction: {
      '@type': 'SearchAction',
      'target': 'https://budgetevcar.com/find-ev?brand={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient 
        cars={cars} 
        brands={brands} 
        bodyTypes={bodyTypes} 
        latestBlogs={latestBlogs}
        latestNews={latestNews}
      />
    </>
  );
}
