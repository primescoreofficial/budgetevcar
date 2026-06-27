import { Suspense } from 'react';
import { getAllCars, getUniqueBrands, getUniqueSegments, getUniqueBodyTypes, getCarUrl } from '@/lib/queries';
import FindEvClient from './FindEvClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Find Electric Vehicles in India — Search, Filter & Compare Every EV | BudgetEV',
  description: 'Search and filter every electric vehicle available in India by brand, price range, body type, range, and charging speed. Find the perfect EV within your budget from 50+ electric cars. Compare Tata, MG, Mahindra, BYD, Hyundai & more.',
  keywords: [
    'find electric car India',
    'search EV India',
    'filter electric vehicles',
    'electric car finder',
    'EV search tool India',
    'best electric car for budget',
    'Tata EV models',
    'MG electric cars India',
    'Mahindra EV India',
    'electric SUV India',
    'electric hatchback India',
    'electric sedan India',
    'cheapest electric car India',
    'electric car under 10 lakh',
    'electric car under 15 lakh',
    'electric car under 20 lakh',
    'best range electric car India',
    'fast charging electric car India',
    'electric car list India 2026',
    'all electric cars in India',
    'compare electric vehicles India',
    'EV price list India 2026',
    'electric car with best range',
    'BYD electric car India',
    'Hyundai electric car India',
    'Kia electric car India',
    'electric car for daily commute',
    'electric car for family India',
    'compact electric car India',
  ],
  alternates: {
    canonical: '/find-ev',
  },
  openGraph: {
    title: 'Find Electric Vehicles in India — Search, Filter & Compare Every EV | BudgetEV',
    description: 'Search and filter 50+ electric vehicles in India by brand, price, body type, range, and charging speed. Find the perfect EV for your budget.',
    url: 'https://budgetevcar.com/find-ev',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Find EV — Electric Vehicle Finder India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Electric Vehicles in India — Search & Compare 50+ EVs | BudgetEV',
    description: 'Search, filter, and compare every EV available in India by price, range, brand & body type.',
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

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://budgetevcar.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Find Electric Vehicle',
        item: 'https://budgetevcar.com/find-ev',
      },
    ],
  };

  // CollectionPage schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Find Electric Vehicles in India',
    description: 'Browse, search, and filter every electric vehicle available in India. Compare by brand, price, range, body type, and charging speed.',
    url: 'https://budgetevcar.com/find-ev',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Budget EV Car',
      url: 'https://budgetevcar.com',
    },
    about: {
      '@type': 'Thing',
      name: 'Electric Vehicles in India',
    },
    numberOfItems: cars.length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
          <div className="relative flex flex-col items-center max-w-sm w-full text-center">
            {/* Dynamic spinner ring with electric pulse styling */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#0249ad] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">⚡</div>
            </div>
            
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-2 uppercase">Analyzing EV Database</h3>
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
              Charging your search experience...
            </p>

            {/* Modern mini progress track */}
            <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mt-6 relative">
              <div className="absolute top-0 bottom-0 bg-[#0249ad] rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes loading {
              0% { left: -40%; width: 40%; }
              50% { left: 20%; width: 60%; }
              100% { left: 100%; width: 40%; }
            }
          `}} />
        </div>
      }>
        <FindEvClient cars={cars} brands={brands} segments={segments} bodyTypes={bodyTypes} />
      </Suspense>
    </>
  );
}
