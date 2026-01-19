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
        const progress = currentStep / steps;
        const easedProgress = 1 - (1 - progress) ** 3;
        setAnimatedCount(Math.floor(totalCount * easedProgress));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isLoading, totalCount]);

  if (isLoading) {
    return (
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
        <div className="flex flex-col items-center gap-4">
          <ElementPlaceholder className="h-20 w-40 rounded-8" />
          <ElementPlaceholder className="h-5 w-48 rounded-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
      <div className="flex flex-col items-center">
        {/* Label */}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Potential reach
        </Typography>
        {/* Hero number */}
        <Typography type={TypographyType.Tera} bold className="tabular-nums">
          {animatedCount.toLocaleString()}
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
        >
          developers matched
        </Typography>

        {/* Community differentiator */}
        <div className="mt-5 flex animate-fade-slide-up items-center gap-2 rounded-10 bg-surface-float px-3 py-2">
          <div className="size-2 animate-pulse rounded-full bg-status-success" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Active in our community
          </Typography>
        </div>
      </div>
    </div>
  );
};
