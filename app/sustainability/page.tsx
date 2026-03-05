import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PageSectionRenderer from '@/components/content/PageSectionRenderer';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { SustainabilityPageContent } from '@/types/data';

const defaultSustainability: SustainabilityPageContent = {
  title: 'SUSTAINABILITY',
  sections: [
    {
      paragraphs: [
        'At Jewels by Navkush, we believe true beauty should be responsible and enduring. Our pearls are thoughtfully sourced, and we work with trusted partners who follow ethical cultivation practices.',
        'By focusing on freshwater and cultured pearls, we celebrate materials that are naturally formed and sustainably cultivated. We are committed to mindful sourcing and craftsmanship that respects both nature and tradition.',
      ],
    },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'Sustainability - Ethical Jewelry Practices',
  description: 'Learn about Jewels by NavKush commitment to sustainability and ethical practices. Discover how we create beautiful jewelry while protecting our planet and supporting responsible sourcing.',
  url: `${getBaseUrl()}/sustainability`,
});

export default async function SustainabilityPage() {
  const settings = await getSiteSettings();
  const content = settings.sustainability ?? defaultSustainability;

  const visibleSections = content.sections.filter((s) => s.visible !== false);
  return (
    <PageSectionLayout
      title={content.title}
      srOnlyTitle="Sustainability - Ethical Jewelry Practices"
      maxWidth="4xl"
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {visibleSections.map((section, i) => (
          <ScrollReveal key={i} delay={(i + 1) * 0.1}>
            <PageSectionRenderer section={section} />
          </ScrollReveal>
        ))}
      </div>
    </PageSectionLayout>
  );
}
