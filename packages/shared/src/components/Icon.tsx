import React, { ReactElement } from 'react';
import classNames from 'classnames';

export type Size =
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'xxxlarge'
  | 'xxxxlarge';

const IconSize: Record<Size, string> = {
  xsmall: 'w-3 h-3',
  small: 'w-5 h-5',
  medium: 'w-6 h-6',
  large: 'w-7 h-7',
  xlarge: 'w-8 h-8',
  xxlarge: 'w-10 h-10',
  xxxlarge: 'w-14 h-14',
  xxxxlarge: 'w-16 h-16',
};

type ItemType = React.ComponentType<{ className }>;

export interface IconProps {
  secondary?: boolean;
  size?: Size;
  className?: string;
  style?: Record<string, unknown>;
}

type Props = IconProps & {
  IconPrimary: ItemType;
  IconSecondary: ItemType;
};

const Icon = ({
  secondary = false,
  size = 'small',
  className = '',
  IconPrimary,
  IconSecondary,
  ...rest
}: Props): ReactElement => {
  const IconComponent = secondary ? IconSecondary : IconPrimary;

  return (
    <IconComponent
      className={classNames(IconSize[size], 'pointer-events-none', className)}
      {...rest}
    />
  );
};

export default Icon;
