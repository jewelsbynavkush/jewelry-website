'use client';

import SmoothLink from '@/components/ui/SmoothLink';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ANIMATION_PRESETS, SCALE, ROTATE, DURATION, STAGGER } from '@/lib/animations/constants';
import { useCartStore } from '@/lib/store/cart-store';
import UserMenu from './UserMenu';

export default function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerBgColor, setHeaderBgColor] = useState('var(--beige)');
  const [textColor, setTextColor] = useState('var(--text-on-beige)');
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { cart, fetchCart, isLoading } = useCartStore();
  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Fetch cart on mount to ensure cart count is displayed on initial page load
  useEffect(() => {
    if (!cart && !isLoading) {
      fetchCart();
    }
  }, [cart, isLoading, fetchCart]);

  useEffect(() => {
    /**
     * Gets computed background color of an element, traversing up the DOM tree if transparent
     * 
     * Recursively checks parent elements until a non-transparent background is found.
     * This ensures accurate color detection even when elements have transparent backgrounds.
     * 
     * @param element - HTML element to get background color from
     * @returns Background color string or null if all parents are transparent
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
     * Checks if color matches beige color scheme (#CCC4BA / rgb(204, 196, 186))
     * 
     * Validates color in multiple formats (hex, rgb) and checks RGB ranges
     * to handle slight variations in color representation.
     * 
     * @param color - Color string to check (hex or rgb format)
     * @returns True if color matches beige scheme, false otherwise
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
     * Checks if color matches light cream color scheme (#FAF8F5 / rgb(250, 248, 245))
     * 
     * Validates color in multiple formats (hex, rgb) and checks RGB ranges
     * to handle slight variations in color representation.
     * 
     * @param color - Color string to check (hex or rgb format)
     * @returns True if color matches cream scheme, false otherwise
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
      className="relative z-50 overflow-visible"
      style={{ backgroundColor: headerBgColor }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between" style={{ color: textColor }}>
          {/* Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-2 -ml-2 sm:p-0 sm:ml-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 cursor-pointer"
            style={{ 
              color: headerBgColor === 'var(--cream)' 
                ? 'var(--text-on-cream)' 
                : (textColor || 'var(--text-on-beige)')
            }}
            aria-label="Toggle menu"
            whileHover={ANIMATION_PRESETS.ICON_HOVER}
            whileTap={ANIMATION_PRESETS.ICON_TAP}
          >
            <motion.svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={isMenuOpen ? { rotate: ROTATE.MENU_OPEN } : { rotate: 0 }}
              transition={{ duration: DURATION.MENU }}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
            <motion.span 
              className="text-nav text-xs sm:text-sm font-semibold"
              whileHover={ANIMATION_PRESETS.LINK_HOVER}
            >
              MENU
            </motion.span>
          </motion.button>

          {/* Brand Name - Center (only on non-home pages) */}
          {!isHomePage && (
            <SmoothLink href="/" className="flex-1 text-center">
              <h1 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-playfair font-bold tracking-wide"
                style={{
                  color: textColor,
                }}
              >
                Jewels by NavKush
              </h1>
            </SmoothLink>
          )}

          {/* Right Icons: Cart and User */}
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              whileHover={ANIMATION_PRESETS.ICON_HOVER}
              whileTap={ANIMATION_PRESETS.ICON_TAP}
              className="flex items-center relative"
            >
              <SmoothLink
                href="/cart"
                className="transition-colors p-2 -mr-2 sm:p-0 sm:mr-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                style={{ color: textColor }}
                aria-label="Shopping cart"
              >
                <motion.svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: SCALE.HOVER }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </motion.svg>
              </SmoothLink>
              {/* Cart item count badge - positioned outside icon */}
              {cartItemCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 sm:px-1.5 flex items-center justify-center bg-[var(--active-dark)] text-[var(--text-on-beige)] text-[10px] sm:text-xs font-bold rounded-full shadow-lg z-20 pointer-events-none"
                  style={{ 
                    lineHeight: '1',
                    border: `2px solid ${headerBgColor === 'var(--cream)' ? 'var(--cream)' : 'var(--beige)'}`
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  aria-label={`${cartItemCount} items in cart`}
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.span>
              )}
            </motion.div>
            <UserMenu textColor={textColor} />
          </div>
        </div>

        {/* Mobile Menu */}
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
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: STAGGER.MENU_ITEMS * 2 }}
              >
                <SmoothLink 
                  href="/designs" 
                  className="text-nav transition-colors block"
                  style={{ color: textColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={ANIMATION_PRESETS.MENU_ITEM_HOVER.transition}
                  >
                    ALL PRODUCTS
                  </motion.span>
                </SmoothLink>
              </motion.div>
              {categories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: STAGGER.MENU_ITEMS * 3 + index * STAGGER.MENU_ITEMS }}
                >
                  <SmoothLink
                    href={category.href}
                    className="text-nav transition-colors block"
                    style={{ color: textColor }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      transition={ANIMATION_PRESETS.MENU_ITEM_HOVER.transition}
                    >
                      {category.name}
                    </motion.span>
                  </SmoothLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: STAGGER.MENU_ITEMS * 7 }}
              >
                <SmoothLink 
                  href="/about" 
                  className="text-nav transition-colors block"
                  style={{ color: textColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={ANIMATION_PRESETS.MENU_ITEM_HOVER.transition}
                  >
                    ABOUT US
                  </motion.span>
                </SmoothLink>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: STAGGER.MENU_ITEMS * 8 }}
              >
                <SmoothLink 
                  href="/contact" 
                  className="text-nav transition-colors block"
                  style={{ color: textColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={ANIMATION_PRESETS.MENU_ITEM_HOVER.transition}
                  >
                    CONTACT
                  </motion.span>
                </SmoothLink>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
