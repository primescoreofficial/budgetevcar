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

  const carName = car.model_name || car.detailed_name;
  const carBrand = car.brand || '';
  const description = car.web_search_summary || `${carName} electric vehicle — View complete specifications, battery capacity, range, pricing, and compare with other EVs in India on BudgetEV.`;
  const carImage = car.vehicle_image || 'https://budgetevcar.com/logo/2.png';

  return {
    title: `${carName} ${car.variant_name ? `(${car.variant_name})` : ''} — Specs, Price & Range | BudgetEV`.replace(/\s+/g, ' '),
    description,
    keywords: [
      carName,
      carBrand,
      `${carBrand} ${carName}`,
      `${carName} price India`,
      `${carName} specifications`,
      `${carName} range`,
      `${carName} battery capacity`,
      `${carName} electric car`,
      `${carBrand} electric car India`,
      'electric car specs India',
      'EV comparison',
    ].filter(Boolean),
    alternates: {
      canonical: `/cars/${slug}`,
    },
    openGraph: {
      title: `${carBrand} ${carName} — Electric Vehicle Specs & Price | BudgetEV`,
      description,
      type: 'website',
      url: `https://budgetevcar.com/cars/${slug}`,
      siteName: 'BudgetEV',
      images: [
        {
          url: carImage,
          width: 800,
          height: 500,
          alt: `${carBrand} ${carName} Electric Vehicle`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${carBrand} ${carName} — Specs & Price | BudgetEV`,
      description: description.slice(0, 200),
      images: [carImage],
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

  const carName = car.model_name || car.detailed_name;
  const carBrand = car.brand || '';

  // Build Product schema with real data only
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.detailed_name || carName,
    image: car.vehicle_image,
    description: car.web_search_summary || `View details of ${carName} electric vehicle.`,
    brand: {
      '@type': 'Brand',
      name: carBrand,
    },
    category: 'Electric Vehicle',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://budgetevcar.com${getCarUrl(car)}`,
    },
    additionalProperty: [
      car.battery_capacity && {
        '@type': 'PropertyValue',
        name: 'Battery Capacity',
        value: `${car.battery_capacity} kWh`,
      },
      car.body_type && {
        '@type': 'PropertyValue',
        name: 'Body Type',
        value: car.body_type,
      },
      car.segment && {
        '@type': 'PropertyValue',
        name: 'Segment',
        value: car.segment,
      },
      car.variant_name && {
        '@type': 'PropertyValue',
        name: 'Variant',
        value: car.variant_name,
      },
    ].filter(Boolean),
  };

  // BreadcrumbList schema for car pages
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
        name: 'Find EV',
        item: 'https://budgetevcar.com/find-ev',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${carBrand} ${carName}`,
        item: `https://budgetevcar.com/cars/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CarDetailClient car={car} relatedCars={relatedCars} localImages={localImages} allCars={enrichedAllCars} />
    </>
  );
}
