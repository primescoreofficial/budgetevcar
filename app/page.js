import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cars = await getAllCars();
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  return <HomeClient cars={cars} brands={brands} bodyTypes={bodyTypes} />;
}
