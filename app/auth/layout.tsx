import type { Metadata } from 'next';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'Authentication',
    description: 'Login or register to access your account.',
    url: `${getBaseUrl()}/auth`,
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
