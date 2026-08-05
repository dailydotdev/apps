import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { AiIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

const cadenceCopy: Record<string, string> = {
  hourly: 'every hour',
  daily: 'every day',
  weekly: 'every week',
};

export const AgentIntro = ({
  findingsCount,
  postsCount,
}: {
  findingsCount: number;
  postsCount: number;
}): ReactElement => {
  const { interest } = useAgent();
  const isPaused = interest?.status !== UserInterestStatus.Active;
  const cadence = cadenceCopy[interest?.cadence ?? 'daily'];

  return (
    <FlexCol className="gap-2 border-b border-border-subtlest-quaternary pb-6">
      <span className="flex size-9 items-center justify-center rounded-10 bg-action-bookmark-float">
        <AiIcon size={IconSize.Small} className="text-brand-default" />
      </span>
      <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
        {interest?.query ?? 'Your interest agent'}
      </Typography>
      <FlexRow className="flex-wrap items-center gap-x-1.5 gap-y-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {isPaused ? 'Paused, no scheduled runs' : `Runs ${cadence}`}
          {` · ${findingsCount} in feed · ${postsCount} posts written`}
        </Typography>
        {interest?.lastRunAt && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {'· last run '}
            <DateFormat date={interest.lastRunAt} type={TimeFormatType.Post} />
          </Typography>
        )}
      </FlexRow>
    </FlexCol>
  );
};
