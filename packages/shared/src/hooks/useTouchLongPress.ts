import type { TouchEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

interface UseTouchLongPressOptions<T> {
  enabled: boolean;
  delayMs?: number;
  moveTolerancePx?: number;
  suppressTextSelection?: boolean;
  onLongPress: (value: T) => void;
}

export interface TouchLongPressHandlers<T> {
  onTouchStart: (event: TouchEvent, value: T) => void;
  onTouchEnd: () => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchCancel: () => void;
}

const DEFAULT_LONG_PRESS_DELAY_MS = 500;
const DEFAULT_MOVE_TOLERANCE_PX = 10;

const suppressDocumentTextSelection = (
  ownerDocument: Document,
): (() => void) => {
  const root = ownerDocument.documentElement;
  const previousUserSelect = root.style.userSelect;
  const previousWebkitUserSelect = root.style.getPropertyValue(
    '-webkit-user-select',
  );

  ownerDocument.defaultView?.getSelection()?.removeAllRanges();
  root.style.userSelect = 'none';
  root.style.setProperty('-webkit-user-select', 'none');

  return () => {
    ownerDocument.defaultView?.getSelection()?.removeAllRanges();
    root.style.userSelect = previousUserSelect;

    if (previousWebkitUserSelect) {
      root.style.setProperty('-webkit-user-select', previousWebkitUserSelect);
      return;
    }

    root.style.removeProperty('-webkit-user-select');
  };
};

export const useTouchLongPress = <T>({
  enabled,
  delayMs = DEFAULT_LONG_PRESS_DELAY_MS,
  moveTolerancePx = DEFAULT_MOVE_TOLERANCE_PX,
  suppressTextSelection = true,
  onLongPress,
}: UseTouchLongPressOptions<T>): TouchLongPressHandlers<T> => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const restoreTextSelectionRef = useRef<(() => void) | null>(null);

  const cancelLongPress = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    restoreTextSelectionRef.current?.();
    restoreTextSelectionRef.current = null;
    startPosRef.current = null;
  }, []);

  useEffect(() => cancelLongPress, [cancelLongPress]);

  useEffect(() => {
    if (!enabled) {
      cancelLongPress();
    }
  }, [cancelLongPress, enabled]);

  const onTouchStart = useCallback(
    (event: TouchEvent, value: T): void => {
      cancelLongPress();
      if (!enabled) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const { ownerDocument } = event.currentTarget;
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      if (suppressTextSelection) {
        restoreTextSelectionRef.current =
          suppressDocumentTextSelection(ownerDocument);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        ownerDocument.defaultView?.getSelection()?.removeAllRanges();
        onLongPress(value);
      }, delayMs);
    },
    [cancelLongPress, delayMs, enabled, onLongPress, suppressTextSelection],
  );

  const onTouchMove = useCallback(
    (event: TouchEvent): void => {
      if (!startPosRef.current) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const dx = Math.abs(touch.clientX - startPosRef.current.x);
      const dy = Math.abs(touch.clientY - startPosRef.current.y);
      if (dx > moveTolerancePx || dy > moveTolerancePx) {
        cancelLongPress();
      }
    },
    [cancelLongPress, moveTolerancePx],
  );

  return {
    onTouchStart,
    onTouchEnd: cancelLongPress,
    onTouchMove,
    onTouchCancel: cancelLongPress,
  };
};
