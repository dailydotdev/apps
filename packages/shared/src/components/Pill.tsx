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
  tag?: keyof Pick<JSX.IntrinsicElements, 'a' | 'div'>;
  size?: PillSize;
  className?: string;
}

export const Pill = ({
  label,
  tag: Tag = 'div',
  size = PillSize.Medium,
  className,
  ...props
}: Props): ReactElement => {
  return (
    <Tag
      {...props}
      className={classNames(
        pillSizeToClassName[size],
        'inline-flex items-center self-start rounded-10 p-2',
        className,
      )}
    >
      {label}
    </Tag>
  );
};
