import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/components/providers';
import Script from 'next/script';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import CookieConsent from '@/components/cookies/CookieConsent';
import defaultMetadata, { generateJsonLd } from '@/lib/seo/metadata';
import { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/fixes.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${inter.className} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateJsonLd('website', {})
            ),
          }}
        />
      </head>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              // Default to dark theme
              document.documentElement.classList.add('dark');
              
              // Apply theme from localStorage if it exists
              if (localStorage.theme === 'light') {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              // If localStorage is not available, maintain dark theme
              document.documentElement.classList.add('dark');
            }
          `}
        </Script>
        <Providers session={session}>
          <main className="min-h-screen bg-gradient-to-b from-midnight-darker to-midnight-DEFAULT flex flex-col">
            {children}
          </main>
          <GoogleAnalytics />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}