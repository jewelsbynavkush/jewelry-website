import type { Metadata } from 'next';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'Shopping Cart',
    description: 'Review your selected jewelry items in your shopping cart. Add or remove items before checkout.',
    url: `${getBaseUrl()}/cart`,
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
