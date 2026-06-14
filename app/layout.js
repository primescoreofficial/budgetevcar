import "./globals.css";

export const metadata = {
  title: "BudgetEV — Find Your Perfect Electric Car",
  description: "Simplify your transition to electric. Compare range, battery life and safety ratings across every EV available in India.",
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
