import { Metadata } from 'next';
import { getProduct, getRelatedProducts } from '@/lib/data/products';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import ProductImage3D from '@/components/ui/ProductImage3D';
import ProductBadge from '@/components/ui/ProductBadge';
import TrustBadges from '@/components/ui/TrustBadges';
import SocialShare from '@/components/ui/SocialShare';
import ProductSpecifications from '@/components/ui/ProductSpecifications';
import CareInstructions from '@/components/ui/CareInstructions';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ProductActions from '@/components/ui/ProductActions';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
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
  const productDescription = product.description 
    ? product.description.trim()
    : `${product.title} - Exquisite handcrafted jewelry piece. Discover our collection of unique, beautifully designed jewelry.`;
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
          <Breadcrumbs
            items={[
              { name: 'Home', href: baseUrl },
              { name: 'Designs', href: `${baseUrl}/designs` },
              ...(product.category ? [{ name: formatCategoryName(product.category), href: `${baseUrl}/designs?category=${product.category}` }] : []),
              { name: product.title, href: `${baseUrl}/designs/${product.slug}` },
            ]}
          />
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
                {formatPrice(product.price, { currencyCode: product.currency || 'INR' })}
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

            {/* Product Actions: Quantity, Add to Cart, Wishlist */}
            <ProductActions product={product} />

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
                    {relatedProducts.map((related) => (
                      <div key={related.id} role="listitem">
                        <ProductCard product={related} variant="compact" />
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

