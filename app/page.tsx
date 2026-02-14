import IntroSection from '@/components/sections/IntroSection';
import ProductCategories from '@/components/sections/ProductCategories';
import MostLovedCreations from '@/components/sections/MostLovedCreations';
import AboutUs from '@/components/sections/AboutUs';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/data/site-settings';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { getBaseUrl } from '@/lib/utils/env';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const baseUrl = getBaseUrl();
  
  const title = settings.brand.name 
    ? `${settings.brand.name} - ${settings.brand.tagline || 'Luxury Jewelry'}` 
    : 'Jewels by NavKush - Luxury Jewelry Store';
  
  const description = settings.hero.description || 
    'Discover exquisite jewelry inspired by the beauty of the heavens. Each piece is crafted to bring elegance and grace to your most cherished occasions.';

  const imageUrl = settings.hero.image 
    ? `${baseUrl}${settings.hero.image}`
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
      <h1 className="sr-only">Jewels by NavKush - Exquisite Handcrafted Jewelry</h1>
      <IntroSection />
      <AboutUs />
      <ProductCategories />
      <MostLovedCreations />
    </>
  );
}
