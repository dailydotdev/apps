import React, { ReactElement, ReactNode } from 'react';
import useGoToDevCardButton from '../hooks/useGoToDevCardButton';
import { Button } from './buttons/Button';
import { SimpleTooltip } from './tooltips/SimpleTooltip';

export type GoToDevCardButtonProps = {
  origin: string;
  children?: ReactNode;
  className?: string;
  isLocked?: boolean;
};

export default function GoToDevCardButton({
  origin,
  children,
  className,
  isLocked,
}: GoToDevCardButtonProps): ReactElement {
  const [onGenerateDevCardClick] = useGoToDevCardButton(origin);

  return (
    <SimpleTooltip content="Sign up to Unlock">
      <div className={className}>
        <Button
          className="btn-primary"
          tag="a"
          buttonSize="small"
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          onClick={onGenerateDevCardClick}
          disabled={isLocked}
        >
          {children}
        </Button>
      </div>
    </SimpleTooltip>
  );
}
