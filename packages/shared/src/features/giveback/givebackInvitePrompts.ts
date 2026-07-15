// Copy for the header/rail gift entry point. This surface is an ACQUISITION
// hook, not a personal tracker: most people never contribute, and we don't
// track per-user interactions here. The popover celebrates one thing only:
// a global campaign milestone being crossed, and exists to pull the user into
// /giveback.
//
// The honest trade (keep the framing accurate): developers do small marketing
// actions (share daily.dev, post, leave a review, cast a vote) that help more
// devs discover us; in return we redirect our ad/growth budget into real
// donations to causes the community picks. "Ad budgets buy clicks. Ours funds
// real causes." The user never pays a cent. Do NOT imply the money comes from
// everyday reading/usage.
//
// Org rules: "daily.dev" lowercase; never state a user count (money-raised
// figures are fine).

import { formatDonationAmount } from './utils';
import type { ContributionMilestone } from './types';

export interface GivebackInvitePromptData {
  id: string;
  // Small kicker above the headline (e.g. a live/community tag).
  eyebrow?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  // Festive community moment. Fires confetti + glow. Use sparingly.
  celebrate?: boolean;
}

interface MilestonePromptVariation {
  eyebrow: string;
  // Built from the crossed amount (maps 1:1 to currency).
  headline: (amount: string) => string;
  body: string;
  ctaLabel: string;
}

// A few takes on the same milestone moment, each hitting a different angle of
// the honest trade (ad-budget redirect, the shared pot, community actions, the
// causes). We pick one deterministically per milestone so a given threshold
// always reads the same, but different milestones stay fresh.
const MILESTONE_PROMPT_VARIATIONS: MilestonePromptVariation[] = [
  {
    eyebrow: 'Milestone reached',
    headline: (amount) => `${amount} redirected from ads to real causes`,
    body: 'Developers spread the word, we turn the growth budget into donations. You never pay a cent.',
    ctaLabel: 'See how it works',
  },
  {
    eyebrow: 'The pot just grew',
    headline: (amount) => `${amount} in the giveback pot`,
    body: 'Filled by developers sharing daily.dev, funded entirely by us. Pick where it goes.',
    ctaLabel: 'Choose your causes',
  },
  {
    eyebrow: 'Community milestone',
    headline: (amount) => `${amount} raised, one action at a time`,
    body: 'Every share, post, and review became a real donation. Never out of your pocket.',
    ctaLabel: 'Take an action',
  },
  {
    eyebrow: 'Funded together',
    headline: (amount) => `${amount} for the causes you choose`,
    body: "Our ad budget, redirected by developers spreading the word. You'll never pay a cent.",
    ctaLabel: 'Back a cause',
  },
];

// Deterministically pick a variation from the milestone's own threshold value,
// so the same milestone always shows the same copy while different ones vary.
const pickVariation = (milestone: ContributionMilestone) =>
  MILESTONE_PROMPT_VARIATIONS[
    Math.abs(Math.floor(milestone.value)) % MILESTONE_PROMPT_VARIATIONS.length
  ];

// The single popover type. Global milestones are the only thing the header gift
// celebrates: a live community moment driven by a remote event, not a rotating
// set of generic invites. A backend-authored `title` overrides the headline
// when present.
export const buildGivebackMilestonePrompt = (
  milestone: ContributionMilestone,
): GivebackInvitePromptData => {
  const variation = pickVariation(milestone);
  const amount = formatDonationAmount(milestone.value);

  return {
    id: `milestone-${milestone.id}`,
    eyebrow: variation.eyebrow,
    headline: milestone.title ?? variation.headline(amount),
    body: variation.body,
    ctaLabel: variation.ctaLabel,
    celebrate: true,
  };
};
