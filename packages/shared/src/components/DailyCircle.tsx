import classNames from 'classnames';
import React, { ReactElement } from 'react';

type Size = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

const sizeMap: Record<Size, string> = {
  xxsmall: 'w-10 h-10',
  xsmall: 'w-20 h-20',
  small: 'w-32 h-32',
  medium: 'w-60 h-60',
  large: 'w-80 h-80',
  xlarge: 'w-[26rem] h-[26rem]',
};

interface DailyCircleProps {
  size?: Size;
  className?: string;
}

function DailyCircle({
  size = 'medium',
  className,
}: DailyCircleProps): ReactElement {
  return (
    <div
      className={classNames('rounded-full', sizeMap[size], className)}
      style={{
        background: 'linear-gradient(135deg, #E436FE, #1B3C67)',
        filter: 'drop-shadow(-32px -12px 32px rgba(198, 55, 231, 0.68))',
      }}
    />
  );
}

export default DailyCircle;
