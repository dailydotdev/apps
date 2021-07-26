import { useEffect } from 'react';
import { mobileL } from '../styles/media';

export const responsiveModalBreakpoint = mobileL;

export function useResetScrollForResponsiveModal(): void {
  useEffect(() => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia(
        responsiveModalBreakpoint.replace('@media ', ''),
      );
      if (!mediaQuery.matches) {
        window.scroll(0, 0);
        document.querySelector('[role="dialog"]')?.scroll?.(0, 0);
      }
    }
  }, []);
}
