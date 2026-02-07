'use client';

import { DEFAULTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import CategoryLink from '@/components/ui/CategoryLink';
import ScrollReveal from '@/components/ui/ScrollReveal';
import HeroImage3D from './HeroImage3D';
import type { Category } from '@/types/data';

interface IntroSectionClientProps {
  brandName?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  heroImage?: string;
  heroImageAlt?: string;
  rightColumnSlogan?: string;
  categories: Array<Category & { href: string }>;
}

/**
 * Intro section client component (animations removed for iOS scroll compatibility)
 */
export default function IntroSectionClient({
  brandName = DEFAULTS.brandName,
  heroTitle = DEFAULTS.heroTitle,
  heroDescription = 'Discover exquisite jewelry inspired by the beauty of the heavens. Each piece is crafted to bring elegance and grace to your most cherished occasions.',
  heroButtonText = DEFAULTS.heroButtonText,
  heroImage,
  heroImageAlt,
  rightColumnSlogan = DEFAULTS.rightColumnSlogan,
  categories,
}: IntroSectionClientProps) {
  return (
    <section 
      id="intro-section" 
      className="bg-[var(--beige)]"
    >
      {/* Brand Heading */}
      <ScrollReveal>
        <div className="section-container section-padding-small">
          <h1 className="text-[var(--text-on-beige)] text-center font-brand-display">
            {brandName}
          </h1>
        </div>
      </ScrollReveal>

      {/* 3-Column Hero Section - Responsive Layout */}
      <div className="section-container">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col md:hidden standard-gap section-padding-small">
          {/* Mobile: Brand Heading */}
          <ScrollReveal>
            <div className="text-center space-y-4">
              <h2 className="text-[var(--text-on-beige)] font-hero-title uppercase text-2xl sm:text-3xl">
                {heroTitle}
              </h2>
              <p className="text-[var(--text-on-beige)] text-body-sm sm:text-body-base">
                {heroDescription}
              </p>
              <div>
                <Button href="/designs" className="w-full sm:w-auto">
                  {heroButtonText} →
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Mobile: Hero Image */}
          <ScrollReveal>
            <HeroImage3D heroImage={heroImage} heroImageAlt={heroImageAlt} isMobile={true} />
          </ScrollReveal>

          {/* Mobile: Slogan */}
          <div className="text-center">
            <p className="text-[var(--text-on-beige)] text-heading-sm sm:text-heading-md">
              {rightColumnSlogan}
            </p>
          </div>

          {/* Mobile: Category Menu */}
          <div className="flex flex-col standard-gap-small">
            {categories.map((category, index) => (
              <div key={category.slug} className="w-full">
                <CategoryLink
                  name={category.displayName}
                  href={category.href}
                  variant="intro"
                  index={index}
                  total={categories.length}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: 3-Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 standard-gap items-end">
          {/* Left Column: Collection 2025, Message, Discover Button */}
          <ScrollReveal>
            <div className="space-y-4 lg:space-y-6 pb-12 md:pb-16 lg:pb-20">
              <h2 className="text-[var(--text-on-beige)] font-hero-title uppercase text-3xl lg:text-4xl xl:text-5xl">
                {heroTitle}
              </h2>
              <p className="text-[var(--text-on-beige)] text-body-sm lg:text-body-base xl:text-body-lg">
                {heroDescription}
              </p>
              <div>
                <Button href="/designs" className="w-full lg:w-auto">
                  {heroButtonText} →
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Center Column: Hero Image */}
          <ScrollReveal>
            <HeroImage3D heroImage={heroImage} heroImageAlt={heroImageAlt} isMobile={false} />
          </ScrollReveal>

          {/* Right Column: Slogan and Category Menu */}
          <ScrollReveal>
            <div className="flex flex-col justify-between h-full w-full min-h-[400px] lg:min-h-[500px] pb-12 md:pb-16 lg:pb-20">
              {/* Top: Slogan - Full Row */}
              <div className="w-full mb-4 sm:mb-6 md:mb-8">
                <p className="text-[var(--text-on-beige)] text-heading-sm lg:text-heading-md xl:text-heading-lg text-right w-full">
                  {rightColumnSlogan}
                </p>
              </div>
              
              {/* Bottom: Category Menu - Each link takes full row with dividers */}
              <div className="flex flex-col justify-end w-full mt-auto">
                {categories.map((category, index) => (
                  <div key={category.slug} className="w-full">
                    <CategoryLink
                      name={category.displayName}
                      href={category.href}
                      variant="intro"
                      index={index}
                      total={categories.length}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
