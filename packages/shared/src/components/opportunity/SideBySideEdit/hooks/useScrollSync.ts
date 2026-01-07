import { useCallback, useRef } from 'react';

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
  containerSelector?: string;
  offset?: number;
  behavior?: ScrollBehavior;
}

export interface UseScrollSyncReturn {
  scrollToSection: (section: ScrollSyncSection) => void;
  handleSectionFocus: (section: ScrollSyncSection) => () => void;
}

export function useScrollSync({
  containerSelector,
  offset = 20,
  behavior = 'smooth',
}: UseScrollSyncOptions = {}): UseScrollSyncReturn {
  const lastScrolledRef = useRef<string | null>(null);

  const scrollToSection = useCallback(
    (section: ScrollSyncSection) => {
      if (lastScrolledRef.current === section) {
        return;
      }

      const targetId = `job-preview-${section}`;
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        return;
      }

      let container: Element | null = null;
      if (containerSelector) {
        container = document.querySelector(containerSelector);
      }

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollTop =
          container.scrollTop + (targetRect.top - containerRect.top) - offset;

        container.scrollTo({
          top: scrollTop,
          behavior,
        });
      } else {
        targetElement.scrollIntoView({
          behavior,
          block: 'start',
        });
      }

      lastScrolledRef.current = section;
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
