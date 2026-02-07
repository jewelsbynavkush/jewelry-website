import { getSiteSettings } from '@/lib/data/site-settings';
import { getCategories, transformCategoriesForUI } from '@/lib/data/categories';
import { DEFAULTS } from '@/lib/constants';
import IntroSectionClient from './IntroSectionClient';

export default async function IntroSection() {
  const settings = await getSiteSettings();
  const categories = await getCategories();
  const categoriesForUI = transformCategoriesForUI(categories);

  return (
    <IntroSectionClient
      brandName={settings.brand.name || DEFAULTS.brandName}
      heroTitle={settings.hero.title || DEFAULTS.heroTitle}
      heroDescription={settings.hero.description}
      heroButtonText={settings.hero.buttonText || DEFAULTS.heroButtonText}
      heroImage={settings.hero.image}
      heroImageAlt={settings.hero.alt}
      rightColumnSlogan={settings.intro.rightColumnSlogan || DEFAULTS.rightColumnSlogan}
      categories={categoriesForUI}
    />
  );
}
