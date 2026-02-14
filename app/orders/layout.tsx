import type { Metadata } from 'next';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'My Orders',
    description: 'View your order history and track your jewelry purchases.',
    url: `${getBaseUrl()}/orders`,
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
