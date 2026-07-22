import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';

export interface TextSelectionRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface UseTextSelectionShareProps {
  /** Only selections that both start and end inside this element count. */
  containerRef: RefObject<HTMLElement>;
  /**
   * When false no listeners are attached at all, so a disabled experiment costs
   * nothing and leaves the page byte-for-byte identical to the control.
   */
  enabled?: boolean;
}

export interface UseTextSelectionShare {
  /** The trimmed selected text, or null when there is no usable selection. */
  text: string | null;
  /** Viewport-space rect of the selection, for anchoring a fixed element. */
  rect: TextSelectionRect | null;
  clear: () => void;
}

// Single-word accidental selections (double-clicking a link, tapping a word)
// are noise — require enough text for a quote to be worth sharing.
const MIN_SELECTION_LENGTH = 2;

const isInsideContainer = (
  node: Node | null,
  container: HTMLElement,
): boolean => {
  if (!node) {
    return false;
  }

  return container.contains(node);
};

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
 * Watches for a completed text selection inside `containerRef` and exposes the
 * selected text plus a viewport rect to anchor a floating bar to. The rect is
 * recomputed on scroll/resize so the bar follows the selection.
 */
export const useTextSelectionShare = ({
  containerRef,
  enabled = true,
}: UseTextSelectionShareProps): UseTextSelectionShare => {
  const [text, setText] = useState<string | null>(null);
  const [rect, setRect] = useState<TextSelectionRect | null>(null);
  const rangeRef = useRef<Range | null>(null);

  const clear = useCallback(() => {
    rangeRef.current = null;
    setText(null);
    setRect(null);
  }, []);

  const readSelection = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      clear();
      return;
    }

    const selection = globalThis?.window?.getSelection?.();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      clear();
      return;
    }

    const selected = selection.toString().trim();

    if (selected.length < MIN_SELECTION_LENGTH) {
      clear();
      return;
    }

    if (
      !isInsideContainer(selection.anchorNode, container) ||
      !isInsideContainer(selection.focusNode, container)
    ) {
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
  }, [clear, containerRef]);

  const target = enabled ? globalThis?.document : null;

  // Selection *end* — mouse release, touch release, or a shift+arrow keyup.
  useEventListener(target, 'mouseup', readSelection);
  useEventListener(target, 'touchend', readSelection);
  useEventListener(target, 'keyup', readSelection);

  // A click elsewhere collapses the selection without firing another mouseup on
  // the container, so drop the bar as soon as the browser reports it collapsed.
  useEventListener(target, 'selectionchange', () => {
    const selection = globalThis?.window?.getSelection?.();

    if (!selection || selection.isCollapsed) {
      clear();
    }
  });

  const followTarget = enabled && rect ? globalThis?.window : null;

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

  return { text, rect, clear };
};
