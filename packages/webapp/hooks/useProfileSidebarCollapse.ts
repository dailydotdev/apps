import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

const COLLAPSE_BREAKPOINT = 1360;

/**
 * Auto-collapses sidebar on profile pages when screen is below 1360px
 * Requirements:
 * 1. Resize big→small: open sidebar collapses, closed sidebar stays closed
 * 2. Manual toggle in small screen: opens as overlay without glitches
 * 3. Refresh in small screen: sidebar always collapses (even if user opened it)
 */
export const useProfileSidebarCollapse = () => {
  const { sidebarExpanded, toggleSidebarExpanded, loadedSettings } = useSettingsContext();
  // Ref needed for resize handler to avoid stale closures
  const sidebarExpandedRef = useRef(sidebarExpanded);

  // Keep ref in sync with current sidebar state
  useEffect(() => {
    sidebarExpandedRef.current = sidebarExpanded;
  }, [sidebarExpanded]);

  // Handle resize from big to small
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${COLLAPSE_BREAKPOINT - 1}px)`);

    const handleBreakpointChange = (e: MediaQueryListEvent) => {
      if (e.matches && sidebarExpandedRef.current) {
        toggleSidebarExpanded();
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);
    return () => mediaQuery.removeEventListener('change', handleBreakpointChange);
  }, [toggleSidebarExpanded]);
};
