import { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Sustainability - Ethical Jewelry Practices',
  description: 'Learn about Jewels by NavKush commitment to sustainability and ethical practices. Discover how we create beautiful jewelry while protecting our planet and supporting responsible sourcing.',
  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/sustainability`,
});

export default function SustainabilityPage() {
  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <SectionHeading>SUSTAINABILITY</SectionHeading>
      </ScrollReveal>
      
      <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
        <ScrollReveal delay={0.1}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Our Commitment
            </SectionHeading>
                <p className="mb-4">
                  At Jewels by NavKush, we believe that beautiful jewelry should be created responsibly. Our commitment to sustainability guides every aspect of our business, from material sourcing to packaging and shipping.
                </p>
                <p>
                  We are dedicated to minimizing our environmental impact while creating pieces that will be cherished for generations. This means working with suppliers who share our values and implementing practices that protect our planet.
                </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Ethical Sourcing
            </SectionHeading>
                <p className="mb-4">
                  We source our materials from suppliers who adhere to strict ethical standards. This includes ensuring that our metals and gemstones are obtained through responsible mining practices and that workers throughout our supply chain are treated fairly.
                </p>
                <p>
                  We are committed to transparency in our supply chain and continuously work to improve our sourcing practices to ensure that every piece we create supports both environmental and social responsibility.
                </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Sustainable Practices
            </SectionHeading>
                <p className="mb-4">
                  Our sustainability efforts extend to every aspect of our operations. We use eco-friendly packaging materials, minimize waste in our production process, and work with partners who share our commitment to environmental stewardship.
                </p>
                <p>
                  We believe that creating timeless jewelry means creating pieces that not only last for generations but are made in a way that preserves our planet for future generations to enjoy.
                </p>
          </section>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
}

