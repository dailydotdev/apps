import { useEffect } from 'react';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

const COLLAPSE_BREAKPOINT = 1360;

/**
 * Collapses the sidebar on profile pages while the screen is below 1360px,
 * leaving the stored preference untouched
 * */

export const useProfileSidebarCollapse = (): void => {
  const { setSidebarForceCollapsed } = useSettingsContext();

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${COLLAPSE_BREAKPOINT - 1}px)`,
    );
    const handleBreakpointChange = (e: MediaQueryListEvent) =>
      setSidebarForceCollapsed(e.matches);

    setSidebarForceCollapsed(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange);
      setSidebarForceCollapsed(false);
    };
  }, [setSidebarForceCollapsed]);
};
