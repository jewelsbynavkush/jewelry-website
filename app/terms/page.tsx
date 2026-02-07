import { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Terms of Service - Terms & Conditions',
  description: 'Read our terms of service to understand the terms and conditions for using Jewels by NavKush website and purchasing our jewelry products.',
  url: `${getBaseUrl()}/terms`,
});

export default function TermsPage() {
  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <h1 className="sr-only">Terms of Service - Terms & Conditions</h1>
        <SectionHeading as="h2">TERMS OF SERVICE</SectionHeading>
      </ScrollReveal>
      
      <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        <ScrollReveal delay={0.1}>
          <section>
            <p className="mb-4">
              <strong className="text-[var(--text-on-cream)]">Last Updated:</strong> November 2024
            </p>
            <p>
              Please read these Terms of Service carefully before using the Jewels by NavKush website. By accessing or using our website, you agree to be bound by these terms.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Acceptance of Terms
            </SectionHeading>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our website.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Products and Pricing
            </SectionHeading>
              <p className="mb-4">
                We strive to provide accurate product descriptions and pricing. However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
              </p>
              <p>
                All prices are listed in INR (Indian Rupees) unless otherwise stated. Prices are subject to change without notice, but we will honor the price at the time of your order.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Orders and Payment
            </SectionHeading>
              <p className="mb-4">
                When you place an order, you are making an offer to purchase products at the prices listed. We reserve the right to accept or decline your order for any reason.
              </p>
              <p>
                Payment must be received before we process and ship your order. We accept major credit cards and other payment methods as indicated during checkout.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Intellectual Property
            </SectionHeading>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of Jewels by NavKush and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Limitation of Liability
            </SectionHeading>
              <p>
                Jewels by NavKush shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or products.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.7}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Changes to Terms
            </SectionHeading>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.8}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Contact Information
            </SectionHeading>
              <p>
                If you have questions about these Terms of Service, please contact us at{' '}
                <a href="/contact" className="text-[var(--beige)] hover:text-[var(--beige-hover)] underline">
                  our contact page
                </a>.
            </p>
          </section>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
}

