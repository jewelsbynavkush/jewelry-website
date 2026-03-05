import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PageSectionRenderer from '@/components/content/PageSectionRenderer';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { MaterialsPageContent } from '@/types/data';

const defaultMaterials: MaterialsPageContent = {
  title: 'MATERIALS',
  sections: [
    {
      paragraphs: [
        'At Jewels by Navkush, we specialize in freshwater pearls and cultured pearls, carefully selected for their natural beauty and radiant luster.',
        'Freshwater pearls are known for their soft glow and organic charm, while cultured pearls are cultivated with precision to achieve exceptional quality and elegance. Each pearl is thoughtfully chosen to ensure our jewelry reflects timeless sophistication and refined craftsmanship.',
      ],
    },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'Materials - Premium Jewelry Materials',
  description: 'Learn about the premium materials we use in our jewelry collection. Discover our commitment to quality with precious metals, gemstones, and sustainable sourcing.',
  url: `${getBaseUrl()}/materials`,
});

export default async function MaterialsPage() {
  const settings = await getSiteSettings();
  const content = settings.materials ?? defaultMaterials;

  const visibleSections = content.sections.filter((s) => s.visible !== false);
  return (
    <PageSectionLayout
      title={content.title}
      srOnlyTitle="Materials - Premium Jewelry Materials"
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
