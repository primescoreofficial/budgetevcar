import { Suspense } from "react";
import ChargingStationsClient from "./ChargingStationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EV Charging Station Locator — Find Charging Stations Near You | BudgetEV",
  description: "Find your nearest electric vehicle charging stations across India. Search by city or use your location to explore operators, distance, and charger type details.",
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
  ],
  alternates: {
    canonical: '/charging-stations',
  },
  openGraph: {
    title: "EV Charging Station Locator — BudgetEV",
    description: "Discover, inspect, and navigate to EV charging stations across India. Find fast chargers near you.",
    url: 'https://budgetevcar.com/charging-stations',
    siteName: 'BudgetEV',
    type: "website",
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Charging Station Locator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Charging Station Locator — BudgetEV',
    description: 'Find EV charging stations across India. Search by city or use your location.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function ChargingStationsPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EV Charging Station Locator',
    url: 'https://budgetevcar.com/charging-stations',
    description: 'Find electric vehicle charging stations across India. Search by city or location.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
