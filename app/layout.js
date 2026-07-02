import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

export const metadata = {
  title: "Budget EV Car — Best Affordable Electric Cars Under ₹15 Lakh in India (2026)",
  description: "India's #1 platform to find the best budget electric car under ₹10-15 Lakh. Compare range, price, specs & calculate real savings vs petrol. 50+ EVs compared — find your perfect budget EV car today!",
  keywords: [
    "budget electric car India",
    "budget EV car",
    "cheapest electric car India 2026",
    "electric car under 10 lakh India",
    "electric car under 15 lakh India",
    "best budget EV India",
    "EV comparison tool India",
    "electric car price India",
    "electric car running cost calculator",
    "EV charging stations India map",
    "electric car EMI calculator",
    "budget electric SUV India",
    "electric car vs petrol cost India",
    "affordable electric vehicle India",
    "upcoming budget electric cars 2026",
    "Tata electric car price",
    "MG electric car India",
    "Mahindra electric SUV",
    "BYD electric car India",
    "Hyundai electric car India",
    "Kia electric car India",
    "electric car battery life India",
    "EV subsidy India 2026",
    "electric car range comparison",
    "best electric car for city driving India",
    "electric car maintenance cost India",
  ],
  metadataBase: new URL('https://www.budgetevcar.com'),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'automotive',
  openGraph: {
    title: 'Budget EV Car India — Compare Prices, Range & Save Lakhs on Your First Electric Car',
    description: "India's #1 platform to find the best budget electric car under ₹10-15 Lakh. Compare range, price, specs & calculate real savings vs petrol. 50+ EVs compared!",
    url: 'https://www.budgetevcar.com',
    siteName: 'Budget EV Car',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.budgetevcar.com/logo/2.png',
        width: 512,
        height: 512,
        alt: 'Budget EV Car Logo — Affordable Electric Cars India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget EV Car — Find the Cheapest Electric Cars in India Under ₹15 Lakh',
    description: 'Compare range, specs, pricing & calculate fuel savings for every budget electric car in India. Free tools: EMI Calculator, Savings Calculator & more.',
    images: ['https://www.budgetevcar.com/logo/2.png'],
  },
  alternates: {
    canonical: 'https://www.budgetevcar.com',
  },
};

export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Budget EV Car',
    alternateName: 'BudgetEV',
    url: 'https://budgetevcar.com',
    logo: 'https://budgetevcar.com/logo/2.png',
    description: "India's #1 platform to find the best budget electric car. Compare range, price, specs & calculate real savings vs petrol for every affordable EV in India.",
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    knowsAbout: [
      'Electric Vehicles',
      'Electric Cars in India',
      'EV Charging Stations',
      'EV Battery Technology',
      'Electric Vehicle Pricing',
      'EV EMI Calculation',
      'EV Running Cost',
      'EV Savings vs Petrol',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@budgetevcar.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const siteNavigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Home',
        url: 'https://budgetevcar.com',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Find Electric Vehicle',
        url: 'https://budgetevcar.com/find-ev',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Compare Electric Cars',
        url: 'https://budgetevcar.com/compare',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV Charging Stations',
        url: 'https://budgetevcar.com/charging-stations',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV EMI Calculator',
        url: 'https://budgetevcar.com/tools/ev-emi-calculator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV Savings Calculator',
        url: 'https://budgetevcar.com/tools/ev-savings-calculator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV Trip Cost Calculator',
        url: 'https://budgetevcar.com/tools/ev-running-cost-calculator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV Charging Time Calculator',
        url: 'https://budgetevcar.com/tools/ev-charging-time-calculator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV Blog & Guides',
        url: 'https://budgetevcar.com/blog',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'EV News',
        url: 'https://budgetevcar.com/news',
      },
    ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
      </head>
      <body className="text-slate-900 antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
