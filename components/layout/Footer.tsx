import Link from 'next/link';
import { getSiteSettings } from '@/lib/cms/queries';
import { CATEGORIES, FOOTER_LEFT_LINKS, FOOTER_RIGHT_LINKS, DEFAULTS } from '@/lib/constants';

interface FooterSettings {
  brandName?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
  };
}

export default async function Footer() {
  const settings = await getSiteSettings<FooterSettings>();

  return (
    <footer className="bg-[#CCC4BA] py-12 sm:py-16 md:py-20 lg:py-24 mt-auto" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top Section: Categories and Social Media */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-white/30">
          {/* Left: Category Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 md:gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-white text-category-link transition-colors hover:opacity-80"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex gap-3 sm:gap-4">
            {settings.socialLinks?.facebook && (
              <a 
                href={settings.socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Facebook page"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {settings.socialLinks?.instagram && (
              <a 
                href={settings.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Instagram page"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {settings.socialLinks?.pinterest && (
              <a 
                href={settings.socialLinks.pinterest} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit our Pinterest page"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12c5.084 0 9.426-3.163 11.192-7.637-.123-.55-.22-1.21.047-1.732.217-.45.7-2.38.7-2.38s.174-.35.174-.865c0-.81-.472-1.415-1.06-1.415-.558 0-.81.42-.81.988 0 .566.19 1.056.19 1.615 0 .566-.356 1.04-.83 1.04-.67 0-1.19-.69-1.19-1.68 0-1.28.93-2.5 2.7-2.5 1.45 0 2.41 1.08 2.41 2.51 0 1.45-.92 2.68-2.27 2.68-.444 0-.86-.23-1-.51 0 0-.22.86-.27 1.07-.1.38-.32 1.22-1.02 1.71-.766.5-1.81.77-2.52.93-.36.08-.7.13-1.02.13-1.2 0-2.37-.64-2.37-1.64 0-.38.15-.73.4-1.03.14-.15.32-.26.5-.35.1-.05.2-.09.3-.12.08-.02.16-.04.24-.06.06-.01.12-.02.18-.03.04-.01.08-.01.12-.02.08-.01.15-.02.23-.03.06-.01.12-.01.18-.02.12-.01.24-.02.36-.02.48 0 .96.07 1.41.2.45.13.87.32 1.24.57.37.25.68.55.93.9.25.35.43.74.54 1.16.11.42.16.87.16 1.33 0 .92-.21 1.79-.61 2.57-.4.78-.98 1.46-1.71 2.01-.73.55-1.6.96-2.55 1.2-.95.24-1.97.36-3.03.36-1.06 0-2.08-.12-3.03-.36-.95-.24-1.82-.65-2.55-1.2-.73-.55-1.31-1.23-1.71-2.01-.4-.78-.61-1.65-.61-2.57 0-.46.05-.91.16-1.33.11-.42.29-.81.54-1.16.25-.35.56-.65.93-.9.37-.25.79-.44 1.24-.57.45-.13.93-.2 1.41-.2.12 0 .24.01.36.02.06.01.12.01.18.02.08.01.15.02.23.03.04.01.08.01.12.02.06.01.12.02.18.03.08.02.16.04.24.06.1.03.2.07.3.12.18.09.36.2.5.35.25.3.4.65.4 1.03 0 1-.1.64-2.37 1.64z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Middle Section: Brand Name */}
        <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 border-b border-white/30">
          <h3 
            className="font-serif-brand text-white relative inline-block"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }}
          >
            {settings.brandName || DEFAULTS.brandName}
          </h3>
        </div>

        {/* Bottom Section: Company Links and Copyright */}
        <div className="pt-6 sm:pt-8 md:pt-10 lg:pt-12">
          {/* Links Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            {/* Left Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 md:gap-6">
              {FOOTER_LEFT_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-body-sm md:text-body-base transition-colors hover:opacity-80"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 md:gap-6">
              {FOOTER_RIGHT_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-body-sm md:text-body-base transition-colors hover:opacity-80"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-white text-body-sm">
              &copy; {new Date().getFullYear()} {settings.brandName || DEFAULTS.brandName} Jewelry. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
