import { Metadata } from 'next';
import ContactForm from '@/components/sections/ContactForm';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import InfoCard from '@/components/ui/InfoCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Jewels by NavKush for inquiries about our jewelry collection. We\'d love to hear from you and help you find the perfect piece.',
  url: `${getBaseUrl()}/contact`,
});

export default function ContactPage() {
  return (
    <PageContainer maxWidth="3xl">
      <ScrollReveal>
        <h1 className="sr-only">Contact Us - Get in Touch with Jewels by NavKush</h1>
        <SectionHeading as="h2">CONTACT US</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="text-center text-[var(--text-secondary)] standard-mb text-body-sm sm:text-body-base md:text-body-lg">
          Have a question or want to learn more about our jewelry? We&apos;d love to hear from you.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <div className="grid md:grid-cols-2 standard-gap-small standard-mb">
          <InfoCard title="Get in Touch">
            <div className="standard-space-y-small text-[var(--text-secondary)] text-body-base">
              <p>
                <strong className="text-[var(--text-on-cream)]">Email:</strong> info@jewelrystore.com
              </p>
              <p>
                <strong className="text-[var(--text-on-cream)]">Phone:</strong> +1 (555) 123-4567
              </p>
              <p>
                <strong className="text-[var(--text-on-cream)]">Address:</strong> 123 Jewelry Street, City, State 12345
              </p>
            </div>
          </InfoCard>
          <InfoCard title="Business Hours">
            <div className="standard-space-y-small text-[var(--text-secondary)] text-body-base">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </InfoCard>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <ContactForm />
      </ScrollReveal>
    </PageContainer>
  );
}

