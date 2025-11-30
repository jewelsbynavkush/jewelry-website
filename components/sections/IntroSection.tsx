import { getSiteSettings } from '@/lib/cms/queries';
import { DEFAULTS } from '@/lib/constants';
import IntroSectionClient from './IntroSectionClient';
import { SiteSettings } from '@/types/cms';

export default async function IntroSection() {
  const settings = await getSiteSettings<SiteSettings>();

  return (
    <IntroSectionClient
      brandName={settings.brandName || DEFAULTS.brandName}
      heroTitle={settings.heroTitle || DEFAULTS.heroTitle}
      heroDescription={settings.heroDescription}
      heroButtonText={settings.heroButtonText || DEFAULTS.heroButtonText}
      heroImage={settings.heroImage}
      rightColumnSlogan={settings.rightColumnSlogan || DEFAULTS.rightColumnSlogan}
    />
  );
}
