import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type BottomSheetSnap = 'peek' | 'half' | 'full';

type Point = {
  x: number;
  y: number;
};

type UseBottomSheetDragParams = {
  snapPoints: Record<BottomSheetSnap, number>;
  defaultSnap?: BottomSheetSnap;
  controlledSnap?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
};

type UseBottomSheetDragResult = {
  snap: BottomSheetSnap;
  dragOffsetPx: number;
  isDragging: boolean;
  setSnap: (snap: BottomSheetSnap) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  currentTopVh: number;
};

const SWIPE_VELOCITY_THRESHOLD = 0.4;
const TAP_DISTANCE_PX = 6;

const orderedSnaps: BottomSheetSnap[] = ['peek', 'half', 'full'];

function resolveNextSnap(
  snapPoints: Record<BottomSheetSnap, number>,
  currentSnap: BottomSheetSnap,
  dragOffsetPx: number,
  viewportHeight: number,
  velocityPxPerMs: number,
): BottomSheetSnap {
  const currentTopVh = snapPoints[currentSnap];
  const currentTopPx = (currentTopVh / 100) * viewportHeight;
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

  let closest: BottomSheetSnap = currentSnap;
  let closestDistance = Infinity;
  orderedSnaps.forEach((candidate) => {
    const candidateTopPx = (snapPoints[candidate] / 100) * viewportHeight;
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
}: UseBottomSheetDragParams): UseBottomSheetDragResult {
  const [internalSnap, setInternalSnap] =
    useState<BottomSheetSnap>(defaultSnap);
  const snap = controlledSnap ?? internalSnap;
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPointRef = useRef<Point | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const startTsRef = useRef<number>(0);
  const pointerIdRef = useRef<number | null>(null);

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
        return;
      }
      const totalDelta = event.clientY - start.y;
      const isTap = Math.abs(totalDelta) < TAP_DISTANCE_PX;
      if (isTap) {
        setDragOffsetPx(0);
        return;
      }
      const durationMs = Math.max(1, performance.now() - startTsRef.current);
      const velocityPxPerMs = totalDelta / durationMs;
      const viewportHeight = globalThis?.window?.innerHeight ?? 1;
      const nextSnap = resolveNextSnap(
        snapPoints,
        snap,
        totalDelta,
        viewportHeight,
        velocityPxPerMs,
      );
      setDragOffsetPx(0);
      setSnap(nextSnap);
    },
    [setSnap, snap, snapPoints],
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

  const currentTopVh = snapPoints[snap];

  return useMemo(
    () => ({
      snap,
      dragOffsetPx,
      isDragging,
      setSnap,
      onPointerDown,
      currentTopVh,
    }),
    [currentTopVh, dragOffsetPx, isDragging, onPointerDown, setSnap, snap],
  );
}
