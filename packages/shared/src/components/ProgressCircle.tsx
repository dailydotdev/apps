import type { ReactElement } from 'react';
import React from 'react';
import { VIcon } from './icons';
import { IconSize } from './Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from './typography/Typography';

export type ProgressCircleColor = 'brand' | 'help';

type ProgressCircleProps = {
  progress: number;
  size?: number;
  stroke?: number;
  showPercentage?: boolean;
  color?: ProgressCircleColor;
};

const colorConfig: Record<
  ProgressCircleColor,
  { stroke: string; text: string; typography: TypographyColor }
> = {
  brand: {
    stroke: 'stroke-brand-default',
    text: 'text-brand-default',
    typography: TypographyColor.Brand,
  },
  help: {
    stroke: 'stroke-action-help-default',
    text: 'text-action-help-default',
    typography: TypographyColor.StatusHelp,
  },
};

const ProgressCircle = ({
  progress = 0,
  size = 40,
  stroke = 5,
  showPercentage = false,
  color = 'brand',
}: ProgressCircleProps): ReactElement => {
  const normalizedCompletion = Math.min(100, Math.max(0, progress));
  const isComplete = normalizedCompletion >= 100;
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedCompletion / 100);

  return (
    <div
      className="relative inline-flex size-10 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {isComplete ? (
        <VIcon size={IconSize.Medium} className={colorConfig[color].text} />
      ) : (
        <>
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
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              fill="transparent"
              className={colorConfig[color].stroke}
            />
          </svg>
          {showPercentage && (
            <Typography
              bold
              color={colorConfig[color].typography}
              type={TypographyType.Callout}
              className="absolute leading-none"
            >
              {Math.round(normalizedCompletion)}%
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressCircle;
