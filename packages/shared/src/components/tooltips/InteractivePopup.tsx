import classNames from 'classnames';
import React, { ReactElement, ReactNode, useRef } from 'react';
import { RootPortal } from './Portal';
import { useSettingsContext } from '../../contexts/SettingsContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import ConditionalWrapper from '../ConditionalWrapper';
import { MiniCloseIcon as CloseIcon } from '../icons';
import { isNullOrUndefined } from '../../lib/func';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useEventListener } from '../../hooks';

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
  onClose?: (e: MouseEvent | KeyboardEvent | MessageEvent) => void;
  closeButtonVariant?: ButtonVariant.Secondary | ButtonVariant.Tertiary;
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
  closeButtonVariant = ButtonVariant.Secondary,
  ...props
}: InteractivePopupProps): ReactElement {
  const container = useRef<HTMLDivElement>();
  const onCloseRef = useRef(onClose);
  const { sidebarRendered } = useSidebarRendered();
  const validateSidebar =
    sidebarRendered || position === InteractivePopupPosition.Screen;
  const { sidebarExpanded } = useSettingsContext();
  const finalPosition = validateSidebar
    ? position
    : InteractivePopupPosition.Center;
  const classes = positionClass[finalPosition];

  useEventListener(globalThis, 'click', (e) => {
    if (!closeOutsideClick && validateSidebar) {
      return;
    }

    if (
      !isNullOrUndefined(container.current) &&
      !container.current.contains(e.target as Node) &&
      onCloseRef.current
    ) {
      onCloseRef.current(e);
    }
  });

  return (
    <RootPortal>
      <ConditionalWrapper
        condition={!validateSidebar}
        wrapper={(child) => (
          <div className="fixed inset-0 z-modal flex flex-col items-center bg-overlay-quaternary-onion">
            {child}
          </div>
        )}
      >
        <div
          ref={container}
          className={classNames(
            'fixed z-popup overflow-hidden rounded-16 bg-theme-bg-primary shadow-2',
            className,
            classes,
            !validateSidebar && 'shadow-2',
            leftPositions.includes(finalPosition) &&
              !sidebarExpanded &&
              'laptop:left-16',
          )}
          {...props}
        >
          {finalPosition !== InteractivePopupPosition.ProfileMenu &&
            onClose && (
              <Button
                size={ButtonSize.Small}
                variant={closeButtonVariant}
                className="absolute right-2 top-2 z-1"
                icon={<CloseIcon />}
                onClick={(e: React.MouseEvent) => onClose(e.nativeEvent)}
                data-testid="close-interactive-popup"
              />
            )}
          {children}
        </div>
      </ConditionalWrapper>
    </RootPortal>
  );
}

export default InteractivePopup;
