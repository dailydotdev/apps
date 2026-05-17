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
  /** When true, show the editorial blurb under each row. Off for compact use. */
  showBlurb?: boolean;
  className?: string;
}

const REWARD_TONE: Record<InviteRewardKind, string> = {
  [InviteRewardKind.Cores]: 'text-accent-cheese-default',
  [InviteRewardKind.PlusDays]: 'text-accent-avocado-default',
  [InviteRewardKind.Cosmetic]: 'text-accent-cabbage-default',
  [InviteRewardKind.Perk]: 'text-accent-bacon-default',
};

const REWARD_ICON: Record<InviteRewardKind, ReactElement> = {
  [InviteRewardKind.Cores]: <CoinIcon size={IconSize.Size16} secondary />,
  [InviteRewardKind.PlusDays]: <DevPlusIcon size={IconSize.Size16} />,
  [InviteRewardKind.Cosmetic]: <GiftIcon size={IconSize.Size16} secondary />,
  [InviteRewardKind.Perk]: <SparkleIcon size={IconSize.Size16} />,
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
      'inline-flex items-center gap-1 whitespace-nowrap rounded-6 border px-1.5 py-0.5 typo-caption1',
      faded
        ? 'border-border-subtlest-tertiary text-text-quaternary'
        : 'border-border-subtlest-secondary text-text-primary',
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

interface MilestoneRowProps {
  milestone: InviteMilestone;
  state: 'unlocked' | 'next' | 'locked';
  invitesAway: number;
  showBlurb: boolean;
  isLast: boolean;
}

const StateBadge = ({
  state,
  invitesAway,
}: Pick<MilestoneRowProps, 'state' | 'invitesAway'>): ReactElement | null => {
  if (state === 'unlocked') {
    return (
      <span className="inline-flex items-center gap-1 rounded-6 bg-accent-avocado-subtlest px-1.5 py-0.5 font-semibold text-accent-avocado-default typo-caption2">
        <VIcon size={IconSize.XXSmall} />
        Unlocked
      </span>
    );
  }
  if (state === 'next') {
    return (
      <span className="inline-flex items-center gap-1 rounded-6 bg-accent-cabbage-subtlest px-1.5 py-0.5 font-semibold text-accent-cabbage-default typo-caption2">
        {invitesAway === 1 ? '1 invite to go' : `${invitesAway} invites to go`}
      </span>
    );
  }
  return null;
};

const MilestoneRow = ({
  milestone,
  state,
  invitesAway,
  showBlurb,
  isLast,
}: MilestoneRowProps): ReactElement => {
  const faded = state === 'locked';
  return (
    <li
      className={classNames(
        'relative flex gap-3 py-3',
        !isLast && 'border-b border-border-subtlest-tertiary',
      )}
    >
      <span
        className={classNames(
          'shrink-0 select-none pt-0.5 font-mono tabular-nums typo-footnote',
          faded ? 'text-text-quaternary' : 'text-text-tertiary',
        )}
      >
        {formatStep(milestone.step)}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={classNames(
              'font-bold typo-callout',
              faded ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {milestone.title}
          </span>
          <span
            className={classNames(
              'rounded-6 px-1.5 py-0.5 tabular-nums typo-caption2',
              faded
                ? 'bg-surface-float text-text-quaternary'
                : 'bg-surface-float text-text-secondary',
            )}
          >
            {milestone.invites} {milestone.invites === 1 ? 'invite' : 'invites'}
          </span>
          <StateBadge state={state} invitesAway={invitesAway} />
        </div>

        {showBlurb && (
          <p
            className={classNames(
              'typo-footnote',
              faded ? 'text-text-quaternary' : 'text-text-secondary',
            )}
          >
            {milestone.blurb}
          </p>
        )}

        <ul className="flex flex-wrap gap-1.5">
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
  showBlurb = true,
  className,
}: InviteMilestoneTimelineProps): ReactElement => {
  const next = getNextInviteMilestone(invitesAccepted);

  return (
    <ol className={classNames('flex flex-col', className)}>
      {INVITE_MILESTONES.map((milestone, index) => {
        let state: MilestoneRowProps['state'] = 'locked';
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
            showBlurb={showBlurb}
            isLast={index === INVITE_MILESTONES.length - 1}
          />
        );
      })}
    </ol>
  );
};
