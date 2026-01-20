import { Metadata } from 'next';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'Checkout',
    description: 'Complete your jewelry purchase. Enter shipping address and payment details.',
    url: `${getBaseUrl()}/checkout`,
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
