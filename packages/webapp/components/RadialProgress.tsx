import React, {
  CSSProperties,
  forwardRef,
  LegacyRef,
  ReactElement,
  useMemo,
  useState,
} from 'react';
import styles from '../styles/radialProgress.module.css';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';

const RAD_TO_DEGREES = 180 / Math.PI;
const TWO_PI = 2 * Math.PI;

const radius = 22;
const center = 24;
const stepsGap = 8;
const circumference = TWO_PI * radius;

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees - 90) / RAD_TO_DEGREES;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

const pathStyle: CSSProperties = {
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export type RadialProgressProps = {
  progress: number;
  steps: number;
  maxDegrees?: number;
  onTransitionEnd?: () => unknown;
  className?: string;
  style?: CSSProperties;
};

const Circle = classed('circle', styles.circle);

export default forwardRef(function RadialProgress(
  {
    progress,
    steps,
    maxDegrees = 360,
    onTransitionEnd,
    className,
    ...props
  }: RadialProgressProps,
  ref: LegacyRef<HTMLDivElement>,
): ReactElement {
  const [id] = useState(`rd-${Math.random().toString(36).substring(7)}`);

  const progressRatio = steps > 0 ? progress / steps : 1;
  const stepsPaths = useMemo<string[]>(() => {
    if (steps > 0) {
      const stepAngle = maxDegrees / steps;
      const gapDegrees = (stepsGap / radius) * RAD_TO_DEGREES;
      return [...new Array(steps)].map((_, i) => {
        const startAngle = 180 + stepAngle * i + gapDegrees / 2;
        const endAngle = startAngle + stepAngle - gapDegrees;
        return describeArc(startAngle, endAngle);
      });
    }
    return [describeArc(0, 359)];
  }, [steps, maxDegrees]);

  const completedPaths = useMemo<string[]>(() => {
    if (progress > 0) {
      return stepsPaths.slice(0, progress);
    }
    return [];
  }, [stepsPaths, progress]);

  const remainingPaths = useMemo<string[]>(() => stepsPaths.slice(progress), [
    stepsPaths,
    progress,
  ]);

  return (
    <div
      {...props}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={steps}
      ref={ref}
      className={classNames(
        'overflow-hidden',
        styles.radialProgress,
        className,
      )}
    >
      <svg
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <g id={`${id}-group-completed`}>
            {completedPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                className="completed"
                style={pathStyle}
                data-testid="completedPath"
              />
            ))}
          </g>
          <g id={`${id}-group-remaining`}>
            {remainingPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                style={pathStyle}
                data-testid="remainingPath"
              />
            ))}
          </g>
        </defs>
        <mask id={`${id}-mask-all`} stroke="white">
          <use xlinkHref={`#${id}-group-completed`} />
          <use xlinkHref={`#${id}-group-remaining`} />
        </mask>
        <mask id={`${id}-mask-completed`} stroke="white">
          <use xlinkHref={`#${id}-group-completed`} />
        </mask>
        <Circle
          r={radius}
          cx={center}
          cy={center}
          mask={`url(#${id}-mask-all)`}
        />
        <g mask={`url(#${id}-mask-completed)`}>
          <Circle
            r={radius}
            cx={center}
            cy={center}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progressRatio)}
            className="completed"
            onTransitionEnd={onTransitionEnd}
          />
        </g>
      </svg>
    </div>
  );
});
