import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol } from '../utilities';
import { ChecklistBIcon } from '../icons';

export interface MatchInsightsProps {
  reasons: string[];
}

export const MatchInsights = ({
  reasons,
}: MatchInsightsProps): ReactElement => {
  return (
    <FlexCol className="gap-4 rounded-16 bg-action-upvote-float p-4">
      <div className="flex items-center gap-2">
        <ChecklistBIcon className="text-action-upvote-default" />
        <FlexCol className="gap-1">
          <Typography type={TypographyType.Footnote} bold>
            Exceptional Match
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
          We noticed you’ve been digging into React performance optimization and
          exploring payment systems lately. Your skills in TypeScript and
          Node.js line up directly with the core technologies this team uses.
          You also follow several Atlassian engineers and have shown consistent
          interest in project management software, which makes this role a
          natural fit for your trajectory.
        </Typography>
      </FlexCol>
    </FlexCol>
  );
};
