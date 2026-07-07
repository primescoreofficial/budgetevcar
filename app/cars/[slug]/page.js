import { getCarBySlug, getAllCars, getCarUrl } from '@/lib/queries';
import CarDetailClient from './CarDetailClient';
import { notFound } from 'next/navigation';
import { getCarLocalImages, enrichCarWithLocalImage, enrichCarsWithLocalImages, getCarImagesCategorized } from '@/lib/imageResolver';

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
  const fullCarName = `${carBrand} ${carName}`.trim();
  const description = car.web_search_summary || `${carBrand} ${carName} electric vehicle — View complete specifications, battery capacity, range, pricing, charging time, and compare with other EVs in India on BudgetEV.`;
  const ogDescription = `Check out the ${fullCarName} on BudgetEV. Explore complete specifications, battery capacity, real-world range, pricing, charging times, and key features to compare it with other electric cars.`;
  
  const localImages = getCarLocalImages(carBrand, carName);
  let carImage = (localImages && localImages.length > 0) ? localImages[0] : (car.vehicle_image || '');
  if (carImage && !carImage.startsWith('http://') && !carImage.startsWith('https://')) {
    carImage = `https://www.budgetevcar.com${carImage.startsWith('/') ? '' : '/'}${carImage}`;
  }
  if (!carImage) {
    carImage = 'https://www.budgetevcar.com/logo/2.png';
  }

  return {
    title: `${carBrand} ${carName} ${car.variant_name ? `(${car.variant_name})` : ''} — Price, Specs, Range & Review | BudgetEV India`.replace(/\s+/g, ' '),
    description,
    keywords: [
      carName,
      carBrand,
      `${carBrand} ${carName}`,
      `${carBrand} ${carName} price India`,
      `${carBrand} ${carName} price India 2026`,
      `${carName} specifications`,
      `${carName} range km`,
      `${carName} battery capacity kWh`,
      `${carName} charging time`,
      `${carName} electric car review`,
      `${carName} on road price`,
      `${carName} vs`,
      `${carBrand} electric car India`,
      `buy ${carName} India`,
      `${carName} EMI`,
      `${carName} mileage per charge`,
      `${carName} colors`,
      `${carName} top speed`,
      `${carName} features`,
      'electric car specs India',
      'EV comparison India',
      'budget electric car India',
    ].filter(Boolean),
    alternates: {
      canonical: `https://www.budgetevcar.com/cars/${slug}`,
    },
    openGraph: {
      title: `Check out the ${fullCarName} on BudgetEV`,
      description: ogDescription,
      type: 'article',
      url: `https://www.budgetevcar.com/cars/${slug}`,
      siteName: 'BudgetEV',
      images: [
        {
          url: carImage,
          width: 1200,
          height: 630,
          alt: `Check out the ${fullCarName} on BudgetEV`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Check out the ${fullCarName} on BudgetEV`,
      description: ogDescription,
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

  // Official or trusted YouTube videos for Tata Sierra EV
  let youtubeVideos = [];
  if (car.model_name && car.model_name.toLowerCase().includes('sierra')) {
    youtubeVideos = [
      { id: '1', videoId: 'n_X11G0Bq7k', title: 'Tata Sierra EV Concept - First Look & Walkaround | Auto Expo', author: 'Tata Motors / Auto Expo' },
      { id: '2', videoId: 'e2DpyJ8x_4M', title: 'Tata Sierra EV Concept SUV Unveiled - Features & Interior Walkaround', author: 'Tata Motors official' }
    ];
  }

  const carName = car.model_name || car.detailed_name;
  const carBrand = car.brand || '';

  // Build Product + Vehicle schema with real data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    name: car.detailed_name || carName,
    image: car.vehicle_image,
    description: car.web_search_summary || `Complete specifications, pricing, and review of ${carBrand} ${carName} electric vehicle in India.`,
    brand: {
      '@type': 'Brand',
      name: carBrand,
    },
    category: 'Electric Vehicle',
    vehicleConfiguration: car.variant_name || undefined,
    fuelType: 'ElectricFuel',
    vehicleEngine: car.battery_capacity ? {
      '@type': 'EngineSpecification',
      fuelType: 'ElectricFuel',
      name: `${car.battery_capacity} kWh Battery`,
    } : undefined,
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
        unitCode: 'KWH',
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

  const categorizedImages = getCarImagesCategorized(car.brand, car.model_name || car.detailed_name);

  // Fetch related news articles that tag this vehicle
  const allNews = await require('@/lib/content').getAllPosts('news');

  const relatedNews = allNews.filter(post => 
    (post.relatedEvs || []).includes(`${carBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${carName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
  ).slice(0, 3);

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
      <CarDetailClient
        car={car}
        relatedCars={relatedCars}
        localImages={localImages}
        allCars={enrichedAllCars}
        categorizedImages={categorizedImages}
        relatedNews={relatedNews}
        youtubeVideos={youtubeVideos}
      />
    </>
  );
}
