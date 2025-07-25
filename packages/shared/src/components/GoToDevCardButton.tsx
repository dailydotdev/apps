import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { Tooltip } from './tooltip/Tooltip';

export type GoToDevCardButtonProps = {
  children?: ReactNode;
  className?: string;
  isLocked?: boolean;
};

export default function GoToDevCardButton({
  children,
  className,
  isLocked,
}: GoToDevCardButtonProps): ReactElement {
  return (
    <Tooltip content={isLocked && 'Sign up to Unlock'}>
      <div className={className}>
        <Button
          variant={ButtonVariant.Primary}
          tag="a"
          size={ButtonSize.Small}
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          disabled={isLocked}
        >
          {children}
        </Button>
      </div>
    </Tooltip>
  );
}
