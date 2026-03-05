import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PageSectionRenderer from '@/components/content/PageSectionRenderer';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { ShippingPageContent } from '@/types/data';

const defaultShipping: ShippingPageContent = {
  title: 'SHIPPING & RETURNS',
  sections: [
    {
      visible: true,
      heading: 'Shipping Information',
      paragraphs: [
        'We offer secure shipping to ensure your jewelry arrives safely. All orders are carefully packaged in protective materials and shipped via trusted carriers.',
      ],
      subsections: [
        {
          visible: true,
          heading: 'Shipping Options',
          listItems: [
            'Standard Shipping: 5-7 business days',
            'Express Shipping: 2-3 business days',
            'Overnight Shipping: Next business day (available for select items)',
          ],
        },
      ],
      paragraphsAfter: [
        'Shipping costs are calculated at checkout based on your location and selected shipping method. Free shipping is available for orders over the threshold shown at checkout.',
      ],
    },
    {
      visible: true,
      heading: 'Returns & Exchanges',
      paragraphs: [
        "We want you to be completely satisfied with your purchase. If you're not happy with your jewelry, we offer a hassle-free return and exchange policy.",
      ],
      subsections: [
        {
          visible: true,
          heading: 'Return Policy',
          listItems: [
            '30-day return window from date of delivery',
            'Items must be in original condition with all packaging',
            'Custom or personalized items may not be eligible for return',
            'Refunds will be processed within 5-7 business days',
          ],
        },
      ],
      paragraphsAfter: [
        "To initiate a return, please contact our customer service team. We'll provide you with a return authorization and shipping instructions.",
      ],
    },
    {
      visible: true,
      heading: 'International Shipping',
      paragraphs: [
        'We currently ship to select international destinations. International shipping times and costs vary by location. Please note that customers are responsible for any customs duties or taxes that may apply.',
        'For international orders, please allow additional time for customs processing. We recommend choosing express shipping for faster delivery.',
      ],
    },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'Shipping & Returns - Jewelry Delivery Information',
  description: 'Learn about our shipping options, delivery times, and return policy. We offer secure shipping and easy returns to ensure your complete satisfaction with your jewelry purchase.',
  url: `${getBaseUrl()}/shipping`,
});

export default async function ShippingPage() {
  const settings = await getSiteSettings();
  const content = settings.shippingPage ?? defaultShipping;

  const visibleSections = content.sections.filter((s) => s.visible !== false);
  return (
    <PageSectionLayout
      title={content.title}
      srOnlyTitle="Shipping & Returns - Jewelry Delivery Information"
      maxWidth="4xl"
    >
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        {visibleSections.map((section, i) => (
          <ScrollReveal key={i} delay={(i + 1) * 0.1}>
            <div className="space-y-4">
              <PageSectionRenderer section={section} cardSubsections={i < 2} />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </PageSectionLayout>
  );
}
