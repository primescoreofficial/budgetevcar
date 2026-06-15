import { getCarBySlug, getAllCars, getCarUrl } from '@/lib/queries';
import CarDetailClient from './CarDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) {
    return { title: 'Car Not Found — BudgetEV' };
  }
  return {
    title: `${car.model_name || car.detailed_name} — BudgetEV`,
    description: car.web_search_summary || `View details of ${car.model_name || car.detailed_name} electric vehicle.`,
  };
}

export default async function CarDetailPage({ params }) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  const allCars = await getAllCars();
  const relatedCars = allCars
    .filter(c => c.brand === car.brand && c.serial_no !== car.serial_no)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.model_name || car.detailed_name,
    image: car.vehicle_image,
    description: car.web_search_summary || `View details of ${car.model_name || car.detailed_name} electric vehicle.`,
    brand: {
      '@type': 'Brand',
      name: car.brand,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      offers: [
        {
          '@type': 'Offer',
          url: `https://budgetevcar.com${getCarUrl(car)}`,
        }
      ]
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Battery Capacity',
        value: car.battery_capacity ? `${car.battery_capacity} kWh` : 'N/A'
      },
      {
        '@type': 'PropertyValue',
        name: 'Body Type',
        value: car.body_type || 'N/A'
      },
      {
        '@type': 'PropertyValue',
        name: 'Segment',
        value: car.segment || 'N/A'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarDetailClient car={car} relatedCars={relatedCars} />
    </>
  );
}
