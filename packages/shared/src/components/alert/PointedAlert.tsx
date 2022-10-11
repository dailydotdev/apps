import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import classNames from 'classnames';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import { PointedAlertContainer, PointedAlertWrapper } from './common';
import Pointer, { PointerColor } from './Pointer';

interface ClassName {
  container?: string;
  label?: string;
}

export enum AlertPlacement {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const pointerClasses: Record<AlertPlacement, string> = {
  top: 'top-0 rotate-180 -translate-y-full',
  right: 'right-0 -rotate-90',
  left: 'left-0 rotate-90',
  bottom: 'bottom-0 translate-y-full',
};

const messageContainerClasses: Record<AlertPlacement, string> = {
  top: '-translate-y-full',
  right: 'translate-x-full',
  left: '-translate-x-full',
  bottom: 'translate-y-full',
};

const HORIZONTAL_OFFSET = 6;

interface PointedAlertProps {
  className?: ClassName;
  onClose: () => unknown;
  children: ReactNode;
  message: ReactNode;
  placement?: AlertPlacement;
}

const getStyle = (height = 0): Record<AlertPlacement, CSSProperties> => ({
  left: { left: HORIZONTAL_OFFSET * -1 },
  right: { right: HORIZONTAL_OFFSET * -1 },
  bottom: { bottom: height * -1 },
  top: { top: height * -1 },
});

export default function PointedAlert({
  placement = AlertPlacement.Right,
  className = {},
  children,
  message,
  onClose,
}: PointedAlertProps): ReactElement {
  const pointerRef = useRef<HTMLDivElement>();
  const rect = pointerRef?.current?.getBoundingClientRect?.();

  return (
    <PointedAlertWrapper>
      {children}
      <Pointer
        ref={pointerRef}
        className={pointerClasses[placement]}
        color={PointerColor.Success}
      />
      <PointedAlertContainer
        className={classNames(
          'absolute font-normal',
          messageContainerClasses[placement],
          className.container,
        )}
        style={getStyle(rect?.height)[placement]}
      >
        {message}
        <Button
          data-testid="alert-close"
          onClick={onClose}
          icon={<XIcon />}
          buttonSize="xsmall"
          iconOnly
          style={{ position: 'absolute' }}
          className="top-2 right-2 btn-tertiary"
        />
      </PointedAlertContainer>
    </PointedAlertWrapper>
  );
}
