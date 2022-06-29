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
  filled?: boolean;
  size?: Size;
  className?: string;
  style?: Record<string, unknown>;
}

type Props = IconProps & {
  IconOutlined?: ItemType;
  IconFilled: ItemType;
};

const Icon = ({
  filled = false,
  size = 'small',
  className = '',
  IconOutlined,
  IconFilled,
  ...rest
}: Props): ReactElement => {
  const IconComponent = filled ? IconFilled : IconOutlined;

  return (
    <IconComponent
      className={classNames(IconSize[size], 'pointer-events-none', className)}
      {...rest}
    />
  );
};

export default Icon;
