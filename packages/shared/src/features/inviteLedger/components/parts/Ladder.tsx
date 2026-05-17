import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  formatStep,
  getCurrentInviteTier,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
  INVITE_MILESTONES,
} from '../../milestones';
import type { InviteMilestone } from '../../milestones';

interface LadderProps {
  invitesAccepted: number;
  className?: string;
  variant?: 'page' | 'modal';
}

type RowState = 'unlocked' | 'next' | 'locked';

const STATE_FOR = (
  milestone: InviteMilestone,
  invites: number,
  next: InviteMilestone | null,
): RowState => {
  if (invites >= milestone.invites) {
    return 'unlocked';
  }
  if (next && milestone.invites === next.invites) {
    return 'next';
  }
  return 'locked';
};

const RewardCell = ({
  milestone,
  faded,
}: {
  milestone: InviteMilestone;
  faded: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-mono tabular-nums typo-caption1',
      faded ? 'text-text-quaternary' : 'text-text-tertiary',
    )}
  >
    {milestone.rewards.map((reward, idx) => (
      <span
        key={reward.label}
        className={classNames(
          idx === 0 && (faded ? 'text-text-tertiary' : 'text-text-primary'),
        )}
      >
        {idx > 0 && (
          <span aria-hidden className="mr-1.5 text-text-quaternary">
            ·
          </span>
        )}
        {reward.label}
      </span>
    ))}
  </span>
);

/**
 * The ladder. Six rows. Each row is a line in the field report:
 *   №01  Your first bring-in        ✓      100 Cores
 * No icons, no decoration — just the fact + state + reward.
 */
export const Ladder = ({
  invitesAccepted,
  className,
  variant = 'page',
}: LadderProps): ReactElement => {
  const next = getNextInviteMilestone(invitesAccepted);
  const current = getCurrentInviteTier(invitesAccepted);
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);

  return (
    <ol className={classNames('flex flex-col', className)}>
      {INVITE_MILESTONES.map((milestone, idx) => {
        const state = STATE_FOR(milestone, invitesAccepted, next);
        const faded = state === 'locked';
        const isFirst = idx === 0;
        const isCurrent = current?.step === milestone.step;

        let stateBadge: ReactElement;
        if (state === 'unlocked') {
          stateBadge = (
            <span
              className={classNames(
                'font-mono tabular-nums',
                isCurrent
                  ? 'text-accent-avocado-default'
                  : 'text-text-tertiary',
              )}
            >
              ✓
            </span>
          );
        } else if (state === 'next') {
          stateBadge = (
            <span className="font-mono tabular-nums text-accent-cabbage-default">
              {invitesAccepted}/{milestone.invites}
            </span>
          );
        } else {
          stateBadge = (
            <span className="font-mono tabular-nums text-text-quaternary">
              {milestone.invites}
            </span>
          );
        }

        return (
          <li
            key={milestone.step}
            className={classNames(
              'grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-2',
              !isFirst && 'border-t border-border-subtlest-tertiary',
              variant === 'modal' && 'py-1.5',
            )}
          >
            <span
              className={classNames(
                'font-mono font-semibold tabular-nums tracking-[0.04em] typo-caption1',
                state === 'next'
                  ? 'text-accent-cabbage-default'
                  : 'text-text-quaternary',
              )}
            >
              №{formatStep(milestone.step)}
            </span>
            <span
              className={classNames(
                'font-bold typo-footnote',
                faded ? 'text-text-tertiary' : 'text-text-primary',
              )}
            >
              {milestone.title}
            </span>
            <span className="typo-caption1">{stateBadge}</span>
            <span aria-hidden />
            <div className="col-span-2">
              <RewardCell milestone={milestone} faded={faded} />
            </div>
          </li>
        );
      })}

      {next && invitesAway > 0 && variant === 'page' && (
        <li className="border-t border-border-subtlest-tertiary pt-2 font-mono text-text-tertiary typo-caption1">
          <span className="text-text-quaternary">
            {invitesAway === 1
              ? 'One more bring-in'
              : `${invitesAway} more bring-ins`}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-text-primary">{next.title}</span>.
        </li>
      )}
    </ol>
  );
};
