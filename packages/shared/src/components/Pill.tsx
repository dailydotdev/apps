import React, { ReactElement } from 'react';
import classNames from 'classnames';

export enum PillSize {
  Medium = 'medium',
}

const pillSizeToClassName: Record<PillSize, string> = {
  [PillSize.Medium]: 'font-bold typo-caption1',
};

interface Props {
  label: string;
  size?: PillSize;
  className?: string;
}

export const Pill = ({
  label,
  size = PillSize.Medium,
  className,
}: Props): ReactElement => {
  return (
    <div
      className={classNames(
        pillSizeToClassName[size],
        'rounded-10 p-2 inline-flex items-center self-start',
        className,
      )}
    >
      {label}
    </div>
  );
};
