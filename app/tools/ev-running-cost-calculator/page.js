import { getAllCars } from "@/lib/queries";
import { enrichCarsWithLocalImages } from "@/lib/imageResolver";
import TripPlannerClient from "./TripPlannerClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EV Trip Planner & Cost Calculator — BudgetEV",
  description:
    "Plan electric vehicle highway routes, estimate charging stops requirements, calculate battery range, and compare trip expenses with petrol vehicles.",
  alternates: {
    canonical: "/tools/ev-running-cost-calculator",
  },
};

export default async function TripCostCalculatorPage() {
  const rawCars = await getAllCars();
  const cars = enrichCarsWithLocalImages(rawCars);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center font-bold text-slate-655 animate-pulse">
            Loading EV Trip Planner...
          </div>
        </div>
      }
    >
      <TripPlannerClient cars={cars} />
    </Suspense>
  );
}
