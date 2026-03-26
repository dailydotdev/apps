import { useEffect } from 'react';

/**
 * Measures the native scrollbar width and sets it as a CSS custom property
 * `--scrollbar-width` on <html>. Used to compensate for layout shift when
 * modals hide body overflow and the scrollbar disappears.
 */
export function useScrollbarWidth(): void {
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        '--scrollbar-width',
        `${width}px`,
      );
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
}
