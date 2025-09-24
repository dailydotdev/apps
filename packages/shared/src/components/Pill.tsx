import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum PillSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
}

const pillSizeToClassName: Record<PillSize, string> = {
  [PillSize.XSmall]: 'font-bold typo-caption2 rounded-4 px-1',
  [PillSize.Small]: 'font-bold typo-footnote rounded-8 p-1 px-2',
  [PillSize.Medium]: 'font-bold typo-caption1 rounded-10 p-2',
};

export type PillProps = {
  label: ReactNode;
  tag?: keyof Pick<JSX.IntrinsicElements, 'a' | 'div'>;
  size?: PillSize;
  className?: string;
  alignment?: string;
};

export const Pill = ({
  label,
  tag: Tag = 'div',
  size = PillSize.Medium,
  alignment = 'self-start',
  className,
  ...props
}: PillProps): ReactElement => {
  return (
    <Tag
      {...props}
      className={classNames(
        alignment,
        pillSizeToClassName[size],
        'inline-flex items-center',
        className,
      )}
    >
      {label}
    </Tag>
  );
};
