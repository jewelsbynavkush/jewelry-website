import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';

const defaultWhyChooseUs = [
  { title: 'Carefully Selected Pearls', description: 'We specialize in freshwater and cultured pearls chosen for their natural beauty, luster, and quality.' },
  { title: 'Timeless Designs', description: 'Our collections are thoughtfully designed to blend classic elegance with modern style.' },
  { title: 'Attention to Craftsmanship', description: 'Each piece is created with meticulous attention to detail to ensure lasting beauty.' },
  { title: 'Elegant & Meaningful Jewelry', description: 'From statement necklace sets to pearl stud essentials, our jewelry is designed to be cherished for years to come.' },
];

export const metadata: Metadata = generateStandardMetadata({
  title: 'Why Choose Us - Jewels by NavKush',
  description: 'Discover why Jewels by NavKush stands out: carefully selected pearls, timeless designs, attention to craftsmanship, and elegant jewelry made to be cherished.',
  url: `${getBaseUrl()}/why-choose-us`,
});

export default async function WhyChooseUsPage() {
  const settings = await getSiteSettings();
  const items = settings.about?.whyChooseUs?.length ? settings.about.whyChooseUs : defaultWhyChooseUs;

  return (
    <PageSectionLayout
      title="WHY CHOOSE US"
      srOnlyTitle="Why Choose Us - Jewels by NavKush"
      maxWidth="5xl"
    >
      <ul className="space-y-6 sm:space-y-8 md:space-y-10 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        {items.map((item, i) => (
          <ScrollReveal key={i} delay={(i + 1) * 0.1}>
            <li>
              <h2 className="font-playfair font-semibold text-[var(--text-on-cream)] text-lg sm:text-xl md:text-2xl mb-2">
                {item.title}
              </h2>
              <p>{item.description}</p>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </PageSectionLayout>
  );
}
