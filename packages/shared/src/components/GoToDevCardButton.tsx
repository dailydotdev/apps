import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { ButtonV2, ButtonSize, ButtonVariant } from './buttons/ButtonV2';
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
        <ButtonV2
          variant={ButtonVariant.Primary}
          tag="a"
          size={ButtonSize.Small}
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          disabled={isLocked}
        >
          {children}
        </ButtonV2>
      </div>
    </Tooltip>
  );
}
