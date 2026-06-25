import { Suspense } from 'react';
import { getAllCars, getUniqueBrands, getUniqueSegments, getUniqueBodyTypes, getCarUrl } from '@/lib/queries';
import FindEvClient from './FindEvClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Find Electric Vehicles in India — Search & Filter EVs | BudgetEV',
  description: 'Search and filter every electric vehicle available in India by brand, segment, body type, and battery capacity. Find the perfect EV within your budget.',
  keywords: [
    'find electric car India',
    'search EV India',
    'filter electric vehicles',
    'electric car finder',
    'EV search tool',
    'best electric car for budget',
    'Tata EV models',
    'MG electric cars',
    'Mahindra EV',
    'electric SUV India',
    'electric hatchback India',
  ],
  alternates: {
    canonical: '/find-ev',
  },
  openGraph: {
    title: 'Find Electric Vehicles in India — BudgetEV',
    description: 'Search, filter, and compare every electric vehicle available in India. Find the perfect EV for your budget.',
    url: 'https://budgetevcar.com/find-ev',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Find EV' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Electric Vehicles in India — BudgetEV',
    description: 'Search, filter, and compare every EV available in India.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default async function FindEvPage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const segments = await getUniqueSegments();
  const bodyTypes = await getUniqueBodyTypes();

  // ItemList schema for all cars
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Electric Vehicles Available in India',
    description: 'Complete list of electric vehicles available in India with specifications and pricing.',
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 50).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${car.brand} ${car.model_name || car.detailed_name}`,
      url: `https://budgetevcar.com${getCarUrl(car).split('?')[0]}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense fallback={<div>Loading EVs...</div>}>
        <FindEvClient cars={cars} brands={brands} segments={segments} bodyTypes={bodyTypes} />
      </Suspense>
    </>
  );
}
