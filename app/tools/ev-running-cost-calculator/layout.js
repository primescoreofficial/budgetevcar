export const metadata = {
  title: 'EV Trip Cost Calculator – Calculate Electric Vehicle Running Costs | BudgetEV',
  description:
    'Plan your EV trip and calculate running costs. Compare electricity expenses with petrol fuel costs. Get charging station recommendations along your route.',
  keywords: [
    'EV trip cost calculator',
    'electric vehicle running cost',
    'EV vs petrol trip cost',
    'EV route planner India',
    'electric car running cost calculator',
    'EV charging cost per km',
    'electric vehicle fuel cost',
  ],
  alternates: {
    canonical: 'https://budgetevcar.com/tools/ev-running-cost-calculator',
  },
  openGraph: {
    title: 'EV Trip Cost Calculator — BudgetEV',
    description: 'Calculate EV trip running costs and compare with petrol vehicles.',
    url: 'https://budgetevcar.com/tools/ev-running-cost-calculator',
    siteName: 'BudgetEV',
    type: 'website',
    images: [{ url: 'https://budgetevcar.com/logo/2.png', width: 512, height: 512, alt: 'BudgetEV Trip Cost Calculator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Trip Cost Calculator — BudgetEV',
    description: 'Calculate EV trip running costs and compare with petrol vehicles in India.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function RunningCostLayout({ children }) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'EV Trip Cost Calculator',
    'url': 'https://budgetevcar.com/tools/ev-running-cost-calculator',
    'description': 'Plan your EV trip and calculate running costs. Compare electricity expenses with petrol fuel costs.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is EV running cost calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'EV running cost is calculated by dividing the trip distance by the vehicle\'s efficiency (km/kWh) and multiplying by the electricity rate per unit (kWh). This gives you the total electricity cost for the trip.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How much does it cost to charge an EV per km in India?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'On average, it costs about ₹1 to ₹1.5 per km to run an EV in India, compared to ₹7 to ₹10 per km for a petrol vehicle. The exact cost depends on your electricity tariff and EV efficiency.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is EV cheaper than petrol for long trips?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, EVs are significantly cheaper for long trips in terms of fuel costs. However, you need to plan for charging stops. With fast chargers becoming widely available, long-distance EV travel is increasingly practical and cost-effective.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How do I find charging stations along my route?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'BudgetEV\'s Trip Cost Calculator automatically identifies charging stations along your planned route. You can also use the dedicated Charging Station Locator tool to find chargers near any location in India.'
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
