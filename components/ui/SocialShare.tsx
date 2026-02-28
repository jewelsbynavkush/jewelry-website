'use client';

import SocialButton from './SocialButton';
import { cn } from '@/lib/utils/cn';
import { getBaseUrl } from '@/lib/utils/env';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

/**
 * Social sharing component for product pages
 * E-commerce best practice: Enable easy social sharing
 */
export default function SocialShare({
  url,
  title,
  description,
  image,
  className = '',
}: SocialShareProps) {
  const getBaseUrlForShare = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    try {
      return getBaseUrl();
    } catch {
      return 'https://jewelsbynavkush.com';
    }
  };
  const baseUrl = getBaseUrlForShare();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const shareText = encodeURIComponent(`${title}${description ? ` - ${description}` : ''}`);
  const shareUrl = encodeURIComponent(fullUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    pinterest: image
      ? `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${encodeURIComponent(image.startsWith('http') ? image : `${baseUrl}${image}`)}&description=${shareText}`
      : `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareText}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${description || ''}\n\n${fullUrl}`)}`,
  };

  return (
    <div className={cn('flex items-center gap-3 sm:gap-4', className)}>
      <span className="text-[var(--text-secondary)] text-body-sm sm:text-body-base font-medium">
        Share:
      </span>
      <div className="flex items-center gap-2">
        <SocialButton href={shareLinks.facebook} ariaLabel="Share on Facebook">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </SocialButton>
        <SocialButton href={shareLinks.twitter} ariaLabel="Share on Twitter">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        </SocialButton>
        <SocialButton href={shareLinks.pinterest} ariaLabel="Share on Pinterest">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
          </svg>
        </SocialButton>
        <SocialButton href={shareLinks.email} ariaLabel="Share via email" external={false}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </SocialButton>
      </div>
    </div>
  );
}

