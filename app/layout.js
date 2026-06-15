import "./globals.css";

export const metadata = {
  title: "BudgetEV — Find Your Perfect Electric Car",
  description: "Simplify your transition to electric. Compare range, battery life and safety ratings across every EV available in India.",
  metadataBase: new URL('https://budgetevcar.com'),
  openGraph: {
    title: 'BudgetEV — Best Budget Electric Cars in India',
    description: 'Compare range, specs, and calculate fuel savings.',
    url: 'https://budgetevcar.com',
    siteName: 'BudgetEV',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BudgetEV — Find Your Perfect Electric Car',
    description: 'Compare range, specs, and calculate fuel savings.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
