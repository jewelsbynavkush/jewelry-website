'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, MouseEvent, ComponentPropsWithoutRef } from 'react';
import { motion } from 'framer-motion';
import { isAnchorLink, getAnchorId } from '@/lib/utils/smooth-scroll';
import { ANIMATION_PRESETS } from '@/lib/animations/constants';
import { cn } from '@/lib/utils/cn';

interface SmoothLinkProps extends Omit<LinkProps, 'href'>, Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  href: string;
  children: ReactNode;
  scroll?: boolean;
  animated?: boolean;
}

/**
 * Enhanced Link component with smooth scrolling and optional animations
 */
export default function SmoothLink({
  href,
  children,
  scroll = true,
  onClick,
  animated = true,
  className = '',
  ...props
}: SmoothLinkProps) {
  const pathname = usePathname();
  
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    if (scroll) {
      const isSamePage = pathname === href || (isAnchorLink(href) && pathname === '/');
      
      if (isSamePage && isAnchorLink(href)) {
        e.preventDefault();
        const anchorId = getAnchorId(href);
        if (anchorId) {
          const element = document.getElementById(anchorId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  };

  if (!animated) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        scroll={scroll}
        className={cn(className, 'cursor-pointer')}
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <motion.div
      whileHover={ANIMATION_PRESETS.LINK_HOVER}
      whileTap={ANIMATION_PRESETS.TAP}
      className="inline-block"
    >
      <Link
        href={href}
        onClick={handleClick}
        scroll={scroll}
        className={cn(className, 'cursor-pointer')}
        {...props}
      >
        {children}
      </Link>
    </motion.div>
  );
}

