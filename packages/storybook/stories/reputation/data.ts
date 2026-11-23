import {
  REPUTATION_GRANT_THRESHOLD,
  reputationMilestones,
} from '@dailydotdev/shared/src/components/analytics/reputation/common';
import { reputation as reputationDocsUrl } from '@dailydotdev/shared/src/lib/constants';

// Production numbers the first reputation moment is drawn from. Amounts
// match daily-api's reputationReasonAmount (src/entity/ReputationEvent.ts),
// and every account starts at 10 (User.reputation default).

export const STARTING_REPUTATION = 10;

export enum FirstReason {
  Comment = 'comment',
  Post = 'post',
  Report = 'report',
  Quest = 'quest',
}

export interface FirstReputation {
  reason: FirstReason;
  amount: number;
  /** What the earned line names: "Your comment earned …". */
  subject: string;
  /** The secondary button, which opens the thing that earned it. */
  seeLabel: string;
  /** A line quoting what earned it, as the user wrote or saw it. */
  quote: string;
}

export const firstReputations: Record<FirstReason, FirstReputation> = {
  [FirstReason.Comment]: {
    reason: FirstReason.Comment,
    amount: 50,
    subject: 'Your comment',
    seeLabel: 'See your comment',
    quote:
      'We moved our cache in front of the API and p95 dropped from 900ms to 120ms.',
  },
  [FirstReason.Post]: {
    reason: FirstReason.Post,
    amount: 10,
    subject: 'Your post',
    seeLabel: 'See your post',
    quote: 'Scaling our cache layer without a rewrite',
  },
  [FirstReason.Report]: {
    reason: FirstReason.Report,
    amount: 100,
    subject: 'Your report',
    seeLabel: 'See the post',
    quote: 'Reported as spam, and moderators agreed',
  },
  [FirstReason.Quest]: {
    reason: FirstReason.Quest,
    amount: 20,
    subject: 'Your quest',
    seeLabel: 'See your quests',
    quote: 'Weekly quest: comment on 3 posts',
  },
};

export const privilegesThreshold = REPUTATION_GRANT_THRESHOLD;

/** The milestones on the road to 250, from the analytics tab's list. */
export const roadMilestones = reputationMilestones.filter(
  (milestone) => milestone.reputation <= REPUTATION_GRANT_THRESHOLD,
);

export const privilegeUnlocks =
  reputationMilestones.find(
    (milestone) => milestone.reputation === REPUTATION_GRANT_THRESHOLD,
  )?.unlocks ?? [];

export const reputationPageUrl = '/analytics/reputation';
// The docs page has no stable privileges anchor yet; this is the one to add.
export const privilegesDocsUrl = `${reputationDocsUrl}#privileges`;
