interface ImagePlaceholderProps {
  text?: string;
  className?: string;
  bgColor?: string;
}

/**
 * Reusable Image Placeholder component
 */
export default function ImagePlaceholder({ 
  text = 'No image', 
  className = '',
  bgColor = '#f5f1eb'
}: ImagePlaceholderProps) {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-white text-body-sm opacity-50">{text}</p>
    </div>
  );
}

