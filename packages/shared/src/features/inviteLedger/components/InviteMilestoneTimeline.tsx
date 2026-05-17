import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  AddUserIcon,
  CoinIcon,
  DevPlusIcon,
  GiftIcon,
  LockIcon,
  MedalBadgeIcon,
  MegaphoneIcon,
  ReputationLightningIcon,
  SparkleIcon,
  SquadIcon,
  UserShareIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { InviteAccentTone, InviteMilestone } from '../milestones';
import {
  INVITE_MILESTONES,
  InviteRewardKind,
  InviteTier,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';

interface InviteMilestoneTimelineProps {
  invitesAccepted: number;
  variant?: 'modal' | 'page';
  className?: string;
}

type ToneStyles = {
  iconBg: string;
  iconText: string;
  ring: string;
  line: string;
  chip: string;
  pulse: string;
  textBold: string;
};

const TONE_STYLES: Record<InviteAccentTone, ToneStyles> = {
  cabbage: {
    iconBg: 'bg-accent-cabbage-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-cabbage-default/30',
    line: 'bg-accent-cabbage-default',
    chip: 'bg-accent-cabbage-subtlest text-accent-cabbage-bolder',
    pulse: 'bg-accent-cabbage-default/40',
    textBold: 'text-accent-cabbage-bolder',
  },
  bacon: {
    iconBg: 'bg-accent-bacon-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-bacon-default/30',
    line: 'bg-accent-bacon-default',
    chip: 'bg-accent-bacon-subtlest text-accent-bacon-bolder',
    pulse: 'bg-accent-bacon-default/40',
    textBold: 'text-accent-bacon-bolder',
  },
  cheese: {
    iconBg: 'bg-accent-cheese-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-cheese-default/30',
    line: 'bg-accent-cheese-default',
    chip: 'bg-accent-cheese-subtlest text-accent-cheese-bolder',
    pulse: 'bg-accent-cheese-default/40',
    textBold: 'text-accent-cheese-bolder',
  },
  water: {
    iconBg: 'bg-accent-water-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-water-default/30',
    line: 'bg-accent-water-default',
    chip: 'bg-accent-water-subtlest text-accent-water-bolder',
    pulse: 'bg-accent-water-default/40',
    textBold: 'text-accent-water-bolder',
  },
  avocado: {
    iconBg: 'bg-accent-avocado-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-avocado-default/30',
    line: 'bg-accent-avocado-default',
    chip: 'bg-accent-avocado-subtlest text-accent-avocado-bolder',
    pulse: 'bg-accent-avocado-default/40',
    textBold: 'text-accent-avocado-bolder',
  },
  onion: {
    iconBg: 'bg-accent-onion-bolder',
    iconText: 'text-white',
    ring: 'ring-accent-onion-default/30',
    line: 'bg-accent-onion-default',
    chip: 'bg-accent-onion-subtlest text-accent-onion-bolder',
    pulse: 'bg-accent-onion-default/40',
    textBold: 'text-accent-onion-bolder',
  },
};

const TIER_ICONS: Record<InviteTier, ReactElement> = {
  [InviteTier.FirstSpark]: <SparkleIcon size={IconSize.Small} secondary />,
  [InviteTier.OpenDoor]: <UserShareIcon size={IconSize.Small} secondary />,
  [InviteTier.InnerCircle]: <SquadIcon size={IconSize.Small} secondary />,
  [InviteTier.Crew]: (
    <ReputationLightningIcon size={IconSize.Small} secondary />
  ),
  [InviteTier.Vanguard]: <MedalBadgeIcon size={IconSize.Small} secondary />,
  [InviteTier.Ambassador]: <MegaphoneIcon size={IconSize.Small} secondary />,
};

const REWARD_ICONS: Record<InviteRewardKind, ReactElement> = {
  [InviteRewardKind.Cores]: (
    <CoinIcon size={IconSize.Size16} className="text-accent-cheese-default" />
  ),
  [InviteRewardKind.PlusDays]: (
    <DevPlusIcon
      size={IconSize.Size16}
      className="text-accent-avocado-default"
    />
  ),
  [InviteRewardKind.Cosmetic]: (
    <GiftIcon
      size={IconSize.Size16}
      className="text-accent-cabbage-default"
      secondary
    />
  ),
  [InviteRewardKind.Perk]: (
    <SparkleIcon size={IconSize.Size16} className="text-accent-bacon-default" />
  ),
};

interface MilestoneRowProps {
  milestone: InviteMilestone;
  isUnlocked: boolean;
  isNext: boolean;
  isLast: boolean;
  invitesAway: number;
  variant: 'modal' | 'page';
}

const MilestoneRow = ({
  milestone,
  isUnlocked,
  isNext,
  isLast,
  invitesAway,
  variant,
}: MilestoneRowProps): ReactElement => {
  const tone = TONE_STYLES[milestone.tone];
  const tierIcon = TIER_ICONS[milestone.tier];

  return (
    <div className="relative flex gap-3 pb-5">
      {!isLast && (
        <span
          aria-hidden
          className={classNames(
            'absolute left-5 top-11 w-0.5 rounded-full',
            isUnlocked ? tone.line : 'bg-border-subtlest-tertiary',
          )}
          style={{ height: 'calc(100% - 1.75rem)' }}
        />
      )}

      <div className="relative shrink-0">
        {isNext && (
          <span
            aria-hidden
            className={classNames(
              'pointer-events-none absolute -inset-2 animate-ping rounded-full blur-md',
              tone.pulse,
            )}
            style={{ animationDuration: '2200ms' }}
          />
        )}
        <span
          className={classNames(
            'relative flex size-10 items-center justify-center rounded-full ring-2 transition-colors',
            isUnlocked
              ? `${tone.iconBg} ${tone.iconText} ${tone.ring}`
              : 'bg-surface-float text-text-quaternary ring-border-subtlest-tertiary',
          )}
        >
          {isUnlocked ? (
            tierIcon
          ) : (
            <LockIcon size={IconSize.Small} className="text-text-quaternary" />
          )}
        </span>
        {isUnlocked && !isNext && (
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent-avocado-bolder ring-2 ring-background-default"
          >
            <VIcon size={IconSize.XXSmall} className="text-white" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={classNames(
              'inline-flex shrink-0 items-center gap-1 rounded-6 px-1.5 py-0.5 font-semibold tabular-nums typo-caption2',
              isNext
                ? `${tone.chip} ring-1 ring-inset ${tone.ring}`
                : 'bg-surface-float text-text-tertiary',
            )}
          >
            <AddUserIcon size={IconSize.XXSmall} />
            {milestone.invites}
          </span>
          <span
            className={classNames(
              'font-bold typo-callout',
              isUnlocked || isNext ? 'text-text-primary' : 'text-text-tertiary',
            )}
          >
            {milestone.label}
          </span>
          {isNext && invitesAway > 0 && (
            <span
              className={classNames(
                'rounded-6 px-1.5 py-0.5 font-semibold typo-caption2',
                tone.chip,
              )}
            >
              {invitesAway === 1
                ? '1 invite away'
                : `${invitesAway} invites away`}
            </span>
          )}
        </div>

        {variant === 'modal' && (
          <p
            className={classNames(
              'typo-footnote',
              isUnlocked || isNext
                ? 'text-text-secondary'
                : 'text-text-quaternary',
            )}
          >
            {milestone.blurb}
          </p>
        )}

        <ul className="flex flex-wrap gap-1.5">
          {milestone.rewards.map((reward) => (
            <li
              key={`${milestone.tier}-${reward.label}`}
              className={classNames(
                'inline-flex items-center gap-1 rounded-8 border px-2 py-1 typo-footnote',
                isUnlocked || isNext
                  ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
                  : 'border-border-subtlest-tertiary bg-transparent text-text-tertiary',
              )}
            >
              {REWARD_ICONS[reward.kind]}
              <span className="font-semibold">{reward.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const InviteMilestoneTimeline = ({
  invitesAccepted,
  variant = 'modal',
  className,
}: InviteMilestoneTimelineProps): ReactElement => {
  const next = useMemo(
    () => getNextInviteMilestone(invitesAccepted),
    [invitesAccepted],
  );
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);

  return (
    <ul className={classNames('flex flex-col', className)}>
      {INVITE_MILESTONES.map((milestone, index) => (
        <li key={milestone.tier}>
          <MilestoneRow
            milestone={milestone}
            isUnlocked={invitesAccepted >= milestone.invites}
            isNext={!!next && next.tier === milestone.tier}
            isLast={index === INVITE_MILESTONES.length - 1}
            invitesAway={invitesAway}
            variant={variant}
          />
        </li>
      ))}
    </ul>
  );
};
