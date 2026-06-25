import "./globals.css";

export const metadata = {
  title: "BudgetEV — Find Your Perfect Electric Car in India",
  description: "India's most trusted platform for finding, comparing, and analyzing electric vehicles within your budget. Compare range, battery life, specs, and pricing across every EV available in India.",
  keywords: [
    "electric vehicles India",
    "compare electric cars",
    "budget EV",
    "EV charging locator",
    "EV cost savings calculator",
    "best EV in India",
    "electric car specification",
    "EV range calculator",
    "Tata Nexon EV specs",
    "Mahindra BE 6",
    "MG Windsor EV specs",
    "electric car price India",
    "EV comparison tool",
    "electric SUV India",
    "cheapest electric car India",
    "EV battery range",
    "electric vehicle charging stations India",
  ],
  metadataBase: new URL('https://budgetevcar.com'),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'BudgetEV — Best Budget Electric Cars in India',
    description: 'India\'s #1 platform to compare range, specs, pricing, and calculate fuel savings for every electric vehicle available in India.',
    url: 'https://budgetevcar.com',
    siteName: 'BudgetEV',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://budgetevcar.com/logo/2.png',
        width: 512,
        height: 512,
        alt: 'BudgetEV Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BudgetEV — Find Your Perfect Electric Car in India',
    description: 'Compare range, specs, pricing, and calculate fuel savings for every EV in India.',
    images: ['https://budgetevcar.com/logo/2.png'],
  },
};

export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BudgetEV',
    url: 'https://budgetevcar.com',
    logo: 'https://budgetevcar.com/logo/2.png',
    description: "India's most trusted platform for finding, comparing, and analyzing electric vehicles within your budget.",
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@budgetevcar.com',
      contactType: 'customer support',
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
