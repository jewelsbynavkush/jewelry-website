import { Metadata } from 'next';
import { getProduct, getRelatedProducts } from '@/lib/data/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import ProductImage3D from '@/components/ui/ProductImage3D';
import QuantitySelector from '@/components/ui/QuantitySelector';
import ProductBadge from '@/components/ui/ProductBadge';
import TrustBadges from '@/components/ui/TrustBadges';
import SocialShare from '@/components/ui/SocialShare';
import ProductSpecifications from '@/components/ui/ProductSpecifications';
import CareInstructions from '@/components/ui/CareInstructions';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { formatCategoryName } from '@/lib/utils/text-formatting';
import { formatPrice, getStockStatus } from '@/lib/utils/price-formatting';
import { getBaseUrl } from '@/lib/utils/env';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/designs/${product.slug}`;

  // Optimize description for SEO (ensure it's descriptive even if short)
  const productDescription = product.description 
    ? product.description.trim()
    : `${product.title} - Exquisite handcrafted jewelry piece. Discover our collection of unique, beautifully designed jewelry.`;

  // Generate product-specific keywords
  const keywords = [
    product.title,
    product.category ? formatCategoryName(product.category) : '',
    product.material || '',
    'jewelry',
    'handcrafted jewelry',
    'luxury jewelry',
    'fine jewelry',
    'gemstones',
    'precious metals',
    product.category ? `${formatCategoryName(product.category)} jewelry` : '',
  ].filter(Boolean); // Remove empty strings

  return generateProductMetadata({
    title: product.title,
    description: productDescription,
    image: product.image,
    url,
    keywords,
  });
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = product.category 
    ? await getRelatedProducts(product.category, product.id, 4)
    : [];

  const baseUrl = getBaseUrl();
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Designs', url: `${baseUrl}/designs` },
    ...(product.category ? [{ name: formatCategoryName(product.category), url: `${baseUrl}/designs?category=${product.category}` }] : []),
    { name: product.title, url: `${baseUrl}/designs/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <div className="bg-[var(--cream)]">
      <div className="section-container section-padding">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="standard-mb-small text-xs sm:text-sm" aria-label="Breadcrumb">
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)]">Home</Link>
            <span className="mx-2 text-[var(--text-muted)]">/</span>
            <Link href="/designs" className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)]">Designs</Link>
            {product.category && (
              <>
                <span className="mx-2 text-[var(--text-muted)]">/</span>
                <Link 
                  href={`/designs?category=${product.category}`}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)]"
                >
                  {formatCategoryName(product.category)}
                </Link>
              </>
            )}
            <span className="mx-2 text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-on-cream)]">{product.title}</span>
          </nav>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 standard-gap section-padding-small">
          {/* Product Image */}
          <ScrollReveal delay={0.1}>
            {product.image && (
              <ProductImage3D 
                image={product.image}
                alt={product.alt || product.title}
                priority
              />
            )}
          </ScrollReveal>

          {/* Product Details */}
          <ScrollReveal delay={0.2}>
            <div className="standard-space-y">
            {/* Product Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {product.featured && <ProductBadge type="featured" />}
              {product.mostLoved && <ProductBadge type="mostLoved" />}
              {(() => {
                const createdAt = new Date(product.createdAt).getTime();
                const now = new Date().getTime();
                const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
                if (daysSinceCreation < 30) {
                  return <ProductBadge type="new" />;
                }
                return null;
              })()}
              {product.inStock === false && <ProductBadge type="outOfStock" />}
            </div>

            <h1 className="font-playfair font-bold text-left text-[var(--text-on-cream)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-wider">
              {product.title}
            </h1>
            
            {product.material && (
              <p className="text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
                {product.material}
              </p>
            )}

            {product.price && (
              <p className="text-[var(--text-on-cream)] text-2xl sm:text-3xl md:text-4xl font-bold font-playfair">
                {formatPrice(product.price)}
              </p>
            )}

            {(() => {
              const stockStatus = getStockStatus(product.inStock);
              return (
                <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border touch-target ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
                  <span className={`${stockStatus.color} text-body-sm sm:text-body-base font-medium`} aria-label={stockStatus.ariaLabel}>
                    {stockStatus.text}
                  </span>
                </div>
              );
            })()}

            {product.description && (
              <p className="text-[var(--text-secondary)] text-body-base sm:text-body-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity Selector and Add to Cart */}
            {(() => {
              const stockStatus = getStockStatus(product.inStock);
              return (
                <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-5 md:pt-6">
                  {stockStatus.available && (
                    <div>
                      <label className="block text-[var(--text-on-cream)] text-body-sm sm:text-body-base font-medium mb-2">
                        Quantity
                      </label>
                      <QuantitySelector
                        min={1}
                        max={10}
                        defaultValue={1}
                        disabled={!stockStatus.available}
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button 
                      className="w-full sm:flex-1 min-h-[44px]"
                      disabled={!stockStatus.available}
                      aria-label={stockStatus.available 
                        ? `Add ${product.title} to cart` 
                        : `${product.title} is out of stock`}
                      aria-disabled={!stockStatus.available}
                    >
                      {stockStatus.available ? 'ADD TO CART' : 'OUT OF STOCK'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto min-h-[44px]"
                      aria-label={`Add ${product.title} to wishlist`}
                    >
                      WISHLIST
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Trust Badges */}
            <TrustBadges />

            {/* Social Sharing */}
            <SocialShare
              url={`/designs/${product.slug}`}
              title={product.title}
              description={product.description}
              image={product.image}
            />

            {/* Product Specifications */}
            <ProductSpecifications product={product} />
            </div>
          </ScrollReveal>
        </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <ScrollReveal delay={0.3} key={`related-${product.id}`}>
                <section className="standard-mt" aria-label="Related products">
                  <h2 className="font-section-heading text-center standard-mb">RELATED PRODUCTS</h2>
                  <div 
                    className="responsive-grid-4 container-content"
                    role="list"
                    aria-label="Related products"
                  >
                    {relatedProducts.map((related, index) => (
                      <div key={related.id} role="listitem">
                        <ProductCard product={related} variant="compact" index={index} />
                      </div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Care Instructions */}
            <ScrollReveal delay={0.4}>
              <CareInstructions />
            </ScrollReveal>
        </div>
      </div>
    </>
  );
}

