import React from 'react';

type Props = {
  filled?: boolean;
  IconOutlined: React.ComponentType<{ className }>;
  IconFilled: React.ComponentType<{ className }>;
};

const Icon: React.VFC<Props> = ({
  filled = false,
  IconOutlined,
  IconFilled,
}) => (
  <>
    {filled ? (
      <IconFilled className="w-5 h-5 pointer-events-none" />
    ) : (
      <IconOutlined className="w-5 h-5 pointer-events-none" />
    )}
  </>
);

export default Icon;
