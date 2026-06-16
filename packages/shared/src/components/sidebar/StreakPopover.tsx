import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { RootPortal } from '../tooltips/Portal';
import { ReadingStreakPopup } from '../streak/popup/ReadingStreakPopup';
import type { UserStreak } from '../../graphql/users';

type StreakPopoverProps = {
  streak: UserStreak;
  triggerRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  // 'bottom' drops below the trigger (panel/header usage). 'right' opens
  // beside the trigger and anchors to its bottom edge so it grows upward —
  // used by the rail cluster, which sits near the viewport bottom. 'top'
  // opens above the trigger, right-aligned — for the floating corner HUD.
  placement?: 'bottom' | 'right' | 'top';
};

// Manually positioned portal popover: read the trigger's bounding rect
// and render the panel via a body-level portal. This keeps the popover
// stable (no Tippy auto-flip surprises inside the sidebar's transform /
// overflow context) and ensures it always drops from the streak button as
// expected.
export const StreakPopover = ({
  streak,
  triggerRef,
  onClose,
  placement = 'bottom',
}: StreakPopoverProps): ReactElement | null => {
  const [position, setPosition] = useState<{
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    if (placement === 'right') {
      setPosition({
        left: rect.right + 8,
        bottom: window.innerHeight - rect.bottom,
      });
      return;
    }
    if (placement === 'top') {
      setPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
      return;
    }
    setPosition({ top: rect.bottom + 8, left: rect.left });
  }, [placement, triggerRef]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !popoverRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  if (!position) {
    return null;
  }

  return (
    <RootPortal>
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Reading streak"
        className="fixed z-tooltip overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-accent-pepper-subtlest text-text-primary shadow-3 typo-callout"
        style={{
          top: position.top,
          left: position.left,
          bottom: position.bottom,
          right: position.right,
        }}
      >
        <ReadingStreakPopup streak={streak} />
      </div>
    </RootPortal>
  );
};
