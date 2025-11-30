import { getMostLovedDesigns } from '@/lib/cms/queries';
import ProductCard from '@/components/ui/ProductCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import MostLovedHeading from './MostLovedHeading';
import PlaceholderCard3D from './PlaceholderCard3D';
import { getRandomCategoryImages } from '@/lib/utils/image-helpers';

export default async function MostLovedCreations() {
  const designs = await getMostLovedDesigns(8);

  // Ensure we have exactly 8 items (2 rows x 4 columns)
  const displayDesigns = designs.slice(0, 8);
  
  // Get random category images for placeholders
  const placeholderImages = getRandomCategoryImages(8);

  return (
    <section id="most-loved-section" className="bg-[#faf8f5] py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Heading - Stacked vertically */}
        <MostLovedHeading />
        
        <ScrollReveal delay={0.2}>
          <div 
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto"
            role="list"
            aria-label="Most loved jewelry creations"
          >
            {displayDesigns.length === 0 ? (
              // Placeholder cards with 3D effects
              placeholderImages.map((imageSrc, index) => (
                <div key={index} role="listitem">
                  <PlaceholderCard3D imageSrc={imageSrc} index={index} />
                </div>
              ))
            ) : (
              displayDesigns.map((design, index) => (
                <div key={design._id} role="listitem">
                  <ProductCard design={design} index={index} />
                </div>
              ))
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

