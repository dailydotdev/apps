import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import classNames from 'classnames';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import {
  AlertPointerMessage,
  AlertPointerCopy,
  AlertPointerWrapper,
  AlertPointerContainer,
} from './common';
import Pointer, { PointerColor } from './Pointer';

interface ClassName {
  container?: string;
  pointer?: string;
  wrapper?: string;
  message?: string;
  label?: string;
}

type OffsetXY = [number?, number?];

export enum AlertPlacement {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const messageBorder: Record<PointerColor, string> = {
  [PointerColor.Cabbage]: 'border-theme-status-cabbage',
  [PointerColor.Success]: 'border-theme-status-success',
};

const pointerClasses: Record<AlertPlacement, string> = {
  top: 'rotate-180',
  right: '-rotate-90',
  left: 'rotate-90',
  bottom: '',
};

const alertContainerClasses: Record<AlertPlacement, string> = {
  top: '-translate-y-full top-0 flex-col-reverse',
  right: 'translate-x-full right-0 flex-row',
  left: '-translate-x-full left-0 flex-row-reverse',
  bottom: 'translate-y-full bottom-0 flex-col',
};

const getContainerStyle = (
  [xOffset = 0, yOffset = 0]: OffsetXY = [0, 0],
): Record<AlertPlacement, CSSProperties> => ({
  left: { left: xOffset },
  right: { right: xOffset },
  bottom: { bottom: yOffset, left: xOffset },
  top: { top: yOffset },
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
          <Button
            data-testid="alert-close"
            onClick={onClose}
            icon={<XIcon />}
            buttonSize="xsmall"
            iconOnly
            style={{ position: 'absolute' }}
            className="top-2 right-2 btn-tertiary"
          />
        </AlertPointerMessage>
      </AlertPointerContainer>
    </AlertPointerWrapper>
  );
}
