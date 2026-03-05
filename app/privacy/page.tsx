import type { Metadata } from 'next';
import Link from 'next/link';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PageSectionRenderer from '@/components/content/PageSectionRenderer';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { PrivacyPageContent } from '@/types/data';

const defaultPrivacy: PrivacyPageContent = {
  title: 'PRIVACY POLICY',
  lastUpdated: 'November 2024',
  sections: [
    {
      paragraphs: [
        'At Jewels by NavKush, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.',
      ],
    },
    {
      heading: 'Information We Collect',
      paragraphs: ['We collect information that you provide directly to us, including:'],
      listItems: [
        'Name, email address, and phone number',
        'Shipping and billing addresses',
        'Payment information (processed securely through our payment providers)',
        'Order history and preferences',
        'Communications with our customer service team',
      ],
      paragraphsAfter: [
        'We also automatically collect certain information when you visit our website, such as your IP address, browser type, and browsing behavior.',
      ],
    },
    {
      heading: 'How We Use Your Information',
      paragraphs: ['We use the information we collect to:'],
      listItems: [
        'Process and fulfill your orders',
        'Communicate with you about your orders and our products',
        'Improve our website and customer experience',
        'Send you marketing communications (with your consent)',
        'Comply with legal obligations',
      ],
    },
    {
      heading: 'Data Security',
      paragraphs: [
        'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
      ],
    },
    {
      heading: 'Your Rights',
      paragraphs: ['You have the right to:'],
      listItems: [
        'Access your personal information',
        'Correct inaccurate information',
        'Request deletion of your information',
        'Opt-out of marketing communications',
        'Object to certain processing activities',
      ],
      paragraphsAfter: [
        'To exercise these rights, please contact us using the information provided in our Contact page.',
      ],
    },
    {
      heading: 'Contact Us',
      paragraphs: [
        'If you have questions about this Privacy Policy, please contact us at Our Contact Page.',
      ],
    },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'Privacy Policy - Data Protection & Privacy',
  description: 'Read our privacy policy to understand how Jewels by NavKush collects, uses, and protects your personal information. We are committed to protecting your privacy and data security.',
  url: `${getBaseUrl()}/privacy`,
});

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const content = settings.privacy ?? defaultPrivacy;

  return (
    <PageSectionLayout
      title={content.title}
      srOnlyTitle="Privacy Policy - Data Protection & Privacy"
      maxWidth="4xl"
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        {content.lastUpdated && (
          <ScrollReveal delay={0.05}>
            <p className="mb-4">
              <strong className="text-[var(--text-on-cream)]">Last Updated:</strong> {content.lastUpdated}
            </p>
          </ScrollReveal>
        )}
        {content.sections.filter((s) => s.visible !== false).map((section, i) => (
          <ScrollReveal key={i} delay={(i + 1) * 0.1}>
            <PageSectionRenderer section={section} />
          </ScrollReveal>
        ))}
        <p className="mt-4">
          <Link href="/contact" className="text-[var(--beige)] hover:text-[var(--beige-hover)] underline">
            Our Contact Page
          </Link>
        </p>
      </div>
    </PageSectionLayout>
  );
}
