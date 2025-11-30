import ScrollReveal from '@/components/ui/ScrollReveal';
import { getSiteSettings } from '@/lib/cms/queries';

interface SiteSettings {
  mostLovedTitle?: string;
  mostLovedSlogan?: string;
}

export default async function MostLovedHeading() {
  const settings = await getSiteSettings<SiteSettings>();
  
  return (
    <ScrollReveal>
      <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20">
        <h2 className="font-section-heading text-center">
          {settings.mostLovedTitle || 'OUR MOST LOVED CREATIONS'}
        </h2>
        {settings.mostLovedSlogan && (
          <p className="text-center text-[#6a6a6a] text-body-sm sm:text-body-base mt-4">
            {settings.mostLovedSlogan}
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}

