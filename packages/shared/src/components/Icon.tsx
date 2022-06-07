import React from 'react';

export type Size = 'medium' | 'large';

const IconSize = {
  medium: 5,
  large: 8,
};

type Props = {
  filled?: boolean;
  size?: Size;
  IconOutlined: React.ComponentType<{ className }>;
  IconFilled: React.ComponentType<{ className }>;
};

const Icon: React.VFC<Props> = ({
  filled = false,
  size = 'medium',
  IconOutlined,
  IconFilled,
}) => {
  const iconSize = IconSize[size];
  const className = `w-${iconSize} h-${iconSize} pointer-events-none`;

  return (
    <>
      {filled ? (
        <IconFilled className={className} />
      ) : (
        <IconOutlined className={className} />
      )}
    </>
  );
};

export default Icon;
