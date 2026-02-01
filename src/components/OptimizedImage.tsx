import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  objectPosition?: string;
  onLoad?: () => void;
  /** Disable LQIP blur effect (useful for small icons) */
  disableBlur?: boolean;
}

/**
 * OptimizedImage component with LQIP (Low Quality Image Placeholder):
 * - Shows blurred placeholder immediately
 * - Smooth transition from blur to clear (300ms)
 * - Native lazy loading (loading="lazy")
 * - Optimized decoding (decoding="async")
 * 
 * Inspired by Stripe/Linear/Vercel loading patterns
 */
export function OptimizedImage({
  src,
  alt,
  className,
  style,
  objectPosition,
  onLoad,
  disableBlur = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBlur, setShowBlur] = useState(!disableBlur);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if the image is already cached/loaded
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
      setShowBlur(false);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    // Delay removing blur slightly for smoother transition
    setTimeout(() => {
      setShowBlur(false);
    }, 50);
    onLoad?.();
  };

  const imageStyles: React.CSSProperties = {
    ...style,
    objectPosition: objectPosition || style?.objectPosition,
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Blur placeholder layer - shows immediately with blur effect */}
      {!disableBlur && (
        <div
          className={cn(
            "absolute inset-0 z-10 transition-opacity duration-300 ease-out",
            !showBlur && "opacity-0 pointer-events-none"
          )}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: objectPosition || 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)', // Prevent blur edges from showing
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Main high-quality image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          "relative z-0 transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={imageStyles}
      />
    </div>
  );
}
