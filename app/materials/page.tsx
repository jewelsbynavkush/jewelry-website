import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Materials - Premium Jewelry Materials',
  description: 'Learn about the premium materials we use in our jewelry collection. Discover our commitment to quality with precious metals, gemstones, and sustainable sourcing.',
  url: `${getBaseUrl()}/materials`,
});

export default function MaterialsPage() {
  return (
    <PageSectionLayout
      title="MATERIALS"
      srOnlyTitle="Materials - Premium Jewelry Materials"
      maxWidth="4xl"
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        <ScrollReveal delay={0.1}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Precious Metals
            </SectionHeading>
                <p className="mb-4">
                  At Jewels by NavKush, we work exclusively with the finest precious metals. Our collection features pieces crafted in 14k and 18k gold, sterling silver, and platinum. Each metal is carefully selected for its durability, beauty, and ability to showcase the intricate details of our designs.
                </p>
                <p>
                  We source our metals from certified suppliers who adhere to strict ethical and environmental standards, ensuring that every piece you wear is not only beautiful but responsibly crafted.
                </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Gemstones
            </SectionHeading>
                <p className="mb-4">
                  Our gemstone collection features both natural and lab-grown stones, each selected for its exceptional quality and brilliance. From classic diamonds to vibrant colored gemstones, every stone is carefully chosen to complement our designs.
                </p>
                <p>
                  We offer a wide range of gemstones including diamonds, sapphires, rubies, emeralds, and pearls. Each gemstone is certified and comes with documentation of its origin and quality.
                </p>
              </section>
            </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Quality Assurance
            </SectionHeading>
                <p className="mb-4">
                  Every piece in our collection undergoes rigorous quality control to ensure it meets our exacting standards. We work with master craftspeople who bring decades of experience to each creation.
                </p>
                <p>
                  Our commitment to quality extends beyond the materials themselves—we ensure that every piece is crafted with precision, attention to detail, and the care that our customers deserve.
                </p>
          </section>
        </ScrollReveal>
      </div>
    </PageSectionLayout>
  );
}

