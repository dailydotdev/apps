import React, { ReactElement } from 'react';
import classNames from 'classnames';

export enum PillSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

const pillSizeToClassName: Record<PillSize, string> = {
  [PillSize.XSmall]: 'h-5 typo-caption1',
  [PillSize.Small]: 'h-6 text-caption2',
  [PillSize.Medium]: 'h-7 font-bold',
  [PillSize.Large]: 'h-8 typo-caption4 font-bold',
  [PillSize.XLarge]: 'h-10 typo-caption5 font-bold',
};

interface Props {
  label: string;
  size?: PillSize;
  className?: string;
}

const Pill = ({
  label,
  size = PillSize.Medium,
  className,
}: Props): ReactElement => {
  return (
    <div
      className={classNames(
        pillSizeToClassName[size],
        'rounded-xl',
        'bg-theme-overlay-float-cabbage',
        'px-2',
        'inline-flex items-center',
        className,
      )}
    >
      {label}
    </div>
  );
};

export default Pill;
