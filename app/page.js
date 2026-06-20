import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export const metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

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
      <HomeClient cars={cars} brands={brands} bodyTypes={bodyTypes} />
    </>
  );
}
