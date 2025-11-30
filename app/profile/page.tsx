import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  ...generateStandardMetadata({
    title: 'My Profile',
    description: 'Manage your account and profile settings.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/profile`,
  }),
  robots: {
    index: false, // Profile pages should not be indexed
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <PageContainer maxWidth="2xl">
      <ScrollReveal>
        <SectionHeading>MY PROFILE</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Card>
          <div className="space-y-5 sm:space-y-6">
            <Input
              type="text"
              label="Name"
              placeholder="Enter your name"
            />
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
            />
            <Input
              type="tel"
              label="Phone"
              placeholder="Enter your phone"
            />
            <Button className="w-full">
              SAVE CHANGES
            </Button>
          </div>
        </Card>
      </ScrollReveal>
    </PageContainer>
  );
}

