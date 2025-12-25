'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, MouseEvent, ComponentPropsWithoutRef } from 'react';
import { isAnchorLink, getAnchorId } from '@/lib/utils/smooth-scroll';

interface SmoothLinkProps extends Omit<LinkProps, 'href'>, Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  href: string;
  children: ReactNode;
  scroll?: boolean;
}

/**
 * Enhanced Link component with smooth scrolling for anchor links
 */
export default function SmoothLink({
  href,
  children,
  scroll = true,
  onClick,
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
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      scroll={scroll}
      {...props}
    >
      {children}
    </Link>
  );
}

