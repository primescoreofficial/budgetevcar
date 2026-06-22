export const metadata = {
  title: 'EV Charging Time Calculator | BudgetEV',
  description:
    'Calculate how long it takes to charge your electric vehicle based on battery size, charge percentage, and charger power.',
  alternates: {
    canonical: 'https://budgetevcar.com/tools/ev-charging-time-calculator',
  },
};

export default function ChargingTimeLayout({ children }) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'EV Charging Time Calculator',
    'url': 'https://budgetevcar.com/tools/ev-charging-time-calculator',
    'description': 'Calculate how long it takes to charge your electric vehicle based on battery size, charge percentage, and charger power.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is EV charging time calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'EV charging time is calculated by determining the amount of energy required to reach the target charge level, and dividing it by the power supplied by the charger. Formula: Time = [Battery Capacity × (Target % - Current %) / 100] ÷ Charger Power.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the difference between AC and DC charging?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'AC charging (Alternating Current) is typically slower and used for home or overnight chargers. DC charging (Direct Current) bypasses the vehicle’s onboard charger to supply power directly to the battery, allowing for high-speed fast charging.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Why is charging from 20% to 80% recommended?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Charging between 20% and 80% maximizes battery lifespan and keeps charging speeds high. EV batteries charge much slower after 80% to protect the cells from overheating and degradation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does battery size affect charging speed?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Battery size determines how much capacity needs to be filled, but the charging speed itself is capped by the charger output limits and the vehicle’s maximum accepted charging power.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How fast is DC fast charging?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'DC fast chargers (usually 30 kW up to 150 kW or more) can charge a typical EV from 10% to 80% in 30 to 60 minutes, compared to several hours using standard home AC chargers.'
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
