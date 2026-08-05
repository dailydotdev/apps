import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { MagicIcon } from '../../../components/icons';
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
    <FlexCol className="gap-1.5 border-b border-border-subtlest-quaternary pb-5">
      <span className="flex size-7 items-center justify-center rounded-8 bg-brand-float">
        <MagicIcon size={IconSize.XSmall} className="text-brand-default" />
      </span>
      <Typography tag={TypographyTag.H1} type={TypographyType.Body} bold>
        {interest?.query ?? 'Your interest agent'}
      </Typography>
      <FlexRow className="flex-wrap items-center gap-x-1.5 gap-y-1">
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
    </FlexCol>
  );
};
