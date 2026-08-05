import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/popover/Popover';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { Switch } from '../../../components/fields/Switch';
import { MagicIcon, SettingsIcon, TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

const cadenceCopy: Record<string, string> = {
  hourly: 'Runs every hour',
  daily: 'Runs every day',
  weekly: 'Runs every week',
};

const MenuRow = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactElement;
  label: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="-mx-1 flex items-center gap-2 rounded-8 px-1 py-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
  >
    {icon}
    <Typography type={TypographyType.Footnote} color={TypographyColor.Primary}>
      {label}
    </Typography>
  </button>
);

// The agent's identity tile doubles as its power switch, the way Claude Code
// hangs Remote Control off the session chip: the dot tells you the state at a
// glance, the popover is where you change it.
export const AgentRunControl = (): ReactElement => {
  const {
    interest,
    isWorking,
    update,
    setSettingsOpen,
    openContentTarget,
    focusContent,
    openContent,
  } = useAgent();
  const status = interest?.status ?? UserInterestStatus.Active;
  const isRunning = status === UserInterestStatus.Active;

  const openActivity = () =>
    openContent.some((item) => item.type === 'activity')
      ? focusContent('activity')
      : openContentTarget({ type: 'activity' });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Agent run state"
          className="relative flex size-6 shrink-0 items-center justify-center rounded-8 bg-brand-float transition-colors hover:bg-surface-hover"
        >
          <MagicIcon size={IconSize.Size16} className="text-brand-default" />
          <span
            className={classNames(
              'absolute -bottom-0.5 -right-0.5 size-2 rounded-6 border-2 border-background-default',
              // eslint-disable-next-line no-nested-ternary
              isWorking
                ? 'animate-pulse bg-brand-default'
                : isRunning
                ? 'bg-action-upvote-default'
                : 'bg-text-quaternary',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="z-popup w-64 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3"
      >
        <FlexCol className="gap-2">
          <FlexRow className="items-center justify-between gap-3">
            <FlexCol className="min-w-0 flex-1 gap-0.5">
              <Typography type={TypographyType.Footnote} bold>
                {isWorking ? 'Working' : 'Hunting'}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
                className="min-w-0 truncate"
              >
                {isRunning
                  ? cadenceCopy[interest?.cadence ?? 'daily']
                  : 'No scheduled runs'}
              </Typography>
            </FlexCol>
            <Switch
              inputId="agent-run-switch"
              name="agent-run-switch"
              compact
              checked={isRunning}
              onToggle={() =>
                update({
                  status: isRunning
                    ? UserInterestStatus.Paused
                    : UserInterestStatus.Active,
                })
              }
            />
          </FlexRow>

          {interest?.lastRunAt && (
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
            >
              {'Last run '}
              <DateFormat
                date={interest.lastRunAt}
                type={TimeFormatType.Post}
              />
            </Typography>
          )}

          <span className="h-px bg-border-subtlest-tertiary" />

          <FlexCol className="gap-0.5">
            <MenuRow
              icon={<TimerIcon size={IconSize.Size16} />}
              label="View activity"
              onClick={openActivity}
            />
            <MenuRow
              icon={<SettingsIcon size={IconSize.Size16} />}
              label="Agent settings"
              onClick={() => setSettingsOpen(true)}
            />
          </FlexCol>
        </FlexCol>
      </PopoverContent>
    </Popover>
  );
};
