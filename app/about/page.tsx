import { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateStandardMetadata({
  title: 'About Us',
  description: 'Learn about Jewels by NavKush and our commitment to quality craftsmanship. Discover our story, values, and dedication to creating timeless jewelry pieces.',
  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/about`,
});

export default function AboutPage() {
  return (
    <PageContainer maxWidth="5xl">
      <ScrollReveal>
        <SectionHeading>ABOUT US</SectionHeading>
      </ScrollReveal>
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start">
        <ScrollReveal delay={0.1}>
          <div className="space-y-4 sm:space-y-5 md:space-y-6 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
            <section>
              <p className="mb-4">
                We carefully select the finest materials—precious metals, sparkling gemstones, and luxurious pearls—to create each piece. Every design is meticulously crafted by skilled artisans, ensuring that each item is not only beautiful but built to last.
              </p>
              <p>
                Our commitment to excellence is reflected in every detail, from the intricate designs to the flawless finish. At Jewels by NavKush, we are dedicated to creating jewelry that transcends trends, offering pieces that will remain cherished for generations.
              </p>
            </section>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="space-y-4 sm:space-y-5 md:space-y-6 text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
            <p>
              At Jewels by NavKush, we believe that jewelry is more than just an accessory; it&apos;s a timeless expression of elegance and a celebration of life&apos;s most precious moments. With a legacy spanning over decades, our brand has become synonymous with exceptional craftsmanship and sophistication.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
}

