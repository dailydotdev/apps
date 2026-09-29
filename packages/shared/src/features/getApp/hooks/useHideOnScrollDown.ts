import { useEffect, useState } from 'react';

// Near the top the bar always shows; past that, a scroll down hides it and
// any scroll up brings it back, so Log in never needs a trip to the top
// (where iOS Chrome turns the overscroll into a reload).
const alwaysShownDepth = 56;
const minScrollDelta = 6;

export const useHideOnScrollDown = (enabled: boolean): boolean => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;

      if (y <= alwaysShownDepth) {
        setIsHidden(false);
        lastY = y;
        return;
      }

      if (Math.abs(delta) < minScrollDelta) {
        return;
      }

      setIsHidden(delta > 0);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return enabled && isHidden;
};
