import { getSiteSettings } from '@/lib/data/site-settings';
import { DEFAULTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AboutImage3D from './AboutImage3D';

export default async function AboutUs() {
  const settings = await getSiteSettings();

  // Fallback to default content if CMS settings are empty to prevent blank page
  const contentArray = settings.about.content.length > 0 
    ? settings.about.content 
    : [
        'We carefully select the finest materials—precious metals, sparkling gemstones, and luxurious pearls—to create each piece. Every design is meticulously crafted by skilled artisans, ensuring that each item is not only beautiful but built to last.',
        'Our commitment to excellence is reflected in every detail, from the intricate designs to the flawless finish. At Jewels by NavKush, we are dedicated to creating jewelry that transcends trends, offering pieces that will remain cherished for generations.',
        'At Jewels by NavKush, we believe that jewelry is more than just an accessory; it\'s a timeless expression of elegance and a celebration of life\'s most precious moments. With a legacy spanning over decades, our brand has become synonymous with exceptional craftsmanship and sophistication.'
      ];

  // Split into left and right columns
  const leftContent = contentArray.slice(0, 2);
  const rightContent = contentArray.slice(2);

  return (
    <section id="about-section" className="bg-[var(--cream)] section-padding">
      <div className="section-container">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col md:hidden standard-gap-small">
          <ScrollReveal>
            <h2 className="font-section-heading text-center sm:text-left">
              {settings.about.title || 'ABOUT US'}
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <div className="standard-space-y-small">
              {[...leftContent, ...rightContent].map((text, idx) => (
                <p key={idx} className="text-[var(--text-secondary)] text-body-sm sm:text-body-base">
                  {text}
                </p>
              ))}
                {rightContent.length === 0 && contentArray.length > 2 && (
                  <p className="text-[var(--text-secondary)] text-body-sm sm:text-body-base">
                    {contentArray[2]}
                  </p>
                )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <AboutImage3D aboutImage={settings.about.image} aboutImageAlt={settings.about.alt} isMobile={true} />
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Button href="/about" className="w-full sm:w-auto">
              {settings.about.buttonText || DEFAULTS.aboutButtonText} →
            </Button>
          </ScrollReveal>
        </div>

        {/* Tablet & Desktop: 2-Column Grid */}
        <div className="hidden md:grid md:grid-cols-2 standard-gap items-start">
          {/* Left Column */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 lg:space-y-8">
              {/* Top Row: About Us Heading */}
              <h2 className="font-section-heading text-left">
                {settings.about.title || 'ABOUT US'}
              </h2>
              
              {/* Bottom Row: Message + Button */}
              <div className="space-y-4 lg:space-y-6">
                {leftContent.map((text, idx) => (
                  <p key={idx} className="text-[var(--text-secondary)] text-body-sm lg:text-body-base xl:text-body-lg">
                    {text}
                  </p>
                ))}
                
                <Button href="/about" className="mt-4 sm:mt-6 w-full md:w-auto">
                  {settings.about.buttonText || DEFAULTS.aboutButtonText} →
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
                  <p key={idx} className="text-[var(--text-secondary)] text-body-sm lg:text-body-base xl:text-body-lg">
                    {text}
                  </p>
                ))}
                {rightContent.length === 0 && (
                  <p className="text-[var(--text-secondary)] text-body-sm lg:text-body-base xl:text-body-lg">
                    {contentArray[2] || ''}
                  </p>
                )}
              </div>
              
              {/* Bottom Row: Image */}
              <AboutImage3D aboutImage={settings.about.image} aboutImageAlt={settings.about.alt} isMobile={false} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
