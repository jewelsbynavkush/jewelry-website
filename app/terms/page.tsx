import type { Metadata } from 'next';
import Link from 'next/link';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PageSectionRenderer from '@/components/content/PageSectionRenderer';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { TermsPageContent } from '@/types/data';

const defaultTerms: TermsPageContent = {
  title: 'TERMS OF SERVICE',
  lastUpdated: 'November 2024',
  sections: [
    {
      paragraphs: [
        'Please read these Terms of Service carefully before using the Jewels by NavKush website. By accessing or using our website, you agree to be bound by these terms.',
      ],
    },
    {
      heading: 'Acceptance of Terms',
      paragraphs: [
        'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our website.',
      ],
    },
    {
      heading: 'Products and Pricing',
      paragraphs: [
        'We strive to provide accurate product descriptions and pricing. However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.',
        'All prices are listed in INR (Indian Rupees) unless otherwise stated. Prices are subject to change without notice, but we will honor the price at the time of your order.',
      ],
    },
    {
      heading: 'Orders and Payment',
      paragraphs: [
        'When you place an order, you are making an offer to purchase products at the prices listed. We reserve the right to accept or decline your order for any reason.',
        'Payment must be received before we process and ship your order. We accept major credit cards and other payment methods as indicated during checkout.',
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'All content on this website, including text, graphics, logos, images, and software, is the property of Jewels by NavKush and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      paragraphs: [
        'Jewels by NavKush shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or products.',
      ],
    },
    {
      heading: 'Changes to Terms',
      paragraphs: [
        'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.',
      ],
    },
    {
      heading: 'Contact Information',
      paragraphs: [
        'If you have questions about these Terms of Service, please contact us at Our Contact Page.',
      ],
    },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'Terms of Service - Terms & Conditions',
  description: 'Read our terms of service to understand the terms and conditions for using Jewels by NavKush website and purchasing our jewelry products.',
  url: `${getBaseUrl()}/terms`,
});

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const content = settings.terms ?? defaultTerms;

  return (
    <PageSectionLayout
      title={content.title}
      srOnlyTitle="Terms of Service - Terms & Conditions"
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
