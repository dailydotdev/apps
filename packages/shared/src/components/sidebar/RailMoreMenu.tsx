import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { MenuIcon } from '../icons';
import { IconSize } from '../Icon';
import { railTabClass, railTabLabelClass } from './common';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { RootPortal } from '../tooltips/Portal';
import { useAnchoredRailPopup } from './useAnchoredRailPopup';

// A rail "More" item: a three-dots + label button that opens a click dropdown
// with the exact same chrome, placement and behavior as the Support/Settings
// popups and the shortcuts customize tray. Used when the rail is too short to
// show the tabs inline — the dropdown then holds the tabs (and a Shortcuts
// category). Shares the rail popup group so it's mutually exclusive with the
// other rail popups.
export const RailMoreMenu = ({
  label = 'More',
  compact = false,
  children,
}: {
  label?: string;
  compact?: boolean;
  children: ReactNode;
}): ReactElement => {
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup('sidebar-rail');
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useOutsideClick(popupRef, () => onUpdate(false), isOpen);
  const pos = useAnchoredRailPopup(btnRef, isOpen);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={wrapHandler(() => onUpdate(!isOpen))}
        className={classNames(
          railTabClass,
          'active:scale-95',
          isOpen && 'bg-surface-hover !text-text-primary',
        )}
      >
        <span className="relative flex items-center justify-center">
          <MenuIcon size={IconSize.Small} aria-hidden className="rotate-90" />
        </span>
        {!compact && <span className={railTabLabelClass}>{label}</span>}
      </button>
      {isOpen && pos && (
        <RootPortal>
          <div
            ref={popupRef}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxHeight,
            }}
            // Same placement/chrome as the Support/Settings popups and the
            // customize tray: fixed at left-20 ml-2 (same X + gap), w-72.
            className="animate-rail-popup-in no-scrollbar fixed left-20 z-popup ml-2 flex w-72 flex-col gap-1 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-2 shadow-2"
          >
            {children}
          </div>
        </RootPortal>
      )}
    </>
  );
};
