import { getAllCars, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import HomeClient from './HomeClient';
import { enrichCarsWithLocalImages } from '@/lib/imageResolver';
import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  keywords: [
    'best budget electric car India 2026',
    'cheapest electric car under 10 lakh',
    'budget EV car comparison India',
    'electric car price under 15 lakh India',
    'affordable EV specifications India',
    'compare budget electric cars India',
    'budget electric SUV India',
    'cheapest EV with best range India',
    'electric car for daily commute India',
    'Tata Nexon EV price',
    'MG Windsor EV price',
    'Tata Punch EV price',
    'cheapest EV in India 2026',
    'best electric car for family India',
    'electric car with longest range under 20 lakh',
    'EV vs petrol car India savings',
    'electric car subsidy India 2026',
  ],
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);
  const brands = await getUniqueBrands();
  const bodyTypes = await getUniqueBodyTypes();

  // Fetch latest blogs and news (limit to 4)
  const latestBlogs = getAllPosts('blogs').slice(0, 4);
  const latestNews = getAllPosts('news').slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Budget EV Car',
    alternateName: 'BudgetEV',
    url: 'https://budgetevcar.com',
    description: "India's #1 platform to find, compare, and calculate savings for affordable electric vehicles under ₹15 Lakh.",
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://budgetevcar.com/find-ev?brand={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Budget EV Car',
      url: 'https://budgetevcar.com',
      logo: 'https://budgetevcar.com/logo/2.png',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the cheapest electric car in India in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The cheapest electric car in India in 2026 is the MG Comet EV, starting at approximately ₹6.99 Lakh (ex-showroom). The Tata Tiago EV starts at ₹7.99 Lakh and the Citroën ëC3 starts at ₹11.61 Lakh. Visit BudgetEV to compare all affordable EVs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which electric car has the best range under ₹15 Lakh in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Tata Punch EV Long Range offers up to 421 km range at under ₹15.49 Lakh, making it one of the best value EVs for range. The Tata Nexon EV also offers competitive range at around 325-465 km depending on the variant.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much money can I save by switching to an electric car in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An average Indian driver covering 1,000 km/month can save ₹4,000–₹6,000 per month on fuel costs alone by switching from petrol to electric. Over 5 years, this translates to ₹2.4–₹3.6 Lakhs in fuel savings. Use our EV Savings Calculator on BudgetEV for personalized estimates.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to charge an electric car in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Charging time depends on the charger type: DC fast chargers can charge most EVs to 80% in 30-60 minutes, while standard home chargers (AC) take 6-8 hours for a full charge. Use our EV Charging Time Calculator for exact estimates for your vehicle.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find EV charging stations near me in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'India has rapidly expanding EV charging infrastructure with operators like Tata Power, Ather Grid, Fortum, and ChargeZone. Use our Charging Station Locator at budgetevcar.com/charging-stations to find the nearest EV charging points in your city.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the EMI for an electric car in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EMI for electric cars in India ranges from ₹8,000 to ₹25,000 per month depending on the car price, down payment, interest rate, and loan tenure. For a ₹15 Lakh EV with 20% down payment and 9% interest rate over 5 years, the EMI is approximately ₹24,900. Calculate your exact EMI with our free EV EMI Calculator.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which electric car brands are available in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Major electric car brands in India include Tata Motors (Nexon EV, Punch EV, Tiago EV, Curvv EV), MG Motor (ZS EV, Windsor EV, Comet EV), Mahindra (XUV400), BYD (Atto 3, Seal), Hyundai (Ioniq 5), and Kia (EV6, EV9). Browse all brands on BudgetEV.',
        },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient 
        cars={cars} 
        brands={brands} 
        bodyTypes={bodyTypes} 
        latestBlogs={latestBlogs}
        latestNews={latestNews}
      />
    </>
  );
}
