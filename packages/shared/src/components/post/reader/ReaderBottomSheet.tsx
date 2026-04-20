import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import type {
  BottomSheetSnap,
  BottomSheetSnapPoint,
} from './hooks/useBottomSheetDrag';
import { useBottomSheetDrag } from './hooks/useBottomSheetDrag';

type ReaderBottomSheetProps = {
  snapPoints?: Record<BottomSheetSnap, BottomSheetSnapPoint>;
  defaultSnap?: BottomSheetSnap;
  snap?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
  /** Distance from top of the overlay container to the sheet top edge (for anchoring floating UI). */
  onGeometryChange?: (sheetTopPx: number) => void;
  children: ReactNode;
  handleAriaLabel?: string;
  className?: string;
  contentClassName?: string;
};

const DEFAULT_SNAP_POINTS: Record<BottomSheetSnap, BottomSheetSnapPoint> = {
  peek: { px: 72 },
  half: 40,
  full: 0,
};

export function ReaderBottomSheet({
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnap = 'peek',
  snap: controlledSnap,
  onSnapChange,
  onGeometryChange,
  children,
  handleAriaLabel = 'Drag to resize discussion panel',
  className,
  contentClassName,
}: ReaderBottomSheetProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suppressNextHandleClickRef = useRef(false);

  const onPointerGestureEnd = useCallback(
    ({ didDrag }: { didDrag: boolean }) => {
      if (didDrag) {
        suppressNextHandleClickRef.current = true;
      }
    },
    [],
  );

  const {
    snap,
    dragOffsetPx,
    isDragging,
    setSnap,
    onPointerDown,
    currentTopPx,
  } = useBottomSheetDrag({
    snapPoints,
    defaultSnap,
    controlledSnap,
    onSnapChange,
    onPointerGestureEnd,
  });

  const sheetTopPx = currentTopPx + dragOffsetPx;

  useLayoutEffect(() => {
    onGeometryChange?.(sheetTopPx);
  }, [onGeometryChange, sheetTopPx]);

  useEffect(() => {
    if (snap !== 'peek' || !scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = 0;
  }, [snap]);

  const onHandleClick = () => {
    if (suppressNextHandleClickRef.current) {
      suppressNextHandleClickRef.current = false;
      return;
    }
    if (snap === 'peek') {
      setSnap('half');
      return;
    }
    if (snap === 'half') {
      setSnap('full');
      return;
    }
    setSnap('peek');
  };

  const onHandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (snap === 'peek') {
        setSnap('half');
        return;
      }
      if (snap === 'half') {
        setSnap('full');
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (snap === 'full') {
        setSnap('half');
        return;
      }
      if (snap === 'half') {
        setSnap('peek');
      }
      return;
    }
    if (event.key === 'Escape' && snap !== 'peek') {
      event.preventDefault();
      setSnap('peek');
    }
  };

  return (
    <div
      className={classNames(
        'z-30 absolute inset-x-0 bottom-0 flex min-h-0 flex-col overflow-hidden rounded-t-20 border border-border-subtlest-tertiary bg-background-default shadow-3',
        !isDragging && 'transition-[top] duration-300 ease-in-out',
        className,
      )}
      style={{
        top: `${sheetTopPx}px`,
      }}
      role="dialog"
      aria-modal="false"
      aria-label="Post discussion"
    >
      <button
        type="button"
        className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center bg-background-default pb-2 pt-2.5 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onClick={onHandleClick}
        onKeyDown={onHandleKeyDown}
        aria-label={handleAriaLabel}
        aria-expanded={snap !== 'peek'}
      >
        <span
          className="pointer-events-none h-1 w-9 shrink-0 rounded-full bg-border-subtlest-primary opacity-50"
          aria-hidden
        />
      </button>
      <div
        ref={scrollRef}
        className={classNames(
          'min-h-0 flex-1 overscroll-contain',
          snap === 'peek' ? 'overflow-hidden' : 'overflow-y-auto',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
