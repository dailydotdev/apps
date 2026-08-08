import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexRow } from '../../../components/utilities';
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
  const { interest, status } = useAgent();
  const isPaused = status !== UserInterestStatus.Active;
  const cadence = cadenceCopy[interest?.cadence ?? 'daily'];

  return (
    // The mark and the name sit in the header a few pixels above this, so
    // repeating them here spent a screenful saying the same thing twice. What
    // is left is the part the header can't carry: how often it runs, and what
    // it has to show for it.
    <FlexRow className="flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-border-subtlest-quaternary pb-4">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {isPaused ? 'Paused, no scheduled runs' : `Runs ${cadence}`}
        {` · ${findingsCount} in feed · ${postsCount} posts written`}
      </Typography>
      {interest?.lastRunAt && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {'· last run '}
          <DateFormat date={interest.lastRunAt} type={TimeFormatType.Post} />
        </Typography>
      )}
    </FlexRow>
  );
};
