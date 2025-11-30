import { Metadata } from 'next';
import { getDesign, getRelatedDesigns } from '@/lib/cms/queries';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import ProductImage3D from '@/components/ui/ProductImage3D';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { formatCategoryName } from '@/lib/utils/text-formatting';
import { formatPrice, getStockStatus } from '@/lib/utils/price-formatting';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const design = await getDesign(params.slug);
  
  if (!design) {
    return {
      title: 'Product Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const url = `${baseUrl}/designs/${design.slug?.current || design._id}`;

  return generateProductMetadata({
    title: design.title,
    description: design.description || `${design.title} - Exquisite handcrafted jewelry piece.`,
    image: design.image,
    url,
  });
}

export default async function DesignDetailPage({ params }: PageProps) {
  const design = await getDesign(params.slug);
  
  if (!design) {
    notFound();
  }

  const relatedDesigns = design.category 
    ? await getRelatedDesigns(design.category, design._id, 4)
    : [];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const productSchema = generateProductSchema(design);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Designs', url: `${baseUrl}/designs` },
    ...(design.category ? [{ name: formatCategoryName(design.category), url: `${baseUrl}/designs?category=${design.category}` }] : []),
    { name: design.title, url: `${baseUrl}/designs/${design.slug?.current || design._id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="bg-[#faf8f5] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="mb-6 sm:mb-8 text-xs sm:text-sm" aria-label="Breadcrumb">
            <Link href="/" className="text-[#6a6a6a] hover:text-[#2a2a2a]">Home</Link>
            <span className="mx-2 text-[#918c87]">/</span>
            <Link href="/designs" className="text-[#6a6a6a] hover:text-[#2a2a2a]">Designs</Link>
            {design.category && (
              <>
                <span className="mx-2 text-[#918c87]">/</span>
                <Link 
                  href={`/designs?category=${design.category}`}
                  className="text-[#6a6a6a] hover:text-[#2a2a2a]"
                >
                  {formatCategoryName(design.category)}
                </Link>
              </>
            )}
            <span className="mx-2 text-[#918c87]">/</span>
            <span className="text-[#2a2a2a]">{design.title}</span>
          </nav>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-12 sm:mb-14 md:mb-16">
          {/* Product Image */}
          <ScrollReveal delay={0.1}>
            {design.image && (
              <ProductImage3D 
                image={design.image}
                alt={design.image?.alt || design.title}
                priority
              />
            )}
          </ScrollReveal>

          {/* Product Details */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <h1 className="font-section-heading text-left text-[#2a2a2a] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {design.title}
            </h1>
            
            {design.material && (
              <p className="text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
                {design.material}
              </p>
            )}

            {design.description && (
              <p className="text-[#6a6a6a] text-body-base sm:text-body-lg leading-relaxed">
                {design.description}
              </p>
            )}

            {design.price && (
              <p className="text-[#2a2a2a] text-2xl sm:text-3xl md:text-4xl font-bold font-playfair">
                {formatPrice(design.price)}
              </p>
            )}

            {(() => {
              const stockStatus = getStockStatus(design.inStock);
              return (
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
                  <span className={`${stockStatus.color} text-body-sm sm:text-body-base font-medium`} aria-label={stockStatus.ariaLabel}>
                    {stockStatus.text}
                  </span>
                </div>
              );
            })()}

            {design.category && (
              <div className="text-sm sm:text-base">
                <span className="text-[#2a2a2a] text-body-sm sm:text-body-base font-medium">Category: </span>
                <Link
                  href={`/designs?category=${design.category}`}
                  className="text-[#6a6a6a] hover:text-[#2a2a2a]"
                >
                  {formatCategoryName(design.category)}
                </Link>
              </div>
            )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6">
                  {(() => {
                    const stockStatus = getStockStatus(design.inStock);
                    return (
                      <Button 
                        className="w-full sm:flex-1 min-h-[44px]"
                        disabled={!stockStatus.available}
                        aria-label={stockStatus.available 
                          ? `Add ${design.title} to cart` 
                          : `${design.title} is out of stock`}
                        aria-disabled={!stockStatus.available}
                      >
                        {stockStatus.available ? 'ADD TO CART' : 'OUT OF STOCK'}
                      </Button>
                    );
                  })()}
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto min-h-[44px]"
                    aria-label={`Add ${design.title} to wishlist`}
                  >
                    WISHLIST
                  </Button>
                </div>
            </div>
          </ScrollReveal>
        </div>

            {/* Related Products */}
            {relatedDesigns.length > 0 && (
              <ScrollReveal delay={0.3}>
                <section className="mt-12 sm:mt-14 md:mt-16" aria-label="Related products">
                  <h2 className="font-section-heading text-center mb-8 sm:mb-10 md:mb-12">RELATED PRODUCTS</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {relatedDesigns.map((related, index) => (
                      <div key={related._id} className="bg-[#faf8f5] rounded-lg overflow-hidden border border-[#e8e5e0]">
                        <ProductCard design={related} variant="compact" index={index} />
                      </div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}
        </div>
      </div>
    </>
  );
}

