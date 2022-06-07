import React from 'react';
import classNames from 'classnames';

export type Size = 'small' | 'medium' | 'large';

const IconSize = {
  small: 'w-5 h-5',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

export interface IconProps {
  filled?: boolean;
  size?: Size;
  className?: string;
}

type Props = {
  filled?: boolean;
  size?: Size;
  className?: string;
  IconOutlined: React.ComponentType<{ className }>;
  IconFilled: React.ComponentType<{ className }>;
};

const Icon: React.VFC<Props> = ({
  filled = false,
  size = 'small',
  className = '',
  IconOutlined,
  IconFilled,
}) => {
  const IconComponent = filled ? IconFilled : IconOutlined;

  return (
    <IconComponent
      className={classNames(IconSize[size], 'pointer-events-none', className)}
    />
  );
};

export default Icon;
