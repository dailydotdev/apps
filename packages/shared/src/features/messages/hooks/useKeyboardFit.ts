import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

// Less than this is browser chrome resizing, not a keyboard.
const keyboardThreshold = 120;

// Phone browsers don't resize the page for the keyboard: they scroll it
// under the keyboard instead, which takes the shell's top block off screen
// and leaves the composer floating mid-page. While the keyboard is up the
// screen is sized to what is still visible and the page is held at the top,
// so the header stays put and the composer sits on the keyboard.
export const useKeyboardFit = (
  ref: RefObject<HTMLElement>,
  enabled: boolean,
): number | undefined => {
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const viewport = globalThis.window?.visualViewport;
    if (!enabled || !viewport) {
      setHeight(undefined);
      return undefined;
    }

    const fit = () => {
      const layoutHeight = document.documentElement.clientHeight;
      if (layoutHeight - viewport.height < keyboardThreshold) {
        setHeight(undefined);
        return;
      }
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
      const top = ref.current?.getBoundingClientRect().top ?? 0;
      setHeight(Math.max(0, Math.round(viewport.height - top)));
    };

    fit();
    viewport.addEventListener('resize', fit);
    viewport.addEventListener('scroll', fit);
    return () => {
      viewport.removeEventListener('resize', fit);
      viewport.removeEventListener('scroll', fit);
    };
  }, [enabled, ref]);

  return height;
};
