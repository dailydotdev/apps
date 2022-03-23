import React, { ReactElement, ReactNode } from 'react';
import { Button } from './buttons/Button';
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
          className="btn-primary"
          tag="a"
          buttonSize="small"
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          disabled={isLocked}
        >
          {children}
        </Button>
      </div>
    </SimpleTooltip>
  );
}
