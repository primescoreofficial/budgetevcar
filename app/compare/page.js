import { getAllCars } from '@/lib/queries';
import CompareClient from './CompareClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Compare EVs — BudgetEV',
  description: 'Compare electric vehicles side by side. View battery capacity, body type, segment and more.',
};

export default async function ComparePage() {
  const cars = await getAllCars();
  return <CompareClient cars={cars} />;
}
