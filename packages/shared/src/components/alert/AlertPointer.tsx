import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '../buttons/Button';
import {
  AlertPointerMessage,
  AlertPointerCopy,
  AlertPointerWrapper,
  AlertPointerContainer,
} from './common';
import Pointer, { PointerColor } from './Pointer';
import CloseButton from '../CloseButton';

interface ClassName {
  container?: string;
  pointer?: string;
  wrapper?: string;
  message?: string;
  label?: string;
}

export type OffsetXY = [number?, number?];

export enum AlertPlacement {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const messageBorder: Record<PointerColor, string> = {
  [PointerColor.Cabbage]: 'border-accent-cabbage-default',
  [PointerColor.Success]: 'border-status-success',
};

const pointerClasses: Record<AlertPlacement, string> = {
  top: 'rotate-180',
  right: '-rotate-90',
  left: 'rotate-90',
  bottom: '',
};

const verticalCenter = '-translate-y-1/2';
const horizontalCenter = '-translate-x-1/2';

const alertContainerClasses: Record<AlertPlacement, string> = {
  top: classNames('top-0 -translate-y-full flex-col-reverse', horizontalCenter),
  right: classNames('right-0 translate-x-full flex-row', verticalCenter),
  left: classNames('left-0 -translate-x-full flex-row-reverse', verticalCenter),
  bottom: classNames('bottom-0 translate-y-full flex-col', horizontalCenter),
};

const getCenteredOffset = (offset: number) => `calc(50% - ${offset}px)`;

const getContainerStyle = (
  [xOffset = 0, yOffset = 0]: OffsetXY = [0, 0],
): Record<AlertPlacement, CSSProperties> => ({
  left: { left: xOffset, top: getCenteredOffset(yOffset) },
  right: { right: xOffset, top: getCenteredOffset(yOffset) },
  bottom: { bottom: yOffset, left: getCenteredOffset(xOffset) },
  top: { top: yOffset, left: getCenteredOffset(xOffset) },
});

export interface AlertPointerProps {
  className?: ClassName;
  children: ReactNode;
  message: ReactNode;
  placement?: AlertPlacement;
  offset?: OffsetXY;
  color?: PointerColor;
  isAlertDisabled?: boolean;
  onClose?: () => unknown;
}

const DEFAULT_POINTER_LENGTH = 6;
const getMessageStyle = (
  length = DEFAULT_POINTER_LENGTH,
): Record<AlertPlacement, CSSProperties> => ({
  left: { marginRight: length },
  right: { marginLeft: length },
  bottom: { marginBottom: -length },
  top: { marginTop: -length },
});

export default function AlertPointer({
  placement = AlertPlacement.Right,
  color = PointerColor.Cabbage,
  className = {},
  children,
  message,
  offset,
  isAlertDisabled,
  onClose,
}: AlertPointerProps): ReactElement {
  const pointerRef = useRef<HTMLDivElement>();
  const rect = pointerRef?.current?.getBoundingClientRect?.();

  if (isAlertDisabled) {
    return <>{children}</>;
  }

  return (
    <AlertPointerWrapper className={className.wrapper}>
      {children}
      <AlertPointerContainer
        style={getContainerStyle(offset)[placement]}
        className={classNames(
          alertContainerClasses[placement],
          className.container,
        )}
      >
        <Pointer
          ref={pointerRef}
          color={color}
          className={classNames(pointerClasses[placement], className.pointer)}
        />
        <AlertPointerMessage
          className={classNames(messageBorder[color], className.message)}
          style={getMessageStyle(rect?.height)[placement]}
        >
          {typeof message === 'string' ? (
            <AlertPointerCopy className={className.label}>
              {message}
            </AlertPointerCopy>
          ) : (
            message
          )}
          <CloseButton
            data-testid="alert-close"
            onClick={onClose}
            size={ButtonSize.XSmall}
            className="absolute right-2 top-2"
            type="button"
          />
        </AlertPointerMessage>
      </AlertPointerContainer>
    </AlertPointerWrapper>
  );
}
