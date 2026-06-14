import { getCarBySerialNo, getAllCars } from '@/lib/queries';
import CarDetailClient from './CarDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { serial_no } = await params;
  const car = await getCarBySerialNo(serial_no);
  if (!car) {
    return { title: 'Car Not Found — BudgetEV' };
  }
  return {
    title: `${car.model_name || car.detailed_name} — BudgetEV`,
    description: car.web_search_summary || `View details of ${car.model_name || car.detailed_name} electric vehicle.`,
  };
}

export default async function CarDetailPage({ params }) {
  const { serial_no } = await params;
  const car = await getCarBySerialNo(serial_no);

  if (!car) {
    notFound();
  }

  const allCars = await getAllCars();
  const relatedCars = allCars
    .filter(c => c.brand === car.brand && c.serial_no !== car.serial_no)
    .slice(0, 4);

  return <CarDetailClient car={car} relatedCars={relatedCars} />;
}
