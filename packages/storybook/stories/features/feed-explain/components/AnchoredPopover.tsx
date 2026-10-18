import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface AnchoredPopoverProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
}

const gutter = 16;
const gap = 8;

/**
 * A small dialog pinned to its trigger. Portaled, so card overlays with
 * overflow hidden don't clip it; it flips above the trigger near the bottom
 * of the screen.
 */
export const AnchoredPopover = ({
  anchor,
  onClose,
  children,
  label,
  className,
}: AnchoredPopoverProps): ReactElement | null => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>();

  useLayoutEffect(() => {
    if (!anchor) {
      return undefined;
    }
    const place = () => {
      const popover = ref.current;
      if (!popover) {
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const { width, height } = popover.getBoundingClientRect();
      const below = rect.bottom + gap;
      const top =
        below + height > window.innerHeight - gutter && rect.top - gap > height
          ? rect.top - gap - height
          : below;
      const left = Math.min(
        Math.max(gutter, rect.left),
        window.innerWidth - width - gutter,
      );
      setPosition({ top, left });
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current?.contains(target) && !anchor.contains(target)) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        anchor.focus();
      }
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anchor, onClose]);

  if (!anchor) {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      style={position}
      className={classNames(
        'fixed z-modal flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2',
        !position && 'invisible',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
};
