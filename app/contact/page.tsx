import { Metadata } from 'next';
import ContactForm from '@/components/sections/ContactForm';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import InfoCard from '@/components/ui/InfoCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Jewels by NavKush for inquiries about our jewelry collection. We\'d love to hear from you and help you find the perfect piece.',
  url: `${getBaseUrl()}/contact`,
});

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const getValueOrPlaceholder = (value: string | undefined): string => {
    return (value && value.trim()) ? value.trim() : '--';
  };

  const contactEmail = getValueOrPlaceholder(settings.contact?.email);
  const contactPhone = getValueOrPlaceholder(settings.contact?.phone);
  const contactAddress = getValueOrPlaceholder(settings.contact?.address);
  const businessHours = getValueOrPlaceholder(settings.general?.businessHours);

  return (
    <PageSectionLayout
      title="CONTACT US"
      srOnlyTitle="Contact Us - Get in Touch with Jewels by NavKush"
      maxWidth="3xl"
    >
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
                <strong className="text-[var(--text-on-cream)]">Email:</strong> {contactEmail}
              </p>
              <p>
                <strong className="text-[var(--text-on-cream)]">Phone:</strong> {contactPhone}
              </p>
              <p>
                <strong className="text-[var(--text-on-cream)]">Address:</strong> {contactAddress}
              </p>
            </div>
          </InfoCard>
          <InfoCard title="Business Hours">
            <div className="standard-space-y-small text-[var(--text-secondary)] text-body-base">
              {businessHours === '--' ? (
                <p>--</p>
              ) : (
                businessHours.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              )}
            </div>
          </InfoCard>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <ContactForm />
      </ScrollReveal>
    </PageSectionLayout>
  );
}

