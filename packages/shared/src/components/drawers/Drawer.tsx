import React, { ReactElement, ReactNode, useRef, useState } from 'react';
import classNames from 'classnames';
import useDebounce from '../../hooks/useDebounce';
import ConditionalWrapper from '../ConditionalWrapper';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';

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
  isClosing?: boolean;
  title?: string;
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
  isClosing = false,
  title,
  onClose,
}: DrawerProps): ReactElement {
  const container = useRef<HTMLDivElement>();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animate] = useDebounce(() => setHasAnimated(true), 1);
  const classes = className?.drawer ?? 'px-4 py-3';
  useOutsideClick(container, onClose, closeOnOutsideClick && hasAnimated);
  const isAnimating = !hasAnimated || isClosing;

  return (
    <div
      className={classNames(
        'fixed inset-0 z-max bg-overlay-quaternary-onion transition-opacity duration-300 ease-in-out',
        className?.overlay,
        isAnimating && 'opacity-0',
      )}
    >
      <div
        className={classNames(
          'absolute flex flex-col overflow-y-auto bg-theme-bg-primary transition-transform duration-300 ease-in-out',
          isAnimating && animatePositionClassName[position],
          drawerPositionToClassName[position],
          !title && classes,
          'max-h-[calc(100vh-5rem)] w-full',
        )}
        ref={(node) => {
          container.current = node;

          if (!node || hasAnimated) {
            return;
          }

          animate();
        }}
      >
        {title && (
          <h3 className="border-b border-theme-divider-tertiary p-4 font-bold typo-title3">
            {title}
          </h3>
        )}
        <ConditionalWrapper
          condition={!!title}
          wrapper={(component) => (
            <div className={classNames(classes, 'flex w-full flex-col')}>
              {component}
            </div>
          )}
        >
          {children}
        </ConditionalWrapper>
      </div>
    </div>
  );
}
