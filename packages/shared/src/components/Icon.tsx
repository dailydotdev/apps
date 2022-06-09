import React, { ReactElement } from 'react';
import classNames from 'classnames';

type Size = 'small' | 'medium' | 'large' | 'xlarge';

const IconSize: Record<Size, string> = {
  small: 'w-5 h-5',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
  xlarge: 'w-10 h-10',
};

type ItemType = React.ComponentType<{ className }>;

export interface IconProps {
  filled?: boolean;
  size?: Size;
  className?: string;
  style?: Record<string, unknown>;
}

type Props = IconProps & {
  IconOutlined: ItemType;
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
