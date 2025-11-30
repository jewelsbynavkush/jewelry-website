import IntroSection from '@/components/sections/IntroSection';
import ProductCategories from '@/components/sections/ProductCategories';
import MostLovedCreations from '@/components/sections/MostLovedCreations';
import AboutUs from '@/components/sections/AboutUs';
import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/cms/queries';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { urlFor } from '@/lib/cms/client';
import { SiteSettings } from '@/types/cms';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings<SiteSettings>();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  const title = settings.brandName 
    ? `${settings.brandName} - ${settings.tagline || 'Luxury Jewelry'}` 
    : 'Jewels by NavKush - Luxury Jewelry Store';
  
  const description = settings.heroDescription || 
    'Discover exquisite jewelry inspired by the beauty of the heavens. Each piece is crafted to bring elegance and grace to your most cherished occasions.';

  const imageUrl = settings.heroImage 
    ? urlFor(settings.heroImage).width(1200).height(630).url()
    : undefined;

  return generateStandardMetadata({
    title,
    description,
    image: imageUrl,
    url: baseUrl,
  });
}

export default async function HomePage() {
  return (
    <>
      <IntroSection />
      <AboutUs />
      <ProductCategories />
      <MostLovedCreations />
    </>
  );
}
