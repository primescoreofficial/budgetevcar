import { Suspense } from "react";
import ChargingStationsClient from "./ChargingStationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EV Charging Station Locator — Find Charging Stations Near You in India | BudgetEV",
  description: "Find your nearest electric vehicle charging stations across India. Search by city or use your location to explore operators like Tata Power, Ather Grid, ChargeZone, Fortum, and more. View distance, charger type, and availability details.",
  keywords: [
    'EV charging station near me',
    'electric vehicle charging stations India',
    'EV charger locator',
    'fast charging station India',
    'DC fast charger near me',
    'Tata Power charging station',
    'Ather Grid charging',
    'EV charging map India',
    'electric car charging points',
    'EV charging station Delhi',
    'EV charging station Mumbai',
    'EV charging station Bangalore',
    'EV charging station Hyderabad',
    'EV charging station Pune',
    'EV charging station Chennai',
    'ChargeZone stations India',
    'Fortum charging stations',
    'EV charging cost per unit India',
    'public EV charger India',
    'home EV charger India',
    'Level 2 charger India',
    'CCS charger India',
    'Type 2 charger India',
    'EV charging network India',
    'nearest EV charging point',
    'how to find EV charging station',
  ],
  alternates: {
    canonical: '/charging-stations',
  },
  openGraph: {
    title: "EV Charging Station Locator — Find Charging Points Across India | BudgetEV",
    description: "Discover, inspect, and navigate to EV charging stations across India. Find fast chargers, Type 2, and CCS chargers near you from Tata Power, Ather Grid, ChargeZone & more.",
    url: 'https://budgetevcar.com/charging-stations',
    siteName: 'BudgetEV',
    type: "website",
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Charging Station Locator India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Charging Station Locator — Find Chargers Near You | BudgetEV India',
    description: 'Find EV charging stations across India. Search by city, view operators, charger types & distance.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function ChargingStationsPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EV Charging Station Locator',
    url: 'https://budgetevcar.com/charging-stations',
    description: 'Find electric vehicle charging stations across India. Search by city or use GPS location to find nearby chargers from Tata Power, Ather Grid, ChargeZone & more.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

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
        name: 'EV Charging Stations',
        item: 'https://budgetevcar.com/charging-stations',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-600">Loading Charging Locator...</p>
          </div>
        </div>
      }>
        <ChargingStationsClient />
      </Suspense>
    </>
  );
}
