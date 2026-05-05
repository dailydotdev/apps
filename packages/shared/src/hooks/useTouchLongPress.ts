import type { TouchEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

interface UseTouchLongPressOptions<T> {
  enabled: boolean;
  delayMs?: number;
  moveTolerancePx?: number;
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

export const useTouchLongPress = <T>({
  enabled,
  delayMs = DEFAULT_LONG_PRESS_DELAY_MS,
  moveTolerancePx = DEFAULT_MOVE_TOLERANCE_PX,
  onLongPress,
}: UseTouchLongPressOptions<T>): TouchLongPressHandlers<T> => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const cancelLongPress = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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

      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onLongPress(value);
      }, delayMs);
    },
    [cancelLongPress, delayMs, enabled, onLongPress],
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
