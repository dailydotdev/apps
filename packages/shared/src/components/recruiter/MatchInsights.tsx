import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol } from '../utilities';
import type { ApplicationRank } from '../../features/opportunity/types';

export interface MatchInsightsProps {
  applicationRank: Pick<ApplicationRank, 'score' | 'description'>;
}

const getMatchTitle = (score: number | undefined): string => {
  if (score === undefined) {
    return 'Match';
  }
  if (score >= 9) {
    return 'Exceptional Match';
  }
  if (score >= 7) {
    return 'Strong Match';
  }
  if (score >= 4) {
    return 'Good Match';
  }
  return 'Potential Match';
};

export const MatchInsights = ({
  applicationRank,
}: MatchInsightsProps): ReactElement => {
  const title = getMatchTitle(applicationRank.score);

  return (
    <FlexCol className="gap-4 rounded-16 bg-action-upvote-float p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-8 bg-accent-avocado-default p-1">
          <Typography type={TypographyType.Body} bold className="text-white">
            {applicationRank.score?.toFixed(1) ?? '-'}
          </Typography>
        </div>
        <FlexCol className="gap-1">
          <Typography type={TypographyType.Footnote} bold>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Based on user CV & Activity on daily.dev
          </Typography>
        </FlexCol>
      </div>
      <FlexCol className="flex-shrink flex-wrap gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="flex-wrap whitespace-pre-wrap break-words"
        >
          {applicationRank.description || 'No insights available'}
        </Typography>
      </FlexCol>
    </FlexCol>
  );
};
