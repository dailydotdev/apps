import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type BottomSheetSnap = 'peek' | 'half' | 'full';

/** vh from top of viewport, or fixed height from bottom in px (peek strip). */
export type BottomSheetSnapPoint = number | { px: number };

type Point = {
  x: number;
  y: number;
};

type UseBottomSheetDragParams = {
  snapPoints: Record<BottomSheetSnap, BottomSheetSnapPoint>;
  defaultSnap?: BottomSheetSnap;
  controlledSnap?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
  /** Fires after pointer up so UI can suppress accidental clicks after a drag. */
  onPointerGestureEnd?: (info: { didDrag: boolean }) => void;
};

type UseBottomSheetDragResult = {
  snap: BottomSheetSnap;
  dragOffsetPx: number;
  isDragging: boolean;
  setSnap: (snap: BottomSheetSnap) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  /** Distance from top of containing block to sheet top edge (before drag transform). */
  currentTopPx: number;
};

const SWIPE_VELOCITY_THRESHOLD = 0.4;
const TAP_DISTANCE_PX = 6;

const orderedSnaps: BottomSheetSnap[] = ['peek', 'half', 'full'];

export function snapPointToTopPx(
  snapPoint: BottomSheetSnapPoint,
  viewportHeight: number,
): number {
  if (typeof snapPoint === 'number') {
    return (snapPoint / 100) * viewportHeight;
  }
  return Math.max(0, viewportHeight - snapPoint.px);
}

function resolveNextSnap(
  snapPoints: Record<BottomSheetSnap, BottomSheetSnapPoint>,
  currentSnap: BottomSheetSnap,
  dragOffsetPx: number,
  viewportHeight: number,
  velocityPxPerMs: number,
): BottomSheetSnap {
  const currentTopPx = snapPointToTopPx(
    snapPoints[currentSnap],
    viewportHeight,
  );
  const projectedTopPx = currentTopPx + dragOffsetPx;

  if (Math.abs(velocityPxPerMs) >= SWIPE_VELOCITY_THRESHOLD) {
    const currentIndex = orderedSnaps.indexOf(currentSnap);
    const direction = velocityPxPerMs > 0 ? 1 : -1;
    const nextIndex = Math.max(
      0,
      Math.min(orderedSnaps.length - 1, currentIndex + direction),
    );
    return orderedSnaps[nextIndex];
  }

  const peekTopPx = snapPointToTopPx(snapPoints.peek, viewportHeight);
  const halfTopPx = snapPointToTopPx(snapPoints.half, viewportHeight);

  if (currentSnap === 'half' && dragOffsetPx > 0) {
    const midHalfPeek = (halfTopPx + peekTopPx) / 2;
    if (projectedTopPx >= midHalfPeek) {
      return 'peek';
    }
  }

  let closest: BottomSheetSnap = currentSnap;
  let closestDistance = Infinity;
  orderedSnaps.forEach((candidate) => {
    const candidateTopPx = snapPointToTopPx(
      snapPoints[candidate],
      viewportHeight,
    );
    const distance = Math.abs(candidateTopPx - projectedTopPx);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = candidate;
    }
  });
  return closest;
}

export function useBottomSheetDrag({
  snapPoints,
  defaultSnap = 'peek',
  controlledSnap,
  onSnapChange,
  onPointerGestureEnd,
}: UseBottomSheetDragParams): UseBottomSheetDragResult {
  const [internalSnap, setInternalSnap] =
    useState<BottomSheetSnap>(defaultSnap);
  const snap = controlledSnap ?? internalSnap;
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof globalThis.window !== 'undefined'
      ? globalThis.window.innerHeight
      : 0,
  );
  const startPointRef = useRef<Point | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const startTsRef = useRef<number>(0);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const onResize = (): void => {
      setViewportHeight(globalThis.window.innerHeight);
    };
    onResize();
    globalThis.window.addEventListener('resize', onResize);
    return () => {
      globalThis.window.removeEventListener('resize', onResize);
    };
  }, []);

  const setSnap = useCallback(
    (nextSnap: BottomSheetSnap) => {
      setInternalSnap((previous) => {
        if (previous === nextSnap && controlledSnap === undefined) {
          return previous;
        }
        return nextSnap;
      });
      onSnapChange?.(nextSnap);
    },
    [controlledSnap, onSnapChange],
  );

  const endDrag = useCallback(
    (event: PointerEvent) => {
      if (pointerIdRef.current === null) {
        return;
      }
      const start = startPointRef.current;
      const last = lastPointRef.current;
      pointerIdRef.current = null;
      startPointRef.current = null;
      lastPointRef.current = null;
      setIsDragging(false);
      if (!start || !last) {
        setDragOffsetPx(0);
        onPointerGestureEnd?.({ didDrag: false });
        return;
      }
      const totalDelta = event.clientY - start.y;
      const isTap = Math.abs(totalDelta) < TAP_DISTANCE_PX;
      if (isTap) {
        setDragOffsetPx(0);
        onPointerGestureEnd?.({ didDrag: false });
        return;
      }
      onPointerGestureEnd?.({ didDrag: true });
      const durationMs = Math.max(1, performance.now() - startTsRef.current);
      const velocityPxPerMs = totalDelta / durationMs;
      const vh = globalThis?.window?.innerHeight ?? 1;
      const nextSnap = resolveNextSnap(
        snapPoints,
        snap,
        totalDelta,
        vh,
        velocityPxPerMs,
      );
      setDragOffsetPx(0);
      setSnap(nextSnap);
    },
    [onPointerGestureEnd, setSnap, snap, snapPoints],
  );

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }
    const handleMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      const start = startPointRef.current;
      if (!start) {
        return;
      }
      lastPointRef.current = { x: event.clientX, y: event.clientY };
      const delta = event.clientY - start.y;
      setDragOffsetPx(delta);
    };
    const handleUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      endDrag(event);
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [endDrag, isDragging]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerIdRef.current = event.pointerId;
    startPointRef.current = { x: event.clientX, y: event.clientY };
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    startTsRef.current = performance.now();
    setIsDragging(true);
  }, []);

  const safeViewportHeight = viewportHeight > 0 ? viewportHeight : 1;
  const currentTopPx = snapPointToTopPx(snapPoints[snap], safeViewportHeight);

  return useMemo(
    () => ({
      snap,
      dragOffsetPx,
      isDragging,
      setSnap,
      onPointerDown,
      currentTopPx,
    }),
    [currentTopPx, dragOffsetPx, isDragging, onPointerDown, setSnap, snap],
  );
}
