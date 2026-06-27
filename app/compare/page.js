import { getAllCars } from '@/lib/queries';
import CompareClient from './CompareClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Compare Electric Cars Side by Side — EV Comparison Tool India | BudgetEV',
  description: 'Compare electric vehicles side by side in India. View battery capacity, range, body type, segment, pricing and more. Find the best EV for your needs by comparing Tata, MG, Mahindra, BYD, Hyundai & Kia electric cars.',
  keywords: [
    'compare electric cars India',
    'EV comparison tool',
    'side by side EV specs',
    'electric car comparison India',
    'compare EV range',
    'compare EV battery',
    'Tata vs MG electric car',
    'best EV comparison India',
    'compare electric SUV India',
    'Tata Nexon EV vs MG ZS EV',
    'Tata Punch EV vs Nexon EV',
    'MG Windsor EV vs Tata Curvv EV',
    'electric car vs electric car India',
    'EV specification comparison',
    'which electric car is better India',
    'compare EV price India',
    'compare EV charging time',
    'electric vehicle head to head',
    'BYD Atto 3 vs MG ZS EV',
    'compare budget electric cars',
  ],
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Electric Cars Side by Side — EV Comparison Tool | BudgetEV India',
    description: 'Compare electric vehicles side by side in India. View battery, range, pricing, segment and more for 50+ EVs.',
    url: 'https://budgetevcar.com/compare',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Compare EVs — Side by Side Electric Car Comparison' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Electric Cars Side by Side — BudgetEV India',
    description: 'Compare electric vehicles side by side in India. Battery, range, price & specs comparison.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default async function ComparePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);

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
        name: 'Compare Electric Cars',
        item: 'https://budgetevcar.com/compare',
      },
    ],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Electric Vehicle Comparison Tool',
    url: 'https://budgetevcar.com/compare',
    description: 'Compare electric vehicles side by side in India. Select any two EVs to view detailed specifications, battery capacity, range, pricing, and charging time comparison.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <CompareClient cars={cars} />
    </>
  );
}
