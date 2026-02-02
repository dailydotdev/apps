import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexRow } from '@dailydotdev/shared/src/components/utilities';
import type { TrendingInsight } from './types';

interface TrendingSectionProps {
  insights: TrendingInsight[];
}

export const TrendingSection = ({
  insights,
}: TrendingSectionProps): ReactElement => {
  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Primary}
      >
        What&apos;s happening now
      </Typography>
      <FlexRow className="flex-wrap gap-4">
        {insights.map((insight) => (
          <div
            key={insight.toolId}
            className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-theme-bg-tertiary px-4 py-2"
          >
            <span className="text-2xl">{insight.icon}</span>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {insight.message}
            </Typography>
          </div>
        ))}
      </FlexRow>
    </div>
  );
};
