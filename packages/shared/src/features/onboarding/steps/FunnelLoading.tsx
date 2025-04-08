'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import StepHeadline from '../shared/StepHeadline';
import type { FunnelStepLoading } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

const animationDuration = 4500;

const FunnelLoading = ({
  parameters,
  onTransition,
}: FunnelStepLoading): ReactElement => {
  const [percentage, setPercentage] = useState(0);
  const animationRef = useRef<number>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (percentage >= 100) {
      onTransition({ type: FunnelStepTransitionType.Complete });
    }

    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, onTransition]);

  useEffect(() => {
    const firstPhaseDuration = animationDuration * 0.4; // Time to reach 40%
    const secondPhaseDuration = animationDuration * 0.6; // Remaining time after 40%

    const animateSecondPhase = (startTime: number) => {
      const now = performance.now();
      const elapsedTime = now - startTime;
      const progress = Math.min(elapsedTime / secondPhaseDuration, 1); // Progress from 40% to 100%

      // Using slight easing for more natural feel
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentPercent = 40 + 60 * easeOutQuad(progress); // Maps 0-1 to 40-100%

      setPercentage(Math.round(currentPercent));

      if (progress < 1) {
        // Continue second phase animation
        animationRef.current = requestAnimationFrame(() =>
          animateSecondPhase(startTime),
        );
      } else {
        // Ensure we end at exactly 100%
        setPercentage(100);
      }
    };

    const animateFirstPhase = (startTime: number) => {
      const now = performance.now();
      const elapsedTime = now - startTime;
      const progress = Math.min(elapsedTime / firstPhaseDuration, 1); // Progress to 40%

      // Using slight easing for more natural feel
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentPercent = 40 * easeOutQuad(progress); // Maps 0-1 to 0-40%

      setPercentage(Math.round(currentPercent));

      if (progress < 1) {
        // Continue first phase animation
        animationRef.current = requestAnimationFrame(() =>
          animateFirstPhase(startTime),
        );
      } else {
        // We've reached exactly 40%, now pause
        setPercentage(40);

        // Pause for 200ms at 40%
        pauseTimeoutRef.current = setTimeout(() => {
          // After pause, start the second phase from 40% to 100%
          const secondPhaseStart = performance.now();
          animateSecondPhase(secondPhaseStart);
        }, 200);
      }
    };

    // Force completion safety measure
    const forceCompletionTimeoutId = setTimeout(() => {
      setPercentage(100);
    }, animationDuration + 300); // Added 300ms to account for pause

    // Start the first phase animation
    const animationStart = performance.now();
    animateFirstPhase(animationStart);

    return () => {
      clearTimeout(forceCompletionTimeoutId);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-1 mobileL:px-6">
      <div className="relative">
        <svg
          className="size-48"
          viewBox="0 0 196 196"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx="98"
            cy="98"
            r="90"
            className="stroke-overlay-primary-pepper"
            strokeOpacity="0.32"
            strokeWidth="14.4"
          />

          {/* Progress circle drawing using path */}
          <path
            d={getProgressArcPath(percentage)}
            className="stroke-text-primary"
            strokeWidth="14.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Typography tag={TypographyTag.Span} type={TypographyType.Mega1} bold>
            {percentage}%
          </Typography>
        </div>
      </div>
      <StepHeadline
        heading={parameters?.headline || 'Lining up your next move...'}
        description={
          parameters?.explainer ||
          "Based on everything you shared, we're lining up insights that match where you're headed. Give us a sec."
        }
      />
    </div>
  );
};

export default FunnelLoading;
