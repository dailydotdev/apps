import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';
import { useVisualViewport } from './useVisualViewport';

// Less than this is browser chrome resizing, not a keyboard.
const keyboardThreshold = 120;

const isEditing = (): boolean =>
  !!document.activeElement?.matches?.(
    'input, textarea, [contenteditable="true"]',
  );

// Phone browsers don't resize the page for the keyboard: they scroll it
// under the keyboard instead, which takes the shell's top block off screen
// and leaves a composer floating mid-page. While the keyboard is up the
// element is sized to end where the visible area ends and the page is held
// at the top, so a header stays put and a composer sits on the keyboard.
// Returns that height, or undefined while there is no keyboard.
export const useKeyboardFit = (
  ref: RefObject<HTMLElement>,
  enabled: boolean,
): number | undefined => {
  const viewport = useVisualViewport(enabled);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const visibleHeight = viewport.height ?? 0;
    const isKeyboardOpen =
      enabled &&
      !!visibleHeight &&
      Math.abs((viewport.scale ?? 1) - 1) <= 0.01 &&
      document.documentElement.clientHeight - visibleHeight >=
        keyboardThreshold &&
      isEditing();

    if (!isKeyboardOpen) {
      setHeight(undefined);
      return;
    }
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    // In layout coordinates the visible area ends at offsetTop + height:
    // if the browser keeps a pan the scroll can't undo, the element still
    // ends on the keyboard instead of leaving a gap above it.
    const visibleBottom = (viewport.offsetTop ?? 0) + visibleHeight;
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    setHeight(Math.max(0, Math.round(visibleBottom - top)));
  }, [enabled, ref, viewport]);

  return height;
};
