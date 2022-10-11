import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import classNames from 'classnames';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import { AlertContainer, AlertCopy, AlertWrapper } from './common';
import Pointer, { PointerColor } from '../Pointer';

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

interface MyFeedAlertProps {
  className?: ClassName;
  hideAlert: () => unknown;
  children: ReactNode;
  placement?: AlertPlacement;
}

const getStyle = (
  placement: AlertPlacement,
  { height = 0 }: Partial<DOMRect> = {},
): CSSProperties => {
  if (placement === AlertPlacement.Left) {
    return { left: HORIZONTAL_OFFSET * -1 };
  }

  if (placement === AlertPlacement.Right) {
    return { right: HORIZONTAL_OFFSET * -1 };
  }

  if (placement === AlertPlacement.Bottom) {
    return { bottom: height * -1 };
  }

  if (placement === AlertPlacement.Top) {
    return { top: height * -1 };
  }

  return {};
};

export default function MyFeedAlert({
  placement = AlertPlacement.Right,
  className = {},
  children,
  hideAlert,
}: MyFeedAlertProps): ReactElement {
  const pointerRef = useRef<HTMLDivElement>();
  const rect = pointerRef?.current?.getBoundingClientRect?.();

  return (
    <AlertWrapper>
      {children}
      <Pointer
        ref={pointerRef}
        className={pointerClasses[placement]}
        color={PointerColor.Success}
      />
      <AlertContainer
        className={classNames(
          'absolute font-normal',
          messageContainerClasses[placement],
          className.container,
        )}
        style={getStyle(placement, rect)}
      >
        <AlertCopy className={className.label}>
          Edit your personal feed preferences here
        </AlertCopy>
        <Button
          data-testid="alert-close"
          onClick={hideAlert}
          icon={<XIcon />}
          buttonSize="xsmall"
          iconOnly
          style={{ position: 'absolute' }}
          className="top-2 right-2 btn-tertiary"
        />
      </AlertContainer>
    </AlertWrapper>
  );
}
