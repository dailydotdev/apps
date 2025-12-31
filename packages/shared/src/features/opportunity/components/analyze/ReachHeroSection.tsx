import React, { useState, useEffect } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

type ReachHeroSectionProps = {
  totalCount: number;
  isLoading: boolean;
};

export const ReachHeroSection = ({
  totalCount,
  isLoading,
}: ReachHeroSectionProps) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (isLoading || totalCount === 0) {
      return undefined;
    }

    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setAnimatedCount(totalCount);
        clearInterval(timer);
      } else {
        // Ease-out effect: start fast, slow down at end
        const progress = currentStep / steps;
        const easedProgress = 1 - (1 - progress) ** 3;
        setAnimatedCount(Math.floor(totalCount * easedProgress));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isLoading, totalCount]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-8">
        <div className="flex flex-col items-center gap-3">
          <ElementPlaceholder className="h-16 w-56 rounded-8" />
          <ElementPlaceholder className="h-6 w-72 rounded-8" />
          <ElementPlaceholder className="mt-2 h-4 w-48 rounded-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-brand-subtlest relative overflow-hidden rounded-16 border bg-brand-float">
      <div className="relative flex flex-col items-center gap-1 px-6 py-8">
        {/* Main number with emphasis */}
        <div className="flex items-baseline gap-1">
          <Typography
            type={TypographyType.Tera}
            color={TypographyColor.Brand}
            bold
            className="tabular-nums tracking-tight"
          >
            {animatedCount.toLocaleString()}
          </Typography>
          <Typography
            type={TypographyType.Giga3}
            color={TypographyColor.Brand}
            bold
          >
            +
          </Typography>
        </div>

        <Typography type={TypographyType.Title2} bold className="text-center">
          relevant developers in your reach
        </Typography>

        {/* Exclusive reach stat */}
        <div className="mt-4 flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-default px-4 py-2">
          <div className="size-2 rounded-full bg-brand-default" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            <span className="font-bold text-brand-default">30%</span>{' '}
            exclusively reachable on daily.dev
          </Typography>
        </div>
      </div>
    </div>
  );
};
