import { getSiteSettings, getCategoryImages } from '@/lib/cms/queries';
import { CATEGORIES } from '@/lib/constants';
import CategoryLink from '@/components/ui/CategoryLink';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CategoryImage3D from './CategoryImage3D';
import { getCategoryImageSource, CategoryType } from '@/lib/utils/image-helpers';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface SiteSettings {
  productsTitle?: string;
}

interface CategoryImageSectionProps {
  category: CategoryType;
  sanityImage?: SanityImageSource;
  index?: number;
}

function CategoryImageSection({ category, sanityImage, index = 0 }: CategoryImageSectionProps) {
  const imageSource = getCategoryImageSource(category, sanityImage);
  
  return (
    <CategoryImage3D 
      category={category} 
      imageSource={imageSource}
      index={index}
    />
  );
}

export default async function ProductCategories() {
  const settings = await getSiteSettings<SiteSettings>();
  const categoryImages = await getCategoryImages();

  // Left column: RINGS, NECKLACES
  const leftCategories = [CATEGORIES[0], CATEGORIES[2]]; // RINGS, NECKLACES
  // Right column: EARRINGS, BRACELETS
  const rightCategories = [CATEGORIES[1], CATEGORIES[3]]; // EARRINGS, BRACELETS

  return (
    <section id="products-section">
      {/* Heading Section - Light Background */}
      <ScrollReveal>
        <div className="bg-[#faf8f5] py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="font-section-heading text-center">
              {settings.productsTitle || 'OUR PRODUCTS'}
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content Area - Beige Background */}
      <ScrollReveal delay={0.1}>
        <div className="bg-[#CCC4BA] py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Mobile: Single Column Stacked */}
            <div className="flex flex-col md:hidden gap-6 sm:gap-8">
              {CATEGORIES.map((category, index) => (
                <ScrollReveal key={category.slug} delay={0.1 + index * 0.1}>
                  <div className="w-full">
                    <CategoryLink
                      name={category.name}
                      href={category.href}
                      variant="products"
                      index={index}
                      total={CATEGORIES.length}
                    />
                    <CategoryImageSection 
                      category={category} 
                      sanityImage={categoryImages[category.slug]}
                      index={index}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Tablet & Desktop: 2-Column Grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
              {/* Left Column */}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col justify-between min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                  {leftCategories.map((category, index) => (
                    <ScrollReveal key={category.slug} delay={0.2 + index * 0.1}>
                      <div className="w-full">
                        <CategoryLink
                          name={category.name}
                          href={category.href}
                          variant="products"
                          index={index * 2}
                          total={leftCategories.length * 2}
                        />
                        {index === 0 && (
                          <CategoryImageSection 
                            category={category} 
                            sanityImage={categoryImages[category.slug]}
                            index={index * 2}
                          />
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                  <ScrollReveal delay={0.4}>
                    <CategoryImageSection 
                      category={leftCategories[1]} 
                      sanityImage={categoryImages[leftCategories[1].slug]}
                      index={1}
                    />
                  </ScrollReveal>
                </div>
              </ScrollReveal>

              {/* Right Column */}
              <ScrollReveal delay={0.3}>
                <div className="flex flex-col justify-between min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                  {rightCategories.map((category, index) => (
                    <ScrollReveal key={category.slug} delay={0.3 + index * 0.1}>
                      <div className="w-full">
                        <CategoryLink
                          name={category.name}
                          href={category.href}
                          variant="products"
                          index={index * 2}
                          total={rightCategories.length * 2}
                        />
                        {index === 0 && (
                          <CategoryImageSection 
                            category={category} 
                            sanityImage={categoryImages[category.slug]}
                            index={index * 2 + 2}
                          />
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                  <ScrollReveal delay={0.5}>
                    <CategoryImageSection 
                      category={rightCategories[1]} 
                      sanityImage={categoryImages[rightCategories[1].slug]}
                      index={3}
                    />
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
