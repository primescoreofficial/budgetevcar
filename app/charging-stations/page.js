import { Suspense } from "react";
import ChargingStationsClient from "./ChargingStationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EV Charging Station Locator — BudgetEV",
  description: "Find your nearest electric vehicle charging stations across India. Search by city or use your location to explore operators, distance, and charger type details.",
  alternates: {
    canonical: '/charging-stations',
  },
  openGraph: {
    title: "EV Charging Station Locator — BudgetEV",
    description: "Discover, inspect, and navigate to EV charging stations across India.",
    type: "website",
  }
};

export default function ChargingStationsPage() {
  return (
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
  );
}
