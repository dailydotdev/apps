import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  CoinIcon,
  DevPlusIcon,
  GiftIcon,
  SparkleIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  INVITE_MILESTONES,
  InviteRewardKind,
  formatStep,
  getNextInviteMilestone,
} from '../milestones';
import type { InviteMilestone, InviteReward } from '../milestones';

interface InviteMilestoneTimelineProps {
  invitesAccepted: number;
  className?: string;
}

const REWARD_TONE: Record<InviteRewardKind, string> = {
  [InviteRewardKind.Cores]: 'text-accent-cheese-default',
  [InviteRewardKind.PlusDays]: 'text-accent-avocado-default',
  [InviteRewardKind.Cosmetic]: 'text-accent-cabbage-default',
  [InviteRewardKind.Perk]: 'text-accent-bacon-default',
};

const REWARD_ICON: Record<InviteRewardKind, ReactElement> = {
  [InviteRewardKind.Cores]: <CoinIcon size={IconSize.XXSmall} secondary />,
  [InviteRewardKind.PlusDays]: <DevPlusIcon size={IconSize.XXSmall} />,
  [InviteRewardKind.Cosmetic]: <GiftIcon size={IconSize.XXSmall} secondary />,
  [InviteRewardKind.Perk]: <SparkleIcon size={IconSize.XXSmall} />,
};

const RewardChip = ({
  reward,
  faded,
}: {
  reward: InviteReward;
  faded: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-4 px-1 py-px tabular-nums typo-caption2',
      faded ? 'text-text-quaternary' : 'text-text-secondary',
    )}
  >
    <span
      className={classNames(
        'shrink-0',
        faded ? 'opacity-50' : REWARD_TONE[reward.kind],
      )}
    >
      {REWARD_ICON[reward.kind]}
    </span>
    <span className="font-semibold">{reward.label}</span>
  </span>
);

type MilestoneState = 'unlocked' | 'next' | 'locked';

interface MilestoneRowProps {
  milestone: InviteMilestone;
  state: MilestoneState;
  invitesAway: number;
  isLast: boolean;
}

const PREFIX_TONE: Record<MilestoneState, string> = {
  unlocked: 'text-accent-avocado-default',
  next: 'text-accent-cabbage-default',
  locked: 'text-text-quaternary',
};

const Prefix = ({
  step,
  state,
}: {
  step: number;
  state: MilestoneState;
}): ReactElement => {
  const tone = PREFIX_TONE[state];
  return (
    <span className="flex w-9 shrink-0 items-center gap-1 pt-px">
      <span
        aria-hidden
        className={classNames(
          'size-1 shrink-0 rounded-full transition-colors',
          state === 'unlocked' && 'bg-accent-avocado-default',
          state === 'next' &&
            'bg-accent-cabbage-default shadow-[0_0_0_3px_var(--theme-overlay-active-cabbage)]',
          state === 'locked' && 'bg-text-quaternary',
        )}
      />
      <span
        className={classNames('font-mono tabular-nums typo-caption1', tone)}
      >
        {formatStep(step)}
      </span>
    </span>
  );
};

const MilestoneRow = ({
  milestone,
  state,
  invitesAway,
  isLast,
}: MilestoneRowProps): ReactElement => {
  const faded = state === 'locked';
  return (
    <li
      className={classNames(
        'flex items-start gap-2 py-2.5',
        !isLast && 'border-b border-border-subtlest-tertiary',
      )}
    >
      <Prefix step={milestone.step} state={state} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-none">
          <span
            className={classNames(
              'font-bold typo-footnote',
              faded ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {milestone.title}
          </span>
          <span
            className={classNames(
              'tabular-nums typo-caption2',
              faded ? 'text-text-quaternary' : 'text-text-tertiary',
            )}
          >
            · {milestone.invites}
          </span>
          {state === 'unlocked' && (
            <span className="inline-flex items-center gap-0.5 text-accent-avocado-default typo-caption2">
              <VIcon size={IconSize.XXSmall} />
            </span>
          )}
          {state === 'next' && (
            <span className="font-semibold text-accent-cabbage-default typo-caption2">
              · {invitesAway} to go
            </span>
          )}
        </div>

        <ul className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {milestone.rewards.map((reward) => (
            <RewardChip
              key={`${milestone.step}-${reward.label}`}
              reward={reward}
              faded={faded}
            />
          ))}
        </ul>
      </div>
    </li>
  );
};

export const InviteMilestoneTimeline = ({
  invitesAccepted,
  className,
}: InviteMilestoneTimelineProps): ReactElement => {
  const next = getNextInviteMilestone(invitesAccepted);

  return (
    <ol className={classNames('flex flex-col', className)}>
      {INVITE_MILESTONES.map((milestone, index) => {
        let state: MilestoneState = 'locked';
        if (invitesAccepted >= milestone.invites) {
          state = 'unlocked';
        } else if (next && next.step === milestone.step) {
          state = 'next';
        }
        const invitesAway = Math.max(0, milestone.invites - invitesAccepted);
        return (
          <MilestoneRow
            key={milestone.step}
            milestone={milestone}
            state={state}
            invitesAway={invitesAway}
            isLast={index === INVITE_MILESTONES.length - 1}
          />
        );
      })}
    </ol>
  );
};
