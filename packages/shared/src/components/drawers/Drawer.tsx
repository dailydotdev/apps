import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';
import { RootPortal } from '../tooltips/Portal';
import useDebounce from '../../hooks/useDebounce';

export enum DrawerPosition {
  Bottom = 'bottom',
  Top = 'top',
}

interface ClassName {
  overlay?: string;
  drawer?: string;
}

export interface DrawerProps {
  children: ReactNode;
  className?: ClassName;
  position?: DrawerPosition;
  closeOnOutsideClick?: boolean;
  onClose(): void;
}

const drawerPositionToClassName: Record<DrawerPosition, string> = {
  [DrawerPosition.Bottom]: 'bottom-0 rounded-t-16',
  [DrawerPosition.Top]: 'top-0 rounded-b-16',
};

const animatePositionClassName: Record<DrawerPosition, string> = {
  [DrawerPosition.Bottom]: 'translate-y-full',
  [DrawerPosition.Top]: '-translate-y-full',
};

export function Drawer({
  children,
  className = {},
  position = DrawerPosition.Bottom,
  closeOnOutsideClick = true,
  onClose,
}: DrawerProps): ReactElement {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animate] = useDebounce(() => setHasAnimated(true), 1);

  useEffect(() => {
    if (!hasAnimated) {
      animate();
    }
  }, [animate, hasAnimated]);

  return (
    <RootPortal>
      <div
        className={classNames(
          'first: fixed inset-0 z-max bg-overlay-quaternary-onion',
          className?.overlay,
        )}
        onClick={closeOnOutsideClick && onClose}
        role="presentation"
      >
        <div
          className={classNames(
            'absolute flex flex-col overflow-y-auto bg-theme-bg-primary px-4 py-3 transition-transform duration-200 ease-in-out',
            !hasAnimated && animatePositionClassName[position],
            drawerPositionToClassName[position],
            className?.drawer,
            'max-h-[calc(100vh-5rem)] w-full',
          )}
        >
          {children}
        </div>
      </div>
    </RootPortal>
  );
}
