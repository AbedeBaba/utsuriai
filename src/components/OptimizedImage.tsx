import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  objectPosition?: string;
  onLoad?: () => void;
}

/**
 * OptimizedImage component with:
 * - Native lazy loading (loading="lazy")
 * - Fade-in animation on load
 * - Optimized decoding (decoding="async")
 */
export function OptimizedImage({
  src,
  alt,
  className,
  style,
  objectPosition,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if the image is already cached/loaded
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      className={cn(
        "transition-opacity duration-500 ease-out",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        ...style,
        objectPosition: objectPosition || style?.objectPosition,
      }}
    />
  );
}
