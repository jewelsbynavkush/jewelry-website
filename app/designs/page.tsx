import { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/data/products';
import { CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilterButton from '@/components/ui/CategoryFilterButton';
import ProductSort from '@/components/ui/ProductSort';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { generateCollectionPageSchema } from '@/lib/seo/structured-data';
import { formatCategoryName } from '@/lib/utils/text-formatting';
import { getBaseUrl } from '@/lib/utils/env';

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  const baseUrl = getBaseUrl();
  
  const title = category 
    ? `${formatCategoryName(category)} - Jewelry Collection`
    : 'Jewelry Designs - Browse Our Collection';
  
  const description = category
    ? `Explore our exquisite collection of ${formatCategoryName(category)} jewelry. Handcrafted with precision and elegance.`
    : 'Explore our exquisite collection of handcrafted jewelry designs. Discover rings, earrings, necklaces, and bracelets.';
  
  const url = category 
    ? `${baseUrl}/designs?category=${category}`
    : `${baseUrl}/designs`;

  const keywords = [
    'jewelry designs',
    'jewelry collection',
    'handcrafted jewelry',
    'luxury jewelry',
    'fine jewelry',
    category ? formatCategoryName(category).toLowerCase() : '',
    category ? `${formatCategoryName(category)} jewelry` : '',
    'rings',
    'earrings',
    'necklaces',
    'bracelets',
    'precious metals',
    'gemstones',
  ].filter(Boolean); // Remove empty strings

  return generateStandardMetadata({
    title,
    description,
    url,
    keywords,
  });
}

export default async function DesignsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || 'default';
  let products = await getProducts(category);
  
  // Apply sorting
  if (sort !== 'default') {
    products = [...products].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }
  
  const collectionSchema = generateCollectionPageSchema(category);

  const filterCategories = [
    { name: 'All', value: '', href: '/designs' },
    ...CATEGORIES.map(cat => ({ 
      name: formatCategoryName(cat.slug), 
      value: cat.slug, 
      href: cat.href 
    })),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <div className="bg-[var(--cream)]">
        <div className="section-container section-padding">
        <ScrollReveal>
          <h1 className="sr-only">
            {category ? `${formatCategoryName(category)} - Jewelry Collection` : 'Our Designs - Jewelry Collection'}
          </h1>
          <SectionHeading as="h2" className="text-center standard-mb">
            {category ? formatCategoryName(category).toUpperCase() : 'OUR DESIGNS'}
          </SectionHeading>
        </ScrollReveal>
        
        {/* Category Filter and Sort */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center justify-between standard-gap-small standard-mb">
            <nav className="flex flex-wrap justify-center standard-gap-small" aria-label="Category filter">
              {filterCategories.map((cat) => (
                <CategoryFilterButton
                  key={cat.value}
                  name={cat.name}
                  href={cat.href}
                  isActive={(!category && !cat.value) || category === cat.value}
                />
              ))}
            </nav>
            {products.length > 0 && (
              <Suspense fallback={<div className="w-32 h-10" />}>
                <ProductSort />
              </Suspense>
            )}
          </div>
        </ScrollReveal>

            {products.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-8 sm:py-10 md:py-12" role="status" aria-live="polite">
              <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">
                🔍
              </div>
              <h2 className="text-[var(--text-on-cream)] text-xl sm:text-2xl font-bold font-playfair mb-2">
                No Products Found
              </h2>
              <p className="text-[var(--text-secondary)] text-body-lg mb-2">
                {category 
                  ? `No products available in ${formatCategoryName(category)} category yet.`
                  : 'No products available yet.'}
              </p>
              <p className="text-[var(--text-muted)] text-body-base mb-6">
                Check back soon for new additions to our collection.
              </p>
              {category && (
                <Button href="/designs" className="min-h-[44px]">
                  VIEW ALL PRODUCTS →
                </Button>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={0.2} key={`products-${category || 'all'}`}>
            <div 
              className="responsive-grid-4 container-content"
              role="list"
              aria-label="Jewelry products"
            >
              {products.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard product={product} showDescription />
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
        </div>
      </div>
    </>
  );
}

