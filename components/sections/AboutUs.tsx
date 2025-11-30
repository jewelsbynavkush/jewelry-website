import { getSiteSettings } from '@/lib/cms/queries';
import { DEFAULTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AboutUsClient from './AboutUsClient';
import { SiteSettings } from '@/types/cms';

interface AboutUsSettings {
  aboutTitle?: string;
  aboutContent?: SiteSettings['aboutContent'];
  aboutImage?: SiteSettings['aboutImage'];
  aboutButtonText?: string;
}

export default async function AboutUs() {
  const settings = await getSiteSettings<AboutUsSettings>();

  // Split content into two parts for two columns
  const defaultContent = [
    'We carefully select the finest materials—precious metals, sparkling gemstones, and luxurious pearls—to create each piece. Every design is meticulously crafted by skilled artisans, ensuring that each item is not only beautiful but built to last.',
    'Our commitment to excellence is reflected in every detail, from the intricate designs to the flawless finish. At Jewels by NavKush, we are dedicated to creating jewelry that transcends trends, offering pieces that will remain cherished for generations.',
    'At Jewels by NavKush, we believe that jewelry is more than just an accessory; it\'s a timeless expression of elegance and a celebration of life\'s most precious moments. With a legacy spanning over decades, our brand has become synonymous with exceptional craftsmanship and sophistication.'
  ];

  let contentArray: string[] = [];
  if (settings.aboutContent) {
    if (typeof settings.aboutContent === 'string') {
      contentArray = [settings.aboutContent];
    } else if (Array.isArray(settings.aboutContent)) {
      contentArray = settings.aboutContent
        .map((block) => {
          if (typeof block === 'object' && block !== null && 'children' in block) {
            const children = Array.isArray(block.children) ? block.children : [];
            const firstChild = children[0];
            if (firstChild && typeof firstChild === 'object' && 'text' in firstChild) {
              return typeof firstChild.text === 'string' ? firstChild.text : '';
            }
          }
          return '';
        })
        .filter(Boolean);
    }
  }
  
  if (contentArray.length === 0) {
    contentArray = defaultContent;
  }

  // Split into left and right columns
  const leftContent = contentArray.slice(0, 2);
  const rightContent = contentArray.slice(2);

  return (
    <section id="about-section" className="bg-[#faf8f5] py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col md:hidden gap-6 sm:gap-8">
          <ScrollReveal>
            <h2 className="font-section-heading text-center sm:text-left">
              {settings.aboutTitle || 'ABOUT US'}
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              {[...leftContent, ...rightContent].map((text, idx) => (
                <p key={idx} className="text-[#6a6a6a] text-body-sm sm:text-body-base">
                  {text}
                </p>
              ))}
              {rightContent.length === 0 && (
                <p className="text-[#6a6a6a] text-body-sm sm:text-body-base">
                  {defaultContent[2]}
                </p>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <AboutUsClient aboutImage={settings.aboutImage} isMobile={true} />
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Button href="/about" className="w-full sm:w-auto">
              {settings.aboutButtonText || DEFAULTS.aboutButtonText} →
            </Button>
          </ScrollReveal>
        </div>

        {/* Tablet & Desktop: 2-Column Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start">
          {/* Left Column */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 lg:space-y-8">
              {/* Top Row: About Us Heading */}
              <h2 className="font-section-heading text-left">
                {settings.aboutTitle || 'ABOUT US'}
              </h2>
              
              {/* Bottom Row: Message + Button */}
              <div className="space-y-4 lg:space-y-6">
                {leftContent.map((text, idx) => (
                  <p key={idx} className="text-[#6a6a6a] text-body-sm lg:text-body-base xl:text-body-lg">
                    {text}
                  </p>
                ))}
                
                <Button href="/about" className="mt-4 sm:mt-6 w-full md:w-auto">
                  {settings.aboutButtonText || DEFAULTS.aboutButtonText} →
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-6 lg:space-y-8">
              {/* Top Row: Continuing Message */}
              <div className="space-y-4 lg:space-y-6">
                {rightContent.map((text, idx) => (
                  <p key={idx} className="text-[#6a6a6a] text-body-sm lg:text-body-base xl:text-body-lg">
                    {text}
                  </p>
                ))}
                {rightContent.length === 0 && (
                  <p className="text-[#6a6a6a] text-body-sm lg:text-body-base xl:text-body-lg">
                    {defaultContent[2]}
                  </p>
                )}
              </div>
              
              {/* Bottom Row: Image */}
              <AboutUsClient aboutImage={settings.aboutImage} isMobile={false} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
