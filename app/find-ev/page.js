import { Suspense } from 'react';
import { getAllCars, getUniqueBrands, getUniqueSegments, getUniqueBodyTypes } from '@/lib/queries';
import FindEvClient from './FindEvClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Find EV — BudgetEV',
  description: 'Search and filter electric vehicles by brand, segment, body type, and battery capacity.',
};
export default async function FindEvPage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const segments = await getUniqueSegments();
  const bodyTypes = await getUniqueBodyTypes();
  return (
    <Suspense fallback={<div>Loading EVs...</div>}>
      <FindEvClient cars={cars} brands={brands} segments={segments} bodyTypes={bodyTypes} />
    </Suspense>
  );
}