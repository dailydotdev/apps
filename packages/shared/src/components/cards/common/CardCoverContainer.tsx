import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface CardCoverContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function CardCoverContainer({
  title,
  children,
  className,
}: CardCoverContainerProps): ReactElement {
  return (
    <span
      className={classNames(
        'z-1 absolute inset-0 flex flex-col items-center justify-center',
        className,
      )}
    >
      <p className="typo-callout laptopL:mt-0 mt-5 text-center font-bold">
        {title}
      </p>
      {children}
    </span>
  );
}
