export const metadata = {
  title: 'EV Financial & Utility Tools — Free Calculators for Electric Vehicles India | BudgetEV',
  description:
    "Access BudgetEV's free suite of electric vehicle calculators including EMI calculator, savings vs petrol calculator, running cost estimator, and charging time tracker. Make informed EV purchase decisions with data-driven insights.",
  keywords: [
    'EV calculator India',
    'electric vehicle EMI calculator',
    'EV savings calculator',
    'EV running cost calculator',
    'EV charging time calculator',
    'electric car loan EMI India',
    'EV vs petrol savings calculator',
    'electric vehicle tools',
    'EV cost of ownership India',
    'electric car monthly cost India',
    'EV trip cost calculator',
    'how much to charge electric car India',
    'electric car EMI per month',
    'EV total cost of ownership',
    'electric car fuel savings India',
    'charging time for electric car',
    'EV battery charge time calculator',
    'electric vehicle finance calculator India',
  ],
  alternates: {
    canonical: 'https://budgetevcar.com/tools',
  },
  openGraph: {
    title: 'EV Financial & Utility Tools — Free Calculators | BudgetEV India',
    description: 'Calculate EMI, savings vs petrol, running costs, and charging time for electric vehicles in India. 100% free tools.',
    url: 'https://budgetevcar.com/tools',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV EV Tools — Free Calculators India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Financial & Utility Tools — Free Calculators | BudgetEV India',
    description: 'Calculate EMI, savings, running costs, and charging time for EVs in India. Free tools.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function ToolsLayout({ children }) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EV Financial & Utility Tools',
    description: 'Free interactive calculators for electric vehicle financing, savings comparison, running cost estimation, and charging time planning in India.',
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
        name: 'EV Tools',
        item: 'https://budgetevcar.com/tools',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
