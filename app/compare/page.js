import { getAllCars } from '@/lib/queries';
import CompareClient from './CompareClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Compare Electric Cars Side by Side — EV Comparison Tool | BudgetEV',
  description: 'Compare electric vehicles side by side. View battery capacity, range, body type, segment, pricing and more. Find the best EV for your needs in India.',
  keywords: [
    'compare electric cars India',
    'EV comparison tool',
    'side by side EV specs',
    'electric car comparison',
    'compare EV range',
    'compare EV battery',
    'Tata vs MG electric car',
    'best EV comparison',
    'compare electric SUV',
  ],
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Electric Cars Side by Side — BudgetEV',
    description: 'Compare electric vehicles side by side. View battery, range, segment and more.',
    url: 'https://budgetevcar.com/compare',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Compare EVs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Electric Cars Side by Side — BudgetEV',
    description: 'Compare electric vehicles side by side in India.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default async function ComparePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  return <CompareClient cars={cars} />;
}
