export const metadata = {
  title: 'EV Financial & Utility Tools — Calculators for Electric Vehicles | BudgetEV',
  description:
    'Access BudgetEV\'s suite of electric vehicle calculators including EMI calculators, savings calculators, running cost estimators, and charging time trackers. Make informed EV purchase decisions.',
  keywords: [
    'EV calculator India',
    'electric vehicle EMI calculator',
    'EV savings calculator',
    'EV running cost calculator',
    'EV charging time calculator',
    'electric car loan EMI',
    'EV vs petrol savings',
    'electric vehicle tools',
  ],
  alternates: {
    canonical: 'https://budgetevcar.com/tools',
  },
  openGraph: {
    title: 'EV Financial & Utility Tools — BudgetEV',
    description: 'Calculate EMI, savings, running costs, and charging time for electric vehicles in India.',
    url: 'https://budgetevcar.com/tools',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV EV Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Financial & Utility Tools — BudgetEV',
    description: 'Calculate EMI, savings, running costs, and charging time for EVs in India.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function ToolsLayout({ children }) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EV Financial & Utility Tools',
    description: 'Interactive calculators for electric vehicle financing, savings, and cost planning.',
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'EV EMI Calculator',
        url: 'https://budgetevcar.com/tools/ev-emi-calculator',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'EV Savings Calculator',
        url: 'https://budgetevcar.com/tools/ev-savings-calculator',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'EV Trip Cost Calculator',
        url: 'https://budgetevcar.com/tools/ev-running-cost-calculator',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'EV Charging Time Calculator',
        url: 'https://budgetevcar.com/tools/ev-charging-time-calculator',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {children}
    </>
  );
}
