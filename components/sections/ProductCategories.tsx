import { getSiteSettings } from '@/lib/data/site-settings';
import { getCategoryImages } from '@/lib/data/products';
import { getCategories, transformCategoriesForUI } from '@/lib/data/categories';
import CategoryLink from '@/components/ui/CategoryLink';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CategoryImage3D from './CategoryImage3D';
import { getCategoryImageSource, CategoryType } from '@/lib/utils/image-helpers';

interface CategoryImageSectionProps {
  category: CategoryType;
  imageUrl?: string;
}

function CategoryImageSection({ category, imageUrl }: CategoryImageSectionProps) {
  const imageSource = getCategoryImageSource(category, imageUrl);
  
  return (
    <CategoryImage3D 
      category={category} 
      imageSource={imageSource}
    />
  );
}

export default async function ProductCategories() {
  const settings = await getSiteSettings();
  const categoryImages = await getCategoryImages();
  const categories = await getCategories();
  const categoriesForUI = transformCategoriesForUI(categories);
  
  const leftCategories = categoriesForUI.filter((_, index) => index % 2 === 0);
  const rightCategories = categoriesForUI.filter((_, index) => index % 2 === 1);

  return (
    <section id="products-section">
      {/* Heading Section - Light Background */}
      <div className="bg-[var(--cream)] section-padding">
        <div className="section-container">
          <ScrollReveal>
            <h2 className="font-section-heading text-center">
              {settings.products.title || 'OUR PRODUCTS'}
            </h2>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content Area - Beige Background */}
      <div className="bg-[var(--beige)] section-padding">
        <div className="section-container">
            {/* Mobile: Single Column Stacked */}
            <div className="flex flex-col md:hidden standard-gap-small">
              {categoriesForUI.map((category, index) => (
                <ScrollReveal key={category.slug} delay={0.1 + index * 0.1}>
                  <div className="w-full">
                    <CategoryLink
                      name={category.displayName}
                      href={category.href}
                      variant="products"
                      index={index}
                      total={categoriesForUI.length}
                    />
                    <CategoryImageSection 
                      category={category} 
                      imageUrl={categoryImages[category.slug]}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Tablet & Desktop: 2-Column Grid */}
            <div className="hidden md:grid md:grid-cols-2 standard-gap container-content max-w-6xl">
              {/* Left Column */}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col justify-between min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px]">
                  {leftCategories.map((category, index) => (
                    <ScrollReveal key={category.slug} delay={0.2 + index * 0.1}>
                      <div className="w-full">
                        <CategoryLink
                          name={category.displayName}
                          href={category.href}
                          variant="products"
                          index={index * 2}
                          total={categoriesForUI.length}
                        />
                        {index === 0 && leftCategories.length > 0 && (
                          <CategoryImageSection 
                            category={leftCategories[0]} 
                            imageUrl={categoryImages[leftCategories[0].slug]}
                          />
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                  {leftCategories.length > 1 && (
                    <ScrollReveal delay={0.4}>
                      <CategoryImageSection 
                        category={leftCategories[1]} 
                        imageUrl={categoryImages[leftCategories[1].slug]}
                      />
                    </ScrollReveal>
                  )}
                </div>
              </ScrollReveal>

              {/* Right Column */}
              <ScrollReveal delay={0.3}>
                <div className="flex flex-col justify-between min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px]">
                  {rightCategories.map((category, index) => (
                    <ScrollReveal key={category.slug} delay={0.3 + index * 0.1}>
                      <div className="w-full">
                        <CategoryLink
                          name={category.displayName}
                          href={category.href}
                          variant="products"
                          index={index * 2 + 1}
                          total={categoriesForUI.length}
                        />
                        {index === 0 && rightCategories.length > 0 && (
                          <CategoryImageSection 
                            category={rightCategories[0]} 
                            imageUrl={categoryImages[rightCategories[0].slug]}
                          />
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                  {rightCategories.length > 1 && (
                    <ScrollReveal delay={0.5}>
                      <CategoryImageSection 
                        category={rightCategories[1]} 
                        imageUrl={categoryImages[rightCategories[1].slug]}
                      />
                    </ScrollReveal>
                  )}
                </div>
              </ScrollReveal>
            </div>
        </div>
      </div>
    </section>
  );
}
