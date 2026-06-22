export const metadata = {
  title: 'EV EMI Calculator – Calculate Electric Car Loan EMI | BudgetEV',
  description:
    'Calculate monthly EMI, total interest, and total repayment amount for your electric vehicle purchase using BudgetEV\'s EV EMI Calculator.',
  alternates: {
    canonical: 'https://budgetevcar.com/tools/ev-emi-calculator',
  },
};

export default function EmiCalculatorLayout({ children }) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'EV EMI Calculator',
    'url': 'https://budgetevcar.com/tools/ev-emi-calculator',
    'description': 'Calculate monthly EMI, total interest, and total repayment amount for your electric vehicle purchase using BudgetEV\'s EV EMI Calculator.',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'All',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is EV EMI calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'EV EMI is calculated using the standard PMT formula: [P x R x (1+R)^N]/[(1+R)^N-1], where P is Principal (Car Price - Down Payment), R is Monthly Interest Rate (Annual Rate / 12 / 100), and N is Loan Tenure in Months.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is a good down payment for an EV?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'A good down payment is generally 15% to 20% of the vehicle ex-showroom price. A larger down payment reduces your loan principal amount, which results in lower monthly EMI and less interest accumulated over time.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does a longer tenure reduce EMI?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, spreading the loan over a longer tenure (e.g., 7 years instead of 5) reduces the monthly payment. However, it increases the total interest accumulated over the lifetime of the loan.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How much interest will I pay on an EV loan?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The interest paid depends on your interest rate and loan tenure. A higher interest rate or longer tenure increases the total interest paid.'
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
