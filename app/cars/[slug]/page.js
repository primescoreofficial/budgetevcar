import { getCarBySlug, getAllCars, getCarUrl } from '@/lib/queries';
import CarDetailClient from './CarDetailClient';
import { notFound } from 'next/navigation';
import { getCarLocalImages, enrichCarWithLocalImage, enrichCarsWithLocalImages } from '@/lib/imageResolver';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const v = resolvedSearchParams?.v;
  const rawCar = await getCarBySlug(slug, v);
  const car = enrichCarWithLocalImage(rawCar);
  if (!car) {
    return { title: 'Car Not Found — BudgetEV' };
  }
  return {
    title: `${car.model_name || car.detailed_name} — BudgetEV`,
    description: car.web_search_summary || `View details of ${car.model_name || car.detailed_name} electric vehicle.`,
    alternates: {
      canonical: `/cars/${slug}`,
    },
  };
}

export default async function CarDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const v = resolvedSearchParams?.v;
  const rawCar = await getCarBySlug(slug, v);
  const car = enrichCarWithLocalImage(rawCar);

  if (!car) {
    notFound();
  }

  const allCars = await getAllCars();
  const enrichedAllCars = enrichCarsWithLocalImages(allCars);
  const relatedCars = enrichedAllCars
    .filter(c => c.brand === car.brand && c.serial_no !== car.serial_no)
    .slice(0, 4);

  const localImages = getCarLocalImages(car.brand, car.model_name || car.detailed_name);

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
      <CarDetailClient car={car} relatedCars={relatedCars} localImages={localImages} allCars={enrichedAllCars} />
    </>
  );
}
