import { useEffect } from 'react';

const preloadImage = (url: string) => {
  const img = new Image();
  img.src = url;
};

/**
 * Preloads images in the background during browser idle time.
 * Uses requestIdleCallback to avoid blocking critical rendering.
 */
export function useImagePreloader(urls: string[]): void {
  useEffect(() => {
    const load = () => urls.forEach(preloadImage);

    // Use requestIdleCallback if available, otherwise setTimeout as fallback
    if (typeof requestIdleCallback !== 'undefined') {
      const handle = requestIdleCallback(load);
      return () => {
        cancelIdleCallback(handle);
      };
    }

    const handle = setTimeout(load, 1);
    return () => {
      clearTimeout(handle);
    };
  }, [urls]);
}
