// Copy for the header/rail gift entry point. This surface is an ACQUISITION
// hook, not a personal tracker: most people never contribute, and we don't
// track per-user interactions here. The popover celebrates one thing only:
// a global campaign milestone being crossed, and exists to pull the user into
// /giveback. Voice follows the giveback "honest trade" system: you help us
// grow, we redirect the budget to causes you pick, you never pay. Org rules:
// "daily.dev" lowercase; never state a user count (money-raised figures are
// fine).

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

// The single popover variation. Global milestones are the only thing the header
// gift celebrates: a live community moment driven by a remote event, not a
// rotating set of generic invites. Falls back to a raised-amount headline when
// the milestone has no custom title. `value` maps 1:1 to currency.
export const buildGivebackMilestonePrompt = (
  milestone: ContributionMilestone,
): GivebackInvitePromptData => ({
  id: `milestone-${milestone.id}`,
  eyebrow: 'Milestone reached',
  headline:
    milestone.title ??
    `The community just crossed ${formatDonationAmount(
      milestone.value,
    )} for good causes`,
  body: 'All of it funded by everyday daily.dev activity, not out of anyone’s pocket.',
  ctaLabel: 'Join in',
  celebrate: true,
});
