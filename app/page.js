import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  return <HomeClient cars={cars} brands={brands} bodyTypes={bodyTypes} />;
}
