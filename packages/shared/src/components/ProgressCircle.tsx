import type { ReactElement } from 'react';
import React from 'react';
import { VIcon } from './icons';
import { IconSize } from './Icon';

type ProgressCircleProps = {
  progress: number;
  size?: number;
  color?: string;
  stroke?: number;
};

const ProgressCircle = ({
  progress = 0,
  size = 40,
  stroke = 5,
  color = '#b259f8',
}: ProgressCircleProps): ReactElement => {
  const normalizedCompletion = Math.min(100, Math.max(0, progress));
  const isComplete = normalizedCompletion >= 100;
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedCompletion / 100);

  return (
    <div
      className="inline-flex size-10 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {isComplete ? (
        <VIcon size={IconSize.Medium} className="text-brand-default" />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-border-subtlest-tertiary"
            strokeWidth={stroke}
            fill="transparent"
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            fill="transparent"
            className="stroke-brand-default"
          />
        </svg>
      )}
    </div>
  );
};

export default ProgressCircle;
