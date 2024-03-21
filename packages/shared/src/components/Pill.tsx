import React, { ReactElement } from 'react';
import classNames from 'classnames';

export enum PillSize {
  Small = 'small',
  Medium = 'medium',
}

const pillSizeToClassName: Record<PillSize, string> = {
  [PillSize.Small]: 'font-bold typo-footnote rounded-8 p-1 px-2',
  [PillSize.Medium]: 'font-bold typo-caption1 rounded-10 p-2',
};

interface Props {
  label: string;
  tag?: keyof Pick<JSX.IntrinsicElements, 'a' | 'div'>;
  size?: PillSize;
  className?: string;
  alignment?: string;
}

export const Pill = ({
  label,
  tag: Tag = 'div',
  size = PillSize.Medium,
  alignment = 'self-start',
  className,
  ...props
}: Props): ReactElement => {
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
