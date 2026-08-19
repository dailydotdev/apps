import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { AiIcon, SettingsIcon, TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';
import { AgentStatusChip } from './AgentStatusChip';

const cadenceCopy: Record<string, string> = {
  hourly: 'every hour',
  daily: 'every day',
  weekly: 'every week',
};

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <FlexCol className="gap-0.5">
    <Typography type={TypographyType.Title3} bold>
      {value}
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="uppercase"
    >
      {label}
    </Typography>
  </FlexCol>
);

export const AgentHero = ({
  findingsCount,
  postsCount,
}: {
  findingsCount: number;
  postsCount: number;
}): ReactElement => {
  const { interest, isWorking, workingLabel, setSettingsOpen } = useAgent();
  const status = interest?.status ?? UserInterestStatus.Active;

  return (
    <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-6">
      <FlexRow className="items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-action-bookmark-float">
          <AiIcon size={IconSize.Large} className="text-brand-default" />
        </span>
        <FlexCol className="min-w-0 flex-1 gap-1">
          <Typography type={TypographyType.Title2} bold truncate>
            {interest?.query ?? 'Your interest agent'}
          </Typography>
          <FlexRow className="flex-wrap items-center gap-x-2 gap-y-1">
            <AgentStatusChip />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              truncate
            >
              {isWorking
                ? workingLabel
                : `Runs ${cadenceCopy[interest?.cadence ?? 'daily']}`}
            </Typography>
            {!isWorking && interest?.lastRunAt && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {'· last run '}
                <DateFormat
                  date={interest.lastRunAt}
                  type={TimeFormatType.Post}
                />
              </Typography>
            )}
          </FlexRow>
        </FlexCol>
        <Button
          icon={<SettingsIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={() => setSettingsOpen(true)}
          aria-label="Agent settings"
        />
      </FlexRow>

      <FlexRow className="items-center gap-8 border-t border-border-subtlest-tertiary pt-4">
        <Stat label="In feed" value={`${findingsCount}`} />
        <Stat label="Posts written" value={`${postsCount}`} />
        <FlexRow className="ml-auto items-center gap-2 text-text-tertiary">
          <TimerIcon size={IconSize.Small} />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {status === UserInterestStatus.Active
              ? `Next run ${cadenceCopy[interest?.cadence ?? 'daily']}`
              : 'Paused — no scheduled runs'}
          </Typography>
        </FlexRow>
      </FlexRow>
    </FlexCol>
  );
};
