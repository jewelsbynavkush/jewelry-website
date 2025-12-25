'use client';

import SmoothLink from '@/components/ui/SmoothLink';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerBgColor, setHeaderBgColor] = useState('var(--beige)');
  const [textColor, setTextColor] = useState('var(--text-on-beige)');
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    /**
     * Get computed background color of an element, traversing up the DOM tree if transparent
     */
    const getElementBackgroundColor = (element: HTMLElement): string | null => {
      const computedStyle = window.getComputedStyle(element);
      const bgColor = computedStyle.backgroundColor;
      
      const isTransparent = bgColor === 'rgba(0, 0, 0, 0)' || 
                          bgColor === 'transparent' || 
                          bgColor === 'rgba(0,0,0,0)';
      
      if (isTransparent && element.parentElement) {
        return getElementBackgroundColor(element.parentElement);
      }
      
      return bgColor;
    };

    /**
     * Check if color matches beige color scheme
     */
    const isBeigeColor = (color: string): boolean => {
      if (color.includes('#CCC4BA') || color.includes('#ccc4ba')) return true;
      if (color.includes('204, 196, 186') || color.includes('rgb(204,196,186)')) return true;
      
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        if (r >= 200 && r <= 210 && g >= 190 && g <= 200 && b >= 180 && b <= 190) {
          return true;
        }
      }
      return false;
    };

    /**
     * Check if color matches light cream color scheme
     */
    const isLightCreamColor = (color: string): boolean => {
      if (color.includes('#FAF8F5') || color.includes('#faf8f5')) return true;
      if (color.includes('250, 248, 245') || color.includes('rgb(250,248,245)')) return true;
      
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        if (r >= 248 && r <= 252 && g >= 246 && g <= 250 && b >= 243 && b <= 247) {
          return true;
        }
      }
      return false;
    };

    const handleScroll = () => {
      const headerHeight = 80;
      const checkY = headerHeight + 20;
      const centerX = window.innerWidth / 2;
      
      const elementBelow = document.elementFromPoint(centerX, checkY);
      
      if (elementBelow && elementBelow instanceof HTMLElement) {
        let currentElement: HTMLElement | null = elementBelow;
        let checkedElements = 0;
        const maxDepth = 10;
        
        while (currentElement && checkedElements < maxDepth) {
          const bgColor = getElementBackgroundColor(currentElement);
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            if (isBeigeColor(bgColor)) {
              setHeaderBgColor('var(--beige)');
              setTextColor('var(--text-on-beige)');
              return;
            } else if (isLightCreamColor(bgColor)) {
              setHeaderBgColor('var(--cream)');
              setTextColor('var(--text-on-cream)');
              return;
            }
          }
          
          currentElement = currentElement.parentElement;
          checkedElements++;
        }
      }
      
      const scrollY = window.scrollY;
      const viewportTop = scrollY + headerHeight;
      
      const allElements = document.querySelectorAll('section, main > div, [class*="bg-"]');
      
      for (const element of Array.from(allElements)) {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (viewportTop >= elementTop && viewportTop < elementBottom) {
            const bgColor = getElementBackgroundColor(element);
            
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
              if (isBeigeColor(bgColor)) {
                setHeaderBgColor('var(--beige)');
                setTextColor('var(--text-on-beige)');
                return;
              } else if (isLightCreamColor(bgColor)) {
                setHeaderBgColor('var(--cream)');
                setTextColor('var(--text-on-cream)');
                return;
              }
            }
          }
        }
      }
      
      const checkPoints = [
        { x: window.innerWidth / 2, y: checkY },
        { x: window.innerWidth / 4, y: checkY },
        { x: (window.innerWidth * 3) / 4, y: checkY },
      ];
      
      for (const point of checkPoints) {
        const element = document.elementFromPoint(point.x, point.y);
        if (element && element instanceof HTMLElement) {
          const bgColor = getElementBackgroundColor(element);
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            if (isBeigeColor(bgColor)) {
              setHeaderBgColor('var(--beige)');
              setTextColor('var(--text-on-beige)');
              return;
            } else if (isLightCreamColor(bgColor)) {
              setHeaderBgColor('var(--cream)');
              setTextColor('var(--text-on-cream)');
              return;
            }
          }
        }
      }
      
      setHeaderBgColor('var(--cream)');
      setTextColor('var(--text-on-cream)');
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    handleScroll();
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);
    
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  const categories = [
    { name: 'RINGS', slug: 'rings', href: '/designs?category=rings' },
    { name: 'EARRINGS', slug: 'earrings', href: '/designs?category=earrings' },
    { name: 'NECKLACES', slug: 'necklaces', href: '/designs?category=necklaces' },
    { name: 'BRACELETS', slug: 'bracelets', href: '/designs?category=bracelets' },
  ];

  return (
    <header 
      className="relative z-50"
      style={{ backgroundColor: headerBgColor }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between" style={{ color: textColor }}>
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 transition-colors p-2 -ml-2 sm:p-0 sm:ml-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            style={{ color: textColor }}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-nav text-xs sm:text-sm">MENU</span>
          </button>

          {/* Brand Name - Center (only on non-home pages) */}
          {!isHomePage && (
            <SmoothLink href="/" className="flex-1 text-center">
              <h1 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-playfair font-bold"
                style={{
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: textColor,
                }}
              >
                Jewels by NavKush
              </h1>
            </SmoothLink>
          )}

          {/* Right Icons: Cart and User */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SmoothLink
              href="/cart"
              className="transition-colors p-2 -mr-2 sm:p-0 sm:mr-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              style={{ color: textColor }}
              aria-label="Shopping cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </SmoothLink>
            <SmoothLink
              href="/profile"
              className="transition-colors p-2 sm:p-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              style={{ color: textColor }}
              aria-label="User profile"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </SmoothLink>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="mt-4 pb-4 border-t pt-4" 
            style={{ borderColor: textColor }}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <SmoothLink 
                href="/designs" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                ALL PRODUCTS
              </SmoothLink>
              {categories.map((category) => (
                <SmoothLink
                  key={category.slug}
                  href={category.href}
                  className="text-nav transition-colors"
                  style={{ color: textColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </SmoothLink>
              ))}
              <SmoothLink 
                href="/about" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT US
              </SmoothLink>
              <SmoothLink 
                href="/contact" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACT
              </SmoothLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
