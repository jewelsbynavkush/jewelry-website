'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerBgColor, setHeaderBgColor] = useState('#CCC4BA');
  // Default to white since initial background is beige, will update on scroll
  const [textColor, setTextColor] = useState('rgb(255, 255, 255)');
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const getElementBackgroundColor = (element: HTMLElement): string | null => {
      const computedStyle = window.getComputedStyle(element);
      const bgColor = computedStyle.backgroundColor;
      
      // Check if background is transparent or rgba(0,0,0,0)
      const isTransparent = bgColor === 'rgba(0, 0, 0, 0)' || 
                          bgColor === 'transparent' || 
                          bgColor === 'rgba(0,0,0,0)';
      
      if (isTransparent && element.parentElement) {
        return getElementBackgroundColor(element.parentElement);
      }
      
      return bgColor;
    };

    const isBeigeColor = (color: string): boolean => {
      // Check for #CCC4BA or rgb(204, 196, 186)
      if (color.includes('#CCC4BA') || color.includes('#ccc4ba')) return true;
      if (color.includes('204, 196, 186') || color.includes('rgb(204,196,186)')) return true;
      
      // Extract RGB values and check
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        // Allow small variance for beige color
        if (r >= 200 && r <= 210 && g >= 190 && g <= 200 && b >= 180 && b <= 190) {
          return true;
        }
      }
      return false;
    };

    const isLightCreamColor = (color: string): boolean => {
      // Check for #faf8f5 or rgb(250, 248, 245)
      if (color.includes('#FAF8F5') || color.includes('#faf8f5')) return true;
      if (color.includes('250, 248, 245') || color.includes('rgb(250,248,245)')) return true;
      
      // Extract RGB values and check
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        // Allow small variance for light cream color
        if (r >= 248 && r <= 252 && g >= 246 && g <= 250 && b >= 243 && b <= 247) {
          return true;
        }
      }
      return false;
    };

    const handleScroll = () => {
      const headerHeight = 80;
      const checkY = headerHeight + 20; // Check a bit below header
      const centerX = window.innerWidth / 2;
      
      // Method 1: Check element directly below header
      const elementBelow = document.elementFromPoint(centerX, checkY);
      
      if (elementBelow && elementBelow instanceof HTMLElement) {
        let currentElement: HTMLElement | null = elementBelow;
        let checkedElements = 0;
        const maxDepth = 10; // Limit depth to avoid infinite loops
        
        while (currentElement && checkedElements < maxDepth) {
          const bgColor = getElementBackgroundColor(currentElement);
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            if (isBeigeColor(bgColor)) {
              setHeaderBgColor('#CCC4BA');
              setTextColor('rgb(255, 255, 255)');
              return;
            } else if (isLightCreamColor(bgColor)) {
              setHeaderBgColor('#faf8f5');
              setTextColor('rgb(42, 42, 42)');
              return;
            }
          }
          
          currentElement = currentElement.parentElement;
          checkedElements++;
        }
      }
      
      // Method 2: Check all sections and main content areas
      const scrollY = window.scrollY;
      const viewportTop = scrollY + headerHeight;
      
      // Get all sections and divs with background classes
      const allElements = document.querySelectorAll('section, main > div, [class*="bg-"]');
      
      for (const element of Array.from(allElements)) {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const elementBottom = elementTop + rect.height;
          
          // Check if this element is currently visible below the header
          if (viewportTop >= elementTop && viewportTop < elementBottom) {
            const bgColor = getElementBackgroundColor(element);
            
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
              if (isBeigeColor(bgColor)) {
                setHeaderBgColor('#CCC4BA');
                setTextColor('rgb(255, 255, 255)');
                return;
              } else if (isLightCreamColor(bgColor)) {
                setHeaderBgColor('#faf8f5');
                setTextColor('rgb(42, 42, 42)');
                return;
              }
            }
          }
        }
      }
      
      // Method 3: Check computed background from multiple points
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
              setHeaderBgColor('#CCC4BA');
              setTextColor('rgb(255, 255, 255)');
              return;
            } else if (isLightCreamColor(bgColor)) {
              setHeaderBgColor('#faf8f5');
              setTextColor('rgb(42, 42, 42)');
              return;
            }
          }
        }
      }
      
      // Default fallback
      setHeaderBgColor('#faf8f5');
      setTextColor('rgb(42, 42, 42)');
    };

    // Use requestAnimationFrame for smoother updates
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
    
    // Check immediately on mount and after a short delay to ensure DOM is ready
    handleScroll();
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);
    
    // Also check on resize
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
    <motion.header 
      className="sticky top-0 z-50"
      style={{ backgroundColor: headerBgColor }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between" style={{ color: textColor }}>
          {/* Menu Button - Larger touch target for mobile */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 transition-colors p-2 -ml-2 sm:p-0 sm:ml-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            style={{ color: textColor }}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-nav text-xs sm:text-sm">MENU</span>
          </motion.button>

          {/* Brand Name - Center (only on non-home pages) */}
          {!isHomePage && (
            <Link href="/" className="flex-1 text-center">
              <motion.h1 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-playfair font-bold"
                style={{
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: textColor,
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Jewels by NavKush
              </motion.h1>
            </Link>
          )}

          {/* Right Icons: Cart and User - Larger touch targets for mobile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href="/cart"
                className="transition-colors p-2 -mr-2 sm:p-0 sm:mr-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                style={{ color: textColor }}
                aria-label="Shopping cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href="/profile"
                className="transition-colors p-2 sm:p-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                style={{ color: textColor }}
                aria-label="User profile"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.nav 
                  id="mobile-menu"
                  className="mt-4 pb-4 border-t pt-4" 
                  style={{ borderColor: textColor }}
                  role="navigation"
                  aria-label="Main navigation"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <motion.div 
                    className="flex flex-col gap-3 sm:gap-4"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
              <Link 
                key={`all-products-${textColor}`}
                href="/designs" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                ALL PRODUCTS
              </Link>
              {categories.map((category) => (
                <Link
                  key={`${category.slug}-${textColor}`}
                  href={category.href}
                  className="text-nav transition-colors"
                  style={{ color: textColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                key={`about-${textColor}`}
                href="/about" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT US
              </Link>
              <Link 
                key={`contact-${textColor}`}
                href="/contact" 
                className="text-nav transition-colors"
                style={{ color: textColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACT
              </Link>
                  </motion.div>
                </motion.nav>
              )}
            </AnimatePresence>
      </div>
    </motion.header>
  );
}

