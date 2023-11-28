import React, { ReactElement } from 'react';
import classNames from 'classnames';

export enum PillSize {
  XXSmall = 'xxsmall',
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

const pillSizeToClassName: Record<PillSize, string> = {
  [PillSize.XXSmall]: 'h-3 text-xs',
  [PillSize.XSmall]: 'h-5 text-xs',
  [PillSize.Small]: 'h-6 text-sm',
  [PillSize.Medium]: 'h-7 text-base font-bold',
  [PillSize.Large]: 'h-8 text-lg font-bold',
  [PillSize.XLarge]: 'h-10 text-xl font-bold',
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
        'rounded-10',
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
