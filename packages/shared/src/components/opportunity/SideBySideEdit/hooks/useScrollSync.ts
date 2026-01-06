import { useCallback, useRef } from 'react';

/**
 * Section types that can be targeted for scroll sync.
 */
export type ScrollSyncSection =
  | 'roleInfo'
  | 'overview'
  | 'responsibilities'
  | 'requirements'
  | 'whatYoullDo'
  | 'interviewProcess'
  | 'company'
  | 'recruiter';

export interface UseScrollSyncOptions {
  /**
   * Selector or ref for the preview container.
   * If not provided, will search for element by ID.
   */
  containerSelector?: string;
  /**
   * Offset from top when scrolling (e.g., for fixed header).
   */
  offset?: number;
  /**
   * Scroll behavior ('smooth' | 'instant').
   */
  behavior?: ScrollBehavior;
}

export interface UseScrollSyncReturn {
  /**
   * Scroll the preview to a specific section.
   */
  scrollToSection: (section: ScrollSyncSection) => void;
  /**
   * Handler to attach to section focus/click events.
   */
  handleSectionFocus: (section: ScrollSyncSection) => () => void;
}

/**
 * Hook for synchronizing scroll position between edit panel and preview.
 *
 * When the user focuses or clicks on a section in the edit panel,
 * the corresponding section in the preview scrolls into view.
 */
export function useScrollSync({
  containerSelector,
  offset = 20,
  behavior = 'smooth',
}: UseScrollSyncOptions = {}): UseScrollSyncReturn {
  const lastScrolledRef = useRef<string | null>(null);

  const scrollToSection = useCallback(
    (section: ScrollSyncSection) => {
      // Prevent rapid re-scrolling to the same section
      if (lastScrolledRef.current === section) {
        return;
      }

      const targetId = `job-preview-${section}`;
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        return;
      }

      // Find the scroll container - either by selector or find the preview panel
      let container: Element | null = null;
      if (containerSelector) {
        container = document.querySelector(containerSelector);
      }

      if (container) {
        // Scroll within container
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollTop =
          container.scrollTop + (targetRect.top - containerRect.top) - offset;

        container.scrollTo({
          top: scrollTop,
          behavior,
        });
      } else {
        // Fallback: use scrollIntoView
        targetElement.scrollIntoView({
          behavior,
          block: 'start',
        });
      }

      lastScrolledRef.current = section;

      // Reset after a short delay to allow re-scrolling to the same section
      setTimeout(() => {
        lastScrolledRef.current = null;
      }, 500);
    },
    [containerSelector, offset, behavior],
  );

  const handleSectionFocus = useCallback(
    (section: ScrollSyncSection) => () => {
      scrollToSection(section);
    },
    [scrollToSection],
  );

  return {
    scrollToSection,
    handleSectionFocus,
  };
}

export default useScrollSync;
