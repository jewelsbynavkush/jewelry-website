import { Metadata } from 'next';
import { getDesigns } from '@/lib/cms/queries';
import { CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilterButton from '@/components/ui/CategoryFilterButton';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { generateCollectionPageSchema } from '@/lib/seo/structured-data';
import { formatCategoryName } from '@/lib/utils/text-formatting';

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  const title = category 
    ? `${formatCategoryName(category)} - Jewelry Collection`
    : 'Jewelry Designs - Browse Our Collection';
  
  const description = category
    ? `Explore our exquisite collection of ${formatCategoryName(category)} jewelry. Handcrafted with precision and elegance.`
    : 'Explore our exquisite collection of handcrafted jewelry designs. Discover rings, earrings, necklaces, and bracelets.';
  
  const url = category 
    ? `${baseUrl}/designs?category=${category}`
    : `${baseUrl}/designs`;

  return generateStandardMetadata({
    title,
    description,
    url,
  });
}

export default async function DesignsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const designs = await getDesigns(category);
  
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="bg-[#faf8f5] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
        <ScrollReveal>
          <h1 className="font-section-heading text-center mb-8 sm:mb-10 md:mb-12">
            {category ? formatCategoryName(category).toUpperCase() : 'OUR DESIGNS'}
          </h1>
        </ScrollReveal>
        
        {/* Category Filter */}
        <ScrollReveal delay={0.1}>
          <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12" aria-label="Category filter">
            {filterCategories.map((cat, index) => (
              <CategoryFilterButton
                key={cat.value}
                name={cat.name}
                href={cat.href}
                isActive={(!category && !cat.value) || category === cat.value}
                index={index}
              />
            ))}
          </nav>
        </ScrollReveal>

            {designs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6a6a6a] text-body-lg mb-4">
              No designs available {category ? `in ${category} category` : 'yet'}.
            </p>
                <p className="text-[#918c87] text-body-base">
              Please add designs in Sanity.io CMS to see them here.
            </p>
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            <div 
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
              role="list"
              aria-label="Jewelry products"
            >
              {designs.map((design, index) => (
                <div
                  key={design._id}
                  className="bg-[#faf8f5] rounded-lg overflow-hidden border border-[#e8e5e0]"
                  role="listitem"
                >
                  <ProductCard design={design} showDescription index={index} />
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

