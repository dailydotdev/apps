import { useCallback, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';

export interface TextSelectionRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface UseTextSelectionShareProps {
  /**
   * Maps a selection boundary to the registered region that owns it, or null
   * when the boundary falls outside every watched region. A selection counts
   * only when both ends resolve to the *same* region, so a drag that starts in
   * a post and ends in a comment belongs to neither.
   */
  resolveArea: (node: Node | null) => HTMLElement | null;
}

export interface UseTextSelectionShare {
  /** The trimmed selected text, or null when there is no usable selection. */
  text: string | null;
  /** Viewport-space rect of the selection, for anchoring a fixed element. */
  rect: TextSelectionRect | null;
  /** The region the selection sits in, for the caller to attribute it. */
  area: HTMLElement | null;
  clear: () => void;
}

// Two characters, not two words: enough to drop a stray click-drag without
// second-guessing someone who genuinely wants to quote one short word.
const MIN_SELECTION_LENGTH = 2;

// Keys that can move a selection boundary. Every other keystroke — typing in
// the composer the bar just opened, for instance — leaves the selection alone,
// so there is nothing to re-read.
const SELECTION_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'a',
  'A',
]);

const toRect = (range: Range): TextSelectionRect | null => {
  const { top, bottom, left, right, width, height } =
    range.getBoundingClientRect();

  // A range that collapsed or scrolled into a display:none ancestor reports an
  // all-zero rect; anchoring to it would pin the bar to the top-left corner.
  if (!width && !height) {
    return null;
  }

  return { top, bottom, left, right };
};

/**
 * Watches for a completed text selection inside any registered region and
 * exposes the selected text, a viewport rect to anchor a floating bar to, and
 * the region that owns it. The rect is recomputed on scroll/resize so the bar
 * follows the selection.
 *
 * One instance is meant to serve a whole page: mounting it per item would put
 * four document listeners on every comment in a thread.
 */
export const useTextSelectionShare = ({
  resolveArea,
}: UseTextSelectionShareProps): UseTextSelectionShare => {
  const [text, setText] = useState<string | null>(null);
  const [rect, setRect] = useState<TextSelectionRect | null>(null);
  const [area, setArea] = useState<HTMLElement | null>(null);
  const rangeRef = useRef<Range | null>(null);

  const clear = useCallback(() => {
    rangeRef.current = null;
    setText(null);
    setRect(null);
    setArea(null);
  }, []);

  const readSelection = useCallback(() => {
    const selection = globalThis?.window?.getSelection?.();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      clear();
      return;
    }

    const owner = resolveArea(selection.anchorNode);

    // Resolve before reading the string: `toString()` is O(selection length)
    // and most selections on a page are outside any watched region.
    if (!owner || resolveArea(selection.focusNode) !== owner) {
      clear();
      return;
    }

    const selected = selection.toString().trim();

    if (selected.length < MIN_SELECTION_LENGTH) {
      clear();
      return;
    }

    const range = selection.getRangeAt(0);
    const nextRect = toRect(range);

    if (!nextRect) {
      clear();
      return;
    }

    rangeRef.current = range;
    setText(selected);
    setRect(nextRect);
    setArea(owner);
  }, [clear, resolveArea]);

  const target = globalThis?.document;

  // Selection *end* — mouse release, touch release, or a keyboard selection.
  useEventListener(target, 'mouseup', readSelection);
  useEventListener(target, 'touchend', readSelection);
  useEventListener(target, 'keyup', (event: KeyboardEvent) => {
    if (SELECTION_KEYS.has(event.key)) {
      readSelection();
    }
  });

  // A click elsewhere collapses the selection without firing another mouseup on
  // the container, so drop the bar as soon as the browser reports it collapsed.
  useEventListener(target, 'selectionchange', () => {
    const selection = globalThis?.window?.getSelection?.();

    if (!selection || selection.isCollapsed) {
      clear();
    }
  });

  const followTarget = rect ? globalThis?.window : null;

  const follow = useCallback(() => {
    if (!rangeRef.current) {
      return;
    }

    const nextRect = toRect(rangeRef.current);

    if (!nextRect) {
      clear();
      return;
    }

    setRect(nextRect);
  }, [clear]);

  useEventListener(followTarget, 'scroll', follow, true);
  useEventListener(followTarget, 'resize', follow);

  return { text, rect, area, clear };
};
