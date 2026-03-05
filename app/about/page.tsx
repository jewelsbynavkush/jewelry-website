import type { Metadata } from 'next';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';

const defaultIntro = 'Jewels by Navkush creates timeless jewelry inspired by elegance and refined craftsmanship. Specializing in freshwater and cultured pearls, our collections feature beautifully designed necklace sets and pearl stud essentials. Each piece is thoughtfully crafted to celebrate natural beauty and become a treasured part of your story.';

const defaultOurStory = 'Jewels by Navkush was born from the friendship of two best friends of nearly two decades and a shared love for timeless pearls.\n\nWhat began as a passion soon became a vision—to create elegant jewelry that celebrates natural beauty and refined craftsmanship. Specializing in freshwater and cultured pearls, our collections feature thoughtfully designed necklace sets and pearl stud essentials, crafted to bring effortless sophistication to every moment.\n\nJewels by Navkush is a reflection of friendship, passion, and a shared dream turned into timeless jewelry.';

export const metadata: Metadata = generateStandardMetadata({
  title: 'About Us',
  description: 'Learn about Jewels by NavKush and our commitment to quality craftsmanship. Discover our story, values, and dedication to creating timeless jewelry pieces.',
  url: `${getBaseUrl()}/about`,
});

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const intro = settings.about?.intro ?? defaultIntro;
  const ourStory = settings.about?.ourStory ?? defaultOurStory;
  const storyParagraphs = ourStory.split(/\n\n+/).filter(Boolean);

  return (
    <PageSectionLayout
      title={settings.about?.title ?? 'ABOUT US'}
      srOnlyTitle="About Us - Jewels by NavKush"
      maxWidth="5xl"
    >
      <div className="space-y-8 sm:space-y-10 md:space-y-12 text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
        <ScrollReveal delay={0.1}>
          <section>
            <p>{intro}</p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section>
            <SectionHeading as="h2" size="md" align="left">
              Our Story
            </SectionHeading>
            <div className="standard-space-y mt-4">
              {storyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </PageSectionLayout>
  );
}
