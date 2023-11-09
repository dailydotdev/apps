import classNames from 'classnames';
import React, { ReactElement, ReactNode, useEffect, useRef } from 'react';
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
  ProfileMenu = 'profileMenu',
  Screen = 'screen',
}

interface InteractivePopupProps {
  children: ReactNode;
  className?: string;
  position?: InteractivePopupPosition;
  closeOutsideClick?: boolean;
  onClose?: (e: MouseEvent | KeyboardEvent) => void;
}

const centerClassX = 'left-1/2 -translate-x-1/2';
const centerClassY = 'top-1/2 -translate-y-1/2';
const startClass = 'top-16';
const endClass = 'bottom-8';
const rightClass = 'right-8';
const leftClass = 'left-64';
const profileMenuRightClass = 'right-4';

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
  profileMenu: classNames(profileMenuRightClass, startClass),
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
  closeOutsideClick,
  onClose,
  ...props
}: InteractivePopupProps): ReactElement {
  const container = useRef<HTMLDivElement>();
  const onCloseRef = useRef(onClose);
  const { sidebarRendered } = useSidebarRendered();
  const { sidebarExpanded } = useSettingsContext();
  const finalPosition = sidebarRendered
    ? position
    : InteractivePopupPosition.Center;
  const classes = positionClass[finalPosition];

  useEffect(() => {
    if (!closeOutsideClick || !onCloseRef?.current || !container?.current) {
      return null;
    }

    const onClickAnywhere = (e: MouseEvent) => {
      if (!container.current.contains(e.target as Node)) {
        onCloseRef.current(e);
      }
    };

    globalThis?.document.addEventListener('click', onClickAnywhere);

    return () => {
      globalThis?.document.removeEventListener('click', onClickAnywhere);
    };
  }, [closeOutsideClick]);

  return (
    <Portal>
      <ConditionalWrapper
        condition={!sidebarRendered}
        wrapper={(child) => (
          <div
            role="button"
            className="flex fixed inset-0 z-modal flex-col items-center bg-overlay-quaternary-onion"
            onClick={(e) => onClose(e.nativeEvent)}
            onKeyDown={(e) => onClose(e.nativeEvent)}
            tabIndex={0}
          >
            {child}
          </div>
        )}
      >
        <div
          ref={container}
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
