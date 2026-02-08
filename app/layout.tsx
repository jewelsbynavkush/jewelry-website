import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import TopHeader from '@/components/layout/TopHeader';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ui/Toast';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/structured-data';
import { getBaseUrl } from '@/lib/utils/env';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
});

export const metadata: Metadata = generateStandardMetadata({
  title: 'Jewels by NavKush - Exquisite Handcrafted Jewelry',
  description: 'Discover our collection of unique, beautifully designed jewelry pieces that reflect your personal style. Handcrafted with precision and elegance.',
  url: getBaseUrl(),
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = await generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} ${playfair.variable} flex flex-col min-h-screen`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--beige)] focus:text-[var(--text-on-beige)] focus:rounded-lg">
          Skip to main content
        </a>
        <ErrorBoundary>
          <SmoothScrollProvider>
            <AuthProvider>
              <TopHeader />
              <main id="main-content" className="flex-grow" role="main">
                {children}
              </main>
              <Footer />
              <ToastContainer />
            </AuthProvider>
          </SmoothScrollProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
