import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import useGoToDevCardButton from '../hooks/useGoToDevCardButton';
import { Button } from './buttons/Button';

export type GoToDevCardButtonProps = {
  origin: string;
  children?: ReactNode;
  className?: string;
};

export default function GoToDevCardButton({
  origin,
  children,
  className,
}: GoToDevCardButtonProps): ReactElement {
  const [onGenerateDevCardClick] = useGoToDevCardButton(origin);

  return (
    <Button
      className={classNames('btn-secondary', className)}
      tag="a"
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard?utm_source=dailydev&utm_medium=app&utm_campaign=${origin}`}
      target="_blank"
      onClick={onGenerateDevCardClick}
    >
      {children}
    </Button>
  );
}
