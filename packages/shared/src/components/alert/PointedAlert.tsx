import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import classNames from 'classnames';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import {
  PointedAlertMessage,
  PointedAlertCopy,
  PointedAlertWrapper,
  PointedAlertContainer,
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

const pointerClasses = {
  [AlertPlacement.Top]: 'rotate-180',
  [AlertPlacement.Right]: '-rotate-90',
  [AlertPlacement.Left]: 'rotate-90',
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
  bottom: { bottom: yOffset },
  top: { top: yOffset },
});

export interface PointedAlertProps {
  className?: ClassName;
  children: ReactNode;
  message: ReactNode;
  placement?: AlertPlacement;
  offset?: OffsetXY;
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

export default function PointedAlert({
  placement = AlertPlacement.Right,
  className = {},
  children,
  message,
  offset,
  onClose,
}: PointedAlertProps): ReactElement {
  const pointerRef = useRef<HTMLDivElement>();
  const rect = pointerRef?.current?.getBoundingClientRect?.();

  return (
    <PointedAlertWrapper>
      {children}
      <PointedAlertContainer
        style={getContainerStyle(offset)[placement]}
        className={classNames(
          alertContainerClasses[placement],
          className.container,
        )}
      >
        <Pointer
          ref={pointerRef}
          color={PointerColor.Success}
          className={classNames(pointerClasses[placement], className.pointer)}
        />
        <PointedAlertMessage
          className={classNames('font-normal relative', className.message)}
          style={getMessageStyle(rect?.height)[placement]}
        >
          {typeof message === 'string' ? (
            <PointedAlertCopy className={className.label}>
              {message}
            </PointedAlertCopy>
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
        </PointedAlertMessage>
      </PointedAlertContainer>
    </PointedAlertWrapper>
  );
}
