import { Metadata } from 'next';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Shipping & Returns - Jewelry Delivery Information',
  description: 'Learn about our shipping options, delivery times, and return policy. We offer secure shipping and easy returns to ensure your complete satisfaction with your jewelry purchase.',
  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/shipping`,
});

export default function ShippingPage() {
  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <SectionHeading>SHIPPING & RETURNS</SectionHeading>
      </ScrollReveal>
      
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        <ScrollReveal delay={0.1}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Shipping Information
            </SectionHeading>
            <div className="space-y-4 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
              <p>
                We offer secure shipping to ensure your jewelry arrives safely. All orders are carefully packaged in protective materials and shipped via trusted carriers.
              </p>
              <Card padding="sm">
                <SectionHeading as="h3" size="sm" align="left" className="mb-3">
                  Shipping Options
                </SectionHeading>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Standard Shipping: 5-7 business days</li>
                  <li>Express Shipping: 2-3 business days</li>
                  <li>Overnight Shipping: Next business day (available for select items)</li>
                </ul>
              </Card>
              <p>
                Shipping costs are calculated at checkout based on your location and selected shipping method. Free shipping may be available for orders over a certain amount.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Returns & Exchanges
            </SectionHeading>
            <div className="space-y-4 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
              <p>
                We want you to be completely satisfied with your purchase. If you&apos;re not happy with your jewelry, we offer a hassle-free return and exchange policy.
              </p>
              <Card padding="sm">
                <SectionHeading as="h3" size="sm" align="left" className="mb-3">
                  Return Policy
                </SectionHeading>
                <ul className="space-y-2 list-disc list-inside">
                  <li>30-day return window from date of delivery</li>
                  <li>Items must be in original condition with all packaging</li>
                  <li>Custom or personalized items may not be eligible for return</li>
                  <li>Refunds will be processed within 5-7 business days</li>
                </ul>
              </Card>
              <p>
                To initiate a return, please contact our customer service team. We&apos;ll provide you with a return authorization and shipping instructions.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              International Shipping
            </SectionHeading>
            <div className="space-y-4 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
              <p>
                We currently ship to select international destinations. International shipping times and costs vary by location. Please note that customers are responsible for any customs duties or taxes that may apply.
              </p>
              <p>
                For international orders, please allow additional time for customs processing. We recommend choosing express shipping for faster delivery.
              </p>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
}
