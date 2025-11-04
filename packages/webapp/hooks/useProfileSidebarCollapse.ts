import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

const COLLAPSE_BREAKPOINT = 1360;

/**
 * Auto-collapses sidebar on profile pages when screen is below 1360px
 * */

export const useProfileSidebarCollapse = () => {
  const { sidebarExpanded, toggleSidebarExpanded, loadedSettings } =
    useSettingsContext();
  // Refs to avoid stale closures and unnecessary effect re-runs
  const sidebarExpandedRef = useRef(sidebarExpanded);
  const toggleSidebarExpandedRef = useRef(toggleSidebarExpanded);

  // Keep refs in sync
  useEffect(() => {
    sidebarExpandedRef.current = sidebarExpanded;
    toggleSidebarExpandedRef.current = toggleSidebarExpanded;
  }, [sidebarExpanded, toggleSidebarExpanded]);

  // Auto-collapse on mount (runs once when settings load)
  useEffect(() => {
    if (!loadedSettings) {
      return;
    }

    const isSmallScreen = window.matchMedia(
      `(max-width: ${COLLAPSE_BREAKPOINT - 1}px)`,
    ).matches;

    if (isSmallScreen && sidebarExpanded) {
      toggleSidebarExpanded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedSettings]);

  // Handle resize from big to small (runs once on mount, listener persists)
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${COLLAPSE_BREAKPOINT - 1}px)`,
    );

    const handleBreakpointChange = (e: MediaQueryListEvent) => {
      // Use refs to access current values without re-creating listener
      if (e.matches && sidebarExpandedRef.current) {
        toggleSidebarExpandedRef.current();
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);
    return () =>
      mediaQuery.removeEventListener('change', handleBreakpointChange);
  }, []); // Empty deps = runs once, listener stays active
};
