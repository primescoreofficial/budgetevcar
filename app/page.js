import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';
import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  keywords: [
    'best electric car India',
    'budget electric vehicle',
    'EV comparison India',
    'electric car price India',
    'EV specifications',
    'compare electric cars',
    'electric SUV India',
    'cheapest EV India',
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
    name: 'BudgetEV',
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
