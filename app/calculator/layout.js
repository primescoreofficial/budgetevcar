export const metadata = {
  title: 'EV Savings Calculator – Calculate Electric Vehicle Savings | BudgetEV',
  description:
    'Calculate how much you save by switching to an electric vehicle. Compare petrol vs EV costs by month, year, and 5 years using BudgetEV\'s EV Savings Calculator.',
  alternates: {
    canonical: 'https://budgetevcar.com/tools/ev-savings-calculator',
  },
};

export default function SavingsCalculatorLayout({ children }) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'EV Savings Calculator',
    'url': 'https://budgetevcar.com/tools/ev-savings-calculator',
    'description': 'Calculate how much you save by switching to an electric vehicle. Compare petrol vs EV costs by month, year, and 5 years using BudgetEV\'s EV Savings Calculator.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is EV savings calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'EV savings is calculated by comparing fuel costs: (Commute Distance ÷ Petrol Mileage) × Petrol Price vs electrical charging costs: (Commute Distance ÷ EV Efficiency) × Electricity Tariff. The difference represents the net monthly/yearly savings.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the running cost difference between EV and petrol?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Petrol vehicles average around ₹7 to ₹10 per km depending on mileage. EVs typically run on less than ₹1.5 per km, resulting in savings of over 80% on commute energy expenses.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is maintenance cheaper for an EV?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, EVs have far fewer moving parts (no engine, gearbox, spark plugs, or exhaust systems), which translates to significantly lower routine maintenance costs over time.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How long does it take to break even on an EV purchase?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Depending on daily usage, most EV owners break even on the higher initial purchase price within 3 to 5 years through accumulated fuel and maintenance savings.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
