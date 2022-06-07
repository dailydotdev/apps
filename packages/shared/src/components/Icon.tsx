import React from 'react';

export type Size = 'small' | 'medium' | 'large';

const IconSize = {
  small: 5,
  medium: 6,
  large: 8,
};

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
  const iconSize = IconSize[size];
  const classes = `w-${iconSize} h-${iconSize} pointer-events-none ${className}`;

  return (
    <>
      {filled ? (
        <IconFilled className={classes} />
      ) : (
        <IconOutlined className={classes} />
      )}
    </>
  );
};

export default Icon;
