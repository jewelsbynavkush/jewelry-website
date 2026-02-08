import { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Privacy Policy - Data Protection & Privacy',
  description: 'Read our privacy policy to understand how Jewels by NavKush collects, uses, and protects your personal information. We are committed to protecting your privacy and data security.',
  url: `${getBaseUrl()}/privacy`,
});

export default function PrivacyPage() {
  return (
    <PageSectionLayout
      title="PRIVACY POLICY"
      srOnlyTitle="Privacy Policy - Data Protection & Privacy"
      maxWidth="4xl"
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        <ScrollReveal delay={0.1}>
          <section>
            <p className="mb-4">
              <strong className="text-[var(--text-on-cream)]">Last Updated:</strong> November 2024
            </p>
            <p>
              At Jewels by NavKush, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Information We Collect
            </SectionHeading>
              <p className="mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through our payment providers)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
              <p>
                We also automatically collect certain information when you visit our website, such as your IP address, browser type, and browsing behavior.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              How We Use Your Information
            </SectionHeading>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and our products</li>
                <li>Improve our website and customer experience</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Data Security
            </SectionHeading>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Your Rights
            </SectionHeading>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to certain processing activities</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in our Contact page.
              </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Contact Us
            </SectionHeading>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="/contact" className="text-[var(--beige)] hover:text-[var(--beige-hover)] underline">
                  our contact page
                </a>.
            </p>
          </section>
        </ScrollReveal>
      </div>
    </PageSectionLayout>
  );
}

