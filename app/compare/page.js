import { getAllCars } from '@/lib/queries';
import CompareClient from './CompareClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Compare EVs — BudgetEV',
  description: 'Compare electric vehicles side by side. View battery capacity, body type, segment and more.',
  alternates: {
    canonical: '/compare',
  },
};

export default async function ComparePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  return <CompareClient cars={cars} />;
}
