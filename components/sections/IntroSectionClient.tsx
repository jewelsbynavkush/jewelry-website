'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CATEGORIES, DEFAULTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import CategoryLink from '@/components/ui/CategoryLink';
import ScrollReveal from '@/components/ui/ScrollReveal';
import HeroImage3D from './HeroImage3D';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface IntroSectionClientProps {
  brandName?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  heroImage?: SanityImageSource;
  rightColumnSlogan?: string;
}

export default function IntroSectionClient({
  brandName = DEFAULTS.brandName,
  heroTitle = DEFAULTS.heroTitle,
  heroDescription = 'Discover exquisite jewelry inspired by the beauty of the heavens. Each piece is crafted to bring elegance and grace to your most cherished occasions.',
  heroButtonText = DEFAULTS.heroButtonText,
  heroImage,
  rightColumnSlogan = DEFAULTS.rightColumnSlogan,
}: IntroSectionClientProps) {
  // Ensure animations trigger on mount/navigation
  // Use useState initializer instead of useEffect to avoid setState in effect
  const [isMounted] = useState(true);

  return (
    <section id="intro-section" className="bg-[#CCC4BA]">
      {/* Brand Heading */}
      <ScrollReveal>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
          <motion.h1 
            className="text-white text-center font-brand-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {brandName}
          </motion.h1>
        </div>
      </ScrollReveal>

      {/* 3-Column Hero Section - Responsive Layout */}
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col md:hidden gap-6 sm:gap-8 pb-12 md:pb-16 lg:pb-20">
          {/* Mobile: Brand Heading */}
          <ScrollReveal delay={0.2}>
            <div className="text-center space-y-4">
              <motion.h2 
                className="text-white font-hero-title uppercase text-2xl sm:text-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {heroTitle}
              </motion.h2>
              <motion.p 
                className="text-white text-body-sm sm:text-body-base"
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {heroDescription}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button href="/designs" className="w-full sm:w-auto">
                  {heroButtonText} →
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>

              {/* Mobile: Hero Image */}
              <ScrollReveal delay={0.3}>
                <HeroImage3D heroImage={heroImage} isMobile={true} />
              </ScrollReveal>

          {/* Mobile: Slogan */}
          <div className="text-center">
            <p className="text-white text-heading-sm sm:text-heading-md">
              {rightColumnSlogan}
            </p>
          </div>

          {/* Mobile: Category Menu */}
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((category, index) => (
              <div key={category.slug} className="w-full">
                <CategoryLink
                  name={category.name}
                  href={category.href}
                  variant="intro"
                  index={index}
                  total={CATEGORIES.length}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: 3-Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-end">
          {/* Left Column: Collection 2025, Message, Discover Button */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4 lg:space-y-6 pb-12 md:pb-16 lg:pb-20">
              <motion.h2 
                className="text-white font-hero-title uppercase text-3xl lg:text-4xl xl:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6 }}
              >
                {heroTitle}
              </motion.h2>
              <motion.p 
                className="text-white text-body-sm lg:text-body-base xl:text-body-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {heroDescription}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button href="/designs" className="w-full lg:w-auto">
                  {heroButtonText} →
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Center Column: Hero Image */}
          <ScrollReveal delay={0.3}>
            <HeroImage3D heroImage={heroImage} isMobile={false} />
          </ScrollReveal>

          {/* Right Column: Slogan and Category Menu */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col justify-between h-full w-full min-h-[400px] lg:min-h-[500px] pb-12 md:pb-16 lg:pb-20">
              {/* Top: Slogan - Full Row */}
              <motion.div 
                className="w-full mb-4 sm:mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-white text-heading-sm lg:text-heading-md xl:text-heading-lg text-right w-full">
                  {rightColumnSlogan}
                </p>
              </motion.div>
              
              {/* Bottom: Category Menu - Each link takes full row with dividers */}
              <div className="flex flex-col justify-end w-full mt-auto">
                {CATEGORIES.map((category, index) => (
                  <div key={category.slug} className="w-full">
                    <CategoryLink
                      name={category.name}
                      href={category.href}
                      variant="intro"
                      index={index}
                      total={CATEGORIES.length}
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

