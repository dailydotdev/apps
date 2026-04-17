import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { BottomSheetSnap } from './hooks/useBottomSheetDrag';
import { useBottomSheetDrag } from './hooks/useBottomSheetDrag';

type ReaderBottomSheetProps = {
  snapPoints?: Record<BottomSheetSnap, number>;
  defaultSnap?: BottomSheetSnap;
  snap?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
  children: ReactNode;
  handleAriaLabel?: string;
  className?: string;
  contentClassName?: string;
  header?: ReactNode;
};

const DEFAULT_SNAP_POINTS: Record<BottomSheetSnap, number> = {
  peek: 35,
  half: 12,
  full: 2,
};

export function ReaderBottomSheet({
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnap = 'peek',
  snap: controlledSnap,
  onSnapChange,
  children,
  handleAriaLabel = 'Drag to resize discussion panel',
  className,
  contentClassName,
  header,
}: ReaderBottomSheetProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    snap,
    dragOffsetPx,
    isDragging,
    setSnap,
    onPointerDown,
    currentTopVh,
  } = useBottomSheetDrag({
    snapPoints,
    defaultSnap,
    controlledSnap,
    onSnapChange,
  });

  useEffect(() => {
    if (snap !== 'full' && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [snap]);

  const onHandleClick = () => {
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

  const onHandleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
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

  const transform = `translateY(calc(${currentTopVh}vh + ${dragOffsetPx}px))`;

  return (
    <div
      className={classNames(
        'z-30 pointer-events-none absolute inset-0',
        className,
      )}
      aria-hidden={false}
    >
      <div
        className={classNames(
          'pointer-events-auto absolute inset-x-0 bottom-0 top-0 flex flex-col rounded-t-16 border border-border-subtlest-tertiary bg-background-default shadow-2',
          !isDragging && 'transition-transform duration-300 ease-in-out',
        )}
        style={{ transform }}
        role="dialog"
        aria-modal="false"
        aria-label="Post discussion"
      >
        <div className="relative flex flex-col">
          <button
            type="button"
            className="flex w-full cursor-grab items-center justify-center py-2 active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onClick={onHandleClick}
            onKeyDown={onHandleKeyDown}
            aria-label={handleAriaLabel}
            aria-expanded={snap !== 'peek'}
          >
            <span className="h-1 w-10 rounded-full bg-border-subtlest-primary" />
          </button>
          {header}
        </div>
        <div
          ref={scrollRef}
          className={classNames(
            'flex-1 overflow-y-auto overscroll-contain',
            snap !== 'full' && 'overflow-y-hidden',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
