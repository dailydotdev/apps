import React, { ReactElement, ReactNode } from 'react';
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
        'absolute inset-0 z-1 flex flex-col items-center justify-center',
        className,
      )}
    >
      <p className="mt-5 text-center font-bold typo-callout laptopL:mt-0">
        {title}
      </p>
      {children}
    </span>
  );
}
