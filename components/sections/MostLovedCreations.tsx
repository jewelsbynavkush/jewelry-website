import { getMostLovedProducts } from '@/lib/data/products';
import ProductCard from '@/components/ui/ProductCard';
import MostLovedHeading from './MostLovedHeading';
import { getRandomCategoryImages } from '@/lib/utils/image-helpers';

export default async function MostLovedCreations() {
  const products = await getMostLovedProducts(8);
  const displayProducts = products.slice(0, 8);
  const placeholderImages = getRandomCategoryImages(8);

  return (
    <section id="most-loved-section" className="bg-[var(--cream)] section-padding">
      <div className="section-container">
        <MostLovedHeading />
        
        <div 
          className="responsive-grid-4 container-content"
          role="list"
          aria-label="Most loved jewelry creations"
        >
          {displayProducts.length === 0 ? (
            placeholderImages.map((imageSrc) => (
              <div key={imageSrc} role="listitem">
                <ProductCard 
                  placeholderImage={imageSrc}
                />
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

