'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  FunnelStepBackground,
  FunnelBackgroundVariant,
} from '../shared/FunnelStepBackground';
import StepHeadline from '../shared/StepHeadline';

type FunnelLoadingProps = {
  variant?: FunnelBackgroundVariant;
};

const FunnelLoading = ({
  variant = FunnelBackgroundVariant.Hourglass,
}: FunnelLoadingProps): ReactElement => {
  const [percentage, setPercentage] = useState(0);
  const animationDuration = 4500;
  const animationRef = useRef<number>();

  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];

    const percentageBursts = [0, 37, 65, 97, 100];

    const segments = [
      [0, 0.2, 0.1],
      [0.3, 0.2, 0.1],
      [0.6, 0.25, 0.05],
      [0.9, 0.1, 0],
    ];

    const animateBetweenPercentages = (
      startPercent: number,
      endPercent: number,
      duration: number,
      startTime: number,
    ) => {
      const now = performance.now();
      const elapsedTime = now - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const easeOutQuad = (t: number) => t * (2 - t);

      const currentPercent =
        startPercent + (endPercent - startPercent) * easeOutQuad(progress);

      setPercentage(Math.round(currentPercent));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(() =>
          animateBetweenPercentages(
            startPercent,
            endPercent,
            duration,
            startTime,
          ),
        );
      }
    };

    segments.forEach((segment, index) => {
      const segmentStartTime = segment[0] * animationDuration;
      const segmentDuration = segment[1] * animationDuration;

      const startPercent = percentageBursts[index];
      const endPercent = percentageBursts[index + 1];

      const animTimeoutId = setTimeout(() => {
        const segmentStart = startPercent;
        const segmentEnd = endPercent;
        const segmentAnimDuration = segmentDuration;

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        const startAnimation = () => {
          animateBetweenPercentages(
            segmentStart,
            segmentEnd,
            segmentAnimDuration,
            performance.now(),
          );
        };

        animationRef.current = requestAnimationFrame(startAnimation);
      }, segmentStartTime);

      timeoutIds.push(animTimeoutId);
    });

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationDuration]);

  const getProgressArcPath = (percent: number): string => {
    const radius = 90;
    const center = 98;

    if (percent <= 0) {
      return '';
    }

    if (percent >= 100) {
      return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${
        center - 0.001
      } ${center - radius}`;
    }

    const angle = (percent / 100) * 360;
    const radians = (angle - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(radians);
    const y = center + radius * Math.sin(radians);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${center} ${
      center - radius
    } A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}`;
  };

  return (
    <FunnelStepBackground variant={variant}>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-1 mobileL:px-6">
        <div className="relative">
          <svg
            width="196"
            height="196"
            viewBox="0 0 196 196"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle
              cx="98"
              cy="98"
              r="90"
              stroke="#0E1217"
              strokeOpacity="0.32"
              strokeWidth="14.4"
            />

            {/* Progress circle drawing using path */}
            <path
              d={getProgressArcPath(percentage)}
              stroke="white"
              strokeWidth="14.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">{percentage}%</span>
          </div>
        </div>
        <StepHeadline
          heading="Lining up your next move..."
          description="Based on everything you shared, we're lining up insights that match where you're headed. Give us a sec."
        />
      </div>
    </FunnelStepBackground>
  );
};

export default FunnelLoading;
