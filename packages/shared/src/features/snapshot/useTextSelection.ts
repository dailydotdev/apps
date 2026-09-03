import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

export interface TextSelection {
  text: string;
  /** Viewport coordinates, so a fixed toolbar can use them unchanged. */
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/** Under this a selection is a stray double-click, not a quote worth sharing. */
export const MIN_SELECTION_LENGTH = 24;

/** How long the selection has to hold still before the toolbar commits to it. */
const SETTLE_MS = 150;

const read = (container: HTMLElement | null): TextSelection | null => {
  const selection = globalThis.getSelection?.();

  if (!container || !selection || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString().trim();

  if (text.length < MIN_SELECTION_LENGTH || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  const rect = range.getBoundingClientRect();

  if (!rect.width && !rect.height) {
    return null;
  }

  return {
    text,
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
  };
};

/**
 * The current selection, but only while it lives inside `containerRef` — a
 * quote from the post body, never from the comments or the nav around it.
 */
export function useTextSelection(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean,
  /** Pointer presses inside this element leave the selection alone, so the
      toolbar built on top of it can be clicked. */
  ignoreRef?: RefObject<HTMLElement>,
): TextSelection | null {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const sync = useCallback(
    () => setSelection(read(containerRef.current)),
    [containerRef],
  );

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return undefined;
    }

    let settle: ReturnType<typeof setTimeout>;

    // The range grows on every mouse move and a toolbar that chases it is
    // unusable, so the trailing edge of the drag is the one that counts. A
    // timer rather than a drag flag: a pointerup can be lost to a pointer
    // released outside the window, and a flag left raised would strand the
    // toolbar for the rest of the page's life.
    const onSelectionChange = () => {
      clearTimeout(settle);
      settle = setTimeout(sync, SETTLE_MS);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (ignoreRef?.current?.contains(event.target as Node)) {
        return;
      }

      setSelection(null);
    };
    const onPointerUp = () => {
      clearTimeout(settle);
      sync();
    };

    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    globalThis.addEventListener('scroll', sync, { passive: true });
    globalThis.addEventListener('resize', sync);

    return () => {
      clearTimeout(settle);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
      globalThis.removeEventListener('scroll', sync);
      globalThis.removeEventListener('resize', sync);
    };
  }, [enabled, ignoreRef, sync]);

  return selection;
}
