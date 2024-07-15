import React, { ReactElement, ReactNode } from 'react';

interface CardCoverContainerProps {
  title: string;
  children: ReactNode;
}

export function CardCoverContainer({
  title,
  children,
}: CardCoverContainerProps): ReactElement {
  return (
    <span className="absolute inset-0 z-1 flex flex-col items-center justify-center">
      <p className="mt-5 text-center font-bold typo-callout laptopL:mt-0">
        {title}
      </p>
      {children}
    </span>
  );
}
