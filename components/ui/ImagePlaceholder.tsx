import { cn } from '@/lib/utils/cn';

interface ImagePlaceholderProps {
  text?: string;
  className?: string;
  bgColor?: string;
}

/**
 * Reusable Image Placeholder component
 * Automatically selects text color based on background (cream = dark text, beige = white text)
 */
export default function ImagePlaceholder({ 
  text = 'No image', 
  className = '',
  bgColor = 'var(--cream)'
}: ImagePlaceholderProps) {
  const isCreamBackground = bgColor === 'var(--cream)' || bgColor.includes('cream');
  const textColor = isCreamBackground 
    ? 'text-[var(--text-on-cream)]' 
    : 'text-[var(--text-on-beige)]';
  
  return (
    <div 
      className={cn('w-full h-full flex items-center justify-center', className)}
      style={{ backgroundColor: bgColor }}
    >
      <p className={`${textColor} text-body-sm opacity-50`}>{text}</p>
    </div>
  );
}


