import type { Metadata } from 'next';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'My Profile',
    description: 'Manage your account settings, addresses, and view your order history.',
    url: `${getBaseUrl()}/profile`,
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
