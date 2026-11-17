import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import {
  BlockIcon,
  DiscussIcon,
  DownvoteIcon,
  FlagIcon,
  ReputationIcon,
  SourceIcon,
  UpvoteIcon,
} from '../../icons';
import {
  ReputationPeriod,
  ReputationReason,
} from '../../../graphql/reputation';
import { DevCardTheme, requiredPoints } from '../../profile/devcard/common';
import { LFG_REPUTATION_STEPS } from '../../../features/lfg/constants';

interface ReasonMeta {
  /** Plural label for totals: "Comment upvotes". */
  label: string;
  /** Singular label for one event: "Comment upvoted". */
  eventLabel: string;
  Icon: (props: IconProps) => ReactElement;
}

export const reasonMeta: Record<ReputationReason, ReasonMeta> = {
  [ReputationReason.PostUpvoted]: {
    label: 'Post upvotes',
    eventLabel: 'Post upvoted',
    Icon: UpvoteIcon,
  },
  [ReputationReason.CommentUpvoted]: {
    label: 'Comment upvotes',
    eventLabel: 'Comment upvoted',
    Icon: DiscussIcon,
  },
  [ReputationReason.SourceRequestApproved]: {
    label: 'Sources approved',
    eventLabel: 'Source request approved',
    Icon: SourceIcon,
  },
  [ReputationReason.PostReportConfirmed]: {
    label: 'Reports confirmed',
    eventLabel: 'Your report was confirmed',
    Icon: FlagIcon,
  },
  [ReputationReason.PostDownvoted]: {
    label: 'Post downvotes',
    eventLabel: 'Post downvoted',
    Icon: DownvoteIcon,
  },
  [ReputationReason.CommentDownvoted]: {
    label: 'Comment downvotes',
    eventLabel: 'Comment downvoted',
    Icon: DownvoteIcon,
  },
  [ReputationReason.PostBanned]: {
    label: 'Posts removed',
    eventLabel: 'Post removed by moderators',
    Icon: BlockIcon,
  },
  [ReputationReason.Manual]: {
    label: 'Granted by daily.dev',
    eventLabel: 'Granted by daily.dev',
    Icon: ReputationIcon,
  },
};

export const reputationPeriodLabel: Record<ReputationPeriod, string> = {
  [ReputationPeriod.Last30Days]: 'Last 30 days',
  [ReputationPeriod.Last90Days]: 'Last 90 days',
  [ReputationPeriod.LastYear]: 'Last year',
  [ReputationPeriod.AllTime]: 'All time',
};

export const reputationPeriodOptions = [
  ReputationPeriod.Last30Days,
  ReputationPeriod.Last90Days,
  ReputationPeriod.LastYear,
  ReputationPeriod.AllTime,
];

/** Below this, a member's upvotes do not grant reputation. */
export const REPUTATION_GRANT_THRESHOLD = 250;

export interface ReputationMilestone {
  reputation: number;
  unlocks: string[];
}

const fixedUnlocks: Record<number, string[]> = {
  100: ['No daily limit on how much you post and comment'],
  [REPUTATION_GRANT_THRESHOLD]: [
    'Your upvotes give reputation to others',
    'Suggest new sources for the feed',
    'Squads you run can show up in search and discovery',
  ],
};

const themeUnlocks = Object.entries(requiredPoints)
  .filter(([theme]) => theme !== DevCardTheme.Default)
  .map(([theme, reputation]) => ({
    reputation,
    unlock: `${theme.charAt(0).toUpperCase()}${theme.slice(1)} DevCard theme`,
  }));

const lfgUnlocks = LFG_REPUTATION_STEPS.map((reputation) => ({
  reputation,
  unlock: `Your Looking for group posts reach people filtering for ${reputation.toLocaleString('en-US')}+`,
}));

const milestoneReputations = [
  ...new Set([
    ...Object.keys(fixedUnlocks).map(Number),
    ...lfgUnlocks.map(({ reputation }) => reputation),
    ...themeUnlocks.map(({ reputation }) => reputation),
  ]),
].sort((a, b) => a - b);

export const reputationMilestones: ReputationMilestone[] =
  milestoneReputations.map((reputation) => ({
    reputation,
    unlocks: [
      ...(fixedUnlocks[reputation] ?? []),
      ...lfgUnlocks
        .filter((lfg) => lfg.reputation === reputation)
        .map(({ unlock }) => unlock),
      ...themeUnlocks
        .filter((theme) => theme.reputation === reputation)
        .map(({ unlock }) => unlock),
    ],
  }));

export interface MilestoneProgress {
  reached: ReputationMilestone[];
  next: ReputationMilestone | null;
  /** 0 to 1, from the previous milestone (or zero) to the next one. */
  progress: number;
}

export const getMilestoneProgress = (reputation: number): MilestoneProgress => {
  const reached = reputationMilestones.filter(
    (milestone) => reputation >= milestone.reputation,
  );
  const next =
    reputationMilestones.find(
      (milestone) => reputation < milestone.reputation,
    ) ?? null;

  if (!next) {
    return { reached, next, progress: 1 };
  }

  const from = reached.at(-1)?.reputation ?? 0;

  return {
    reached,
    next,
    progress: (reputation - from) / (next.reputation - from),
  };
};

export const formatSignedAmount = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US');

  if (amount > 0) {
    return `+${formatted}`;
  }

  return amount < 0 ? `−${formatted}` : formatted;
};

export const amountColor = (amount: number): string => {
  if (amount > 0) {
    return 'text-status-success';
  }

  return amount < 0 ? 'text-status-error' : 'text-text-tertiary';
};
