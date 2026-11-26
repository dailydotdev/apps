import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export const formatMultiple = (value: number): string =>
  `${value >= 10 ? Math.round(value) : value.toFixed(1)}×`;

export const IntelSection = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <h3 className="font-bold typo-body">{title}</h3>
      {hint && <p className="text-text-tertiary typo-footnote">{hint}</p>}
    </div>
    {children}
  </div>
);

export const IntelBar = ({
  percentage,
  fillClassName = 'bg-text-quaternary',
}: {
  percentage: number;
  fillClassName?: string;
}): ReactElement => (
  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-50 bg-border-subtlest-tertiary">
    <div
      className={classNames('h-full rounded-50', fillClassName)}
      style={{ width: `${Math.max(percentage, 2)}%` }}
    />
  </div>
);
