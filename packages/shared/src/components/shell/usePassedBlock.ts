import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

// True once the element has scrolled up behind the top block: a thing's
// name or its hero, so the block can take over what just left the screen.
export const usePassedBlock = (
  ref: RefObject<HTMLElement>,
  enabled = true,
): boolean => {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') {
      setPassed(false);
      return undefined;
    }

    const blockBottom =
      parseFloat(
        document.documentElement.style.getPropertyValue('--shell-top'),
      ) || 0;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setPassed(
          !entry.isIntersecting && entry.boundingClientRect.top < blockBottom,
        ),
      { rootMargin: `-${blockBottom}px 0px 0px 0px` },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, enabled]);

  return passed;
};
