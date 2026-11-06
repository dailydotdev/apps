import { useEffect, useState } from 'react';
import {
  REVEAL_BOTTOM_PX,
  REVEAL_FALLBACK_MS,
  REVEAL_SHORT_PAGE_MS,
} from './commentsTeaser';

/**
 * X's reveal rule for its logged-out footer: false on load, true on the
 * first of one full screen scrolled, being within 168px of the end, a page
 * too short to scroll after 1.5s, or 5s whatever the reader does.
 */
export const useRevealOnEngagement = (enabled: boolean): boolean => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let shortPageTimer: ReturnType<typeof setTimeout> | undefined;
    let shortPageWaited = false;
    let shortPageArmed = false;
    let fallback: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      clearTimeout(shortPageTimer);
      clearTimeout(fallback);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      window.removeEventListener('scroll', check);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      window.removeEventListener('resize', check);
    };
    const reveal = () => {
      stop();
      setRevealed(true);
    };
    function check() {
      const { scrollHeight } = document.documentElement;
      const { innerHeight, scrollY } = window;
      if (scrollHeight - innerHeight <= REVEAL_BOTTOM_PX) {
        if (shortPageWaited) {
          reveal();
          return;
        }
        if (!shortPageArmed) {
          shortPageArmed = true;
          shortPageTimer = setTimeout(() => {
            shortPageWaited = true;
            check();
          }, REVEAL_SHORT_PAGE_MS);
        }
        return;
      }
      const scrolledAScreen = scrollY >= innerHeight;
      const nearEnd = scrollY + innerHeight >= scrollHeight - REVEAL_BOTTOM_PX;
      if (scrolledAScreen || nearEnd) {
        reveal();
      }
    }

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    fallback = setTimeout(reveal, REVEAL_FALLBACK_MS);
    check();

    return stop;
  }, [enabled]);

  return enabled && revealed;
};
