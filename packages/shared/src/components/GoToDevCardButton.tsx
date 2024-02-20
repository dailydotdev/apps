import React, { ReactElement, ReactNode } from 'react';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { SimpleTooltip } from './tooltips/SimpleTooltip';

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
    <SimpleTooltip content={isLocked && 'Sign up to Unlock'}>
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
    </SimpleTooltip>
  );
}
