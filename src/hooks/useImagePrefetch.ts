import { useEffect, useRef, useCallback } from 'react';

/**
 * Prefetch images in the background for instant page transitions.
 * Uses requestIdleCallback for non-blocking prefetch after main content renders.
 * 
 * Inspired by Stripe/Linear/Vercel instant navigation patterns.
 */

// Global cache to track already prefetched images
const prefetchedImages = new Set<string>();

// Request idle callback polyfill
const requestIdleCallbackPolyfill = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

/**
 * Prefetch a single image
 */
function prefetchImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (prefetchedImages.has(src)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      prefetchedImages.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Prefetch multiple images with rate limiting to avoid network congestion
 */
async function prefetchImages(
  images: string[], 
  options: { batchSize?: number; delay?: number } = {}
): Promise<void> {
  const { batchSize = 3, delay = 50 } = options;
  
  // Filter out already prefetched images
  const imagesToPrefetch = images.filter(src => !prefetchedImages.has(src));
  
  if (imagesToPrefetch.length === 0) return;

  // Process in batches to avoid overwhelming the network
  for (let i = 0; i < imagesToPrefetch.length; i += batchSize) {
    const batch = imagesToPrefetch.slice(i, i + batchSize);
    
    await Promise.allSettled(batch.map(prefetchImage));
    
    // Small delay between batches
    if (i + batchSize < imagesToPrefetch.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Hook to prefetch images for the next page in a filter flow.
 * Automatically runs after the current page renders.
 * 
 * @param nextPageImages - Array of image URLs to prefetch
 * @param enabled - Whether prefetching is enabled (default: true)
 */
export function useImagePrefetch(
  nextPageImages: string[],
  enabled: boolean = true
): void {
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || nextPageImages.length === 0 || prefetchedRef.current) {
      return;
    }

    // Use requestIdleCallback to prefetch after main content renders
    const idleHandle = requestIdleCallbackPolyfill(() => {
      prefetchedRef.current = true;
      prefetchImages(nextPageImages, { batchSize: 4, delay: 100 });
    });

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle as number);
      }
    };
  }, [nextPageImages, enabled]);
}

/**
 * Hook that returns a prefetch function for manual triggering.
 * Useful for prefetching on hover or focus.
 */
export function usePrefetchImages() {
  const prefetch = useCallback((images: string[]) => {
    // Use requestIdleCallback for non-blocking prefetch
    requestIdleCallbackPolyfill(() => {
      prefetchImages(images, { batchSize: 4, delay: 50 });
    });
  }, []);

  return prefetch;
}

/**
 * Check if an image is already cached
 */
export function isImagePrefetched(src: string): boolean {
  return prefetchedImages.has(src);
}

/**
 * Clear the prefetch cache (useful for testing)
 */
export function clearPrefetchCache(): void {
  prefetchedImages.clear();
}
