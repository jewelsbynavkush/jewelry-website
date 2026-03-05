import { getSiteSettings } from '@/lib/data/site-settings';
import { DEFAULTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AboutImage3D from './AboutImage3D';

export default async function AboutUs() {
  const settings = await getSiteSettings();

  const defaultContent = [
    'Jewels by Navkush creates timeless jewelry inspired by elegance and refined craftsmanship. Specializing in freshwater and cultured pearls, our collections feature beautifully designed necklace sets and pearl stud essentials. Each piece is thoughtfully crafted to celebrate natural beauty and become a treasured part of your story.',
    'Jewels by Navkush was born from the friendship of two best friends of nearly two decades and a shared love for timeless pearls.',
    'What began as a passion soon became a vision—to create elegant jewelry that celebrates natural beauty and refined craftsmanship. Specializing in freshwater and cultured pearls, our collections feature thoughtfully designed necklace sets and pearl stud essentials, crafted to bring effortless sophistication to every moment.',
    'Jewels by Navkush is a reflection of friendship, passion, and a shared dream turned into timeless jewelry.',
    'We invite you to explore our collections and discover a piece that becomes part of your story.',
  ];
  const contentArray = settings.about.content.length > 0 ? settings.about.content : defaultContent;

  const leftContent = contentArray.slice(0, 3);
  const rightContent = contentArray.slice(3, 5);

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
              {contentArray.slice(0, 5).map((text, idx) => (
                <p key={idx} className="text-[var(--text-secondary)] text-body-sm sm:text-body-base">
                  {text}
                </p>
              ))}
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
