import { useEffect } from 'react';
import { responsiveModalBreakpoint } from '../components/modals/ResponsiveModal';

export function useResetScrollForResponsiveModal(): void {
  useEffect(() => {
    const mediaQuery = window.matchMedia(responsiveModalBreakpoint);
    if (!mediaQuery.matches) {
      window.scrollTo(0, 0);
    }
  }, []);
}
