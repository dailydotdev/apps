import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import Portal from './Portal';
import { useSettingsContext } from '../../contexts/SettingsContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import ConditionalWrapper from '../ConditionalWrapper';

export enum InteractivePopupPosition {
  Center = 'center',
  CenterStart = 'centerStart',
  CenterEnd = 'centerEnd',
  RightStart = 'rightStart',
  RightCenter = 'rightCenter',
  RightEnd = 'rightEnd',
  LeftStart = 'leftStart',
  LeftCenter = 'leftCenter',
  LeftEnd = 'leftEnd',
  Screen = 'screen',
}

interface InteractivePopupProps {
  children: ReactNode;
  className?: string;
  position?: InteractivePopupPosition;
}

const centerClassX = 'left-1/2 -translate-x-1/2';
const centerClassY = 'top-1/2 -translate-y-1/2';
const startClass = 'top-16';
const endClass = 'bottom-8';
const rightClass = 'right-8';
const leftClass = 'left-64';

const positionClass: Record<InteractivePopupPosition, string> = {
  center: classNames(centerClassX, centerClassY),
  centerStart: classNames(centerClassX, startClass),
  centerEnd: classNames(centerClassX, endClass),
  rightStart: classNames(rightClass, startClass),
  rightCenter: classNames(rightClass, centerClassY),
  rightEnd: classNames(rightClass, endClass),
  leftStart: classNames(leftClass, startClass),
  leftCenter: classNames(leftClass, centerClassY),
  leftEnd: classNames(leftClass, endClass),
  screen: 'inset-0 w-screen h-screen',
};

const leftPositions = [
  InteractivePopupPosition.LeftEnd,
  InteractivePopupPosition.LeftCenter,
  InteractivePopupPosition.LeftEnd,
];

function InteractivePopup({
  children,
  className,
  position = InteractivePopupPosition.Center,
  ...props
}: InteractivePopupProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { sidebarExpanded } = useSettingsContext();
  const finalPosition = sidebarRendered
    ? position
    : InteractivePopupPosition.Center;
  const classes = positionClass[finalPosition];

  return (
    <Portal>
      <ConditionalWrapper
        condition={!sidebarRendered}
        wrapper={(child) => (
          <div className="flex fixed inset-0 z-modal flex-col items-center bg-overlay-quaternary-onion">
            {child}
          </div>
        )}
      >
        <div
          className={classNames(
            'fixed z-popup bg-theme-bg-primary rounded-16 overflow-hidden shadow-2',
            className,
            classes,
            !sidebarRendered && 'shadow-2',
            leftPositions.includes(finalPosition) &&
              !sidebarExpanded &&
              'laptop:left-16',
          )}
          {...props}
        >
          {children}
        </div>
      </ConditionalWrapper>
    </Portal>
  );
}

export default InteractivePopup;
