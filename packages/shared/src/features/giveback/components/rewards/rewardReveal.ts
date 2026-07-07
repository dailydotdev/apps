import type { ContributionRewardTier } from '../../types';
import { ContributionRewardType } from '../../types';
import { cloudinaryCharmInviteFriends } from '../../../../lib/image';

// The reward-claim "reveal": the cinematic pop-up shown after a contributor
// claims a reward tier on the journey. Each reward gets a bespoke payoff moment
// instead of a generic toast, resolved from the tier's `rewardType` and its
// per-type `metadata` (amount → cores, days → plus, percent → discount). The
// tier's own title/description carry the copy.

export type RevealKind =
  | 'note' // grateful/funny "note from daily.dev" card (joke + fallback)
  | 'mascotHug' // "picture with Patchy"
  | 'trivia' // scratch-to-reveal fact about daily.dev
  | 'cores' // parameterized by amount
  | 'plus' // parameterized by duration
  | 'swagDiscount' // store discount, parameterized by percent
  | 'suggestCause' // right to nominate a cause
  | 'council'; // seat in the private Slack

export interface RewardReveal {
  kind: RevealKind;
  headline: string;
  body: string;
  // note: rubber-stamp word + a big sticker emoji.
  stamp?: string;
  emoji?: string;
  // trivia: the single fact revealed on the scratch card.
  fact?: string;
  // cores: how many.
  amount?: number;
  // plus: duration label ("1 week", "1 year").
  duration?: string;
  // swagDiscount: discount percent.
  percent?: number;
  // an anchor illustration where one helps (e.g. Patchy).
  image?: string;
}

// Format a Plus grant's day count into the human label the reveal shows.
const formatPlusDuration = (days?: number): string | undefined => {
  if (!days) {
    return undefined;
  }
  const units: ReadonlyArray<[number, string]> = [
    [365, 'year'],
    [30, 'month'],
    [7, 'week'],
    [1, 'day'],
  ];
  const [size, label] = units.find(([unit]) => days % unit === 0) ?? [1, 'day'];
  const count = days / size;
  return `${count} ${label}${count > 1 ? 's' : ''}`;
};

// Resolve the reveal for a claimed reward tier from its type + metadata. `note`
// is the safe fallback for jokes and any unmapped type.
export const resolveRewardReveal = (
  reward: ContributionRewardTier,
): RewardReveal => {
  const body =
    reward.description ?? 'A little something from us for backing the causes.';

  switch (reward.rewardType) {
    case ContributionRewardType.Cores:
      return {
        kind: 'cores',
        amount: reward.metadata.amount,
        headline: `+${reward.title}, landed.`,
        body: 'Yours to spend across daily.dev. Keep them coming.',
      };
    case ContributionRewardType.PlusDays:
      return {
        kind: 'plus',
        duration: formatPlusDuration(reward.metadata.days),
        headline: 'Plus, unlocked.',
        body: 'Ad-free, custom feeds, the works. Starts the moment you claim.',
      };
    case ContributionRewardType.StoreDiscount:
      return {
        kind: 'swagDiscount',
        percent: reward.metadata.percent,
        headline: 'A little surprise is waiting.',
        body: "You've unlocked a contributor discount. Open the gift to see what's inside.",
      };
    case ContributionRewardType.PatchyPicture:
      return {
        kind: 'mascotHug',
        headline: "Patchy's got you.",
        body: 'Save it, post it, make it your PFP. Patchy already signed the model release.',
        image: cloudinaryCharmInviteFriends,
      };
    case ContributionRewardType.Trivia:
      return {
        kind: 'trivia',
        headline: reward.title,
        body: 'Scratch the card to reveal it.',
        fact: reward.description ?? undefined,
      };
    case ContributionRewardType.SuggestCauses:
      return { kind: 'suggestCause', headline: reward.title, body };
    case ContributionRewardType.Council:
      return { kind: 'council', headline: reward.title, body };
    case ContributionRewardType.Joke:
    case ContributionRewardType.Custom:
    default:
      // A grateful/funny "note from daily.dev" — the safe, always-available
      // payoff for a joke reward or any unmapped type.
      return {
        kind: 'note',
        emoji: '💛',
        stamp: 'Unlocked',
        headline: reward.title,
        body,
      };
  }
};

// ---------------------------------------------------------------------------
// Founding award — the journey's special FIRST step. A one-time, limited
// "First 1,000 contributors" gift: a Patchy award + Cores from the CEO.
//
// PLACEHOLDER: there is no backend contract for the founding award yet, so the
// spot count, member number, and CEO note below are frontend placeholders to be
// wired to live data before this leaves the flag.
// ---------------------------------------------------------------------------

export type FoundingAwardState = 'intro' | 'claimable' | 'claimed' | 'soldOut';

export interface FoundingAward {
  name: string;
  image: string;
  coresValue: number;
}

export const PATCHY_FOUNDING_AWARD: FoundingAward = {
  name: 'Founding Patchy',
  image: cloudinaryCharmInviteFriends,
  coresValue: 1000,
};

export const FOUNDING_AWARD = {
  totalSpots: 1000,
  ceoName: 'Nimrod',
  ceoTitle: 'Co-founder & CEO',
  ceoNote:
    "You're one of the very first to back this. Thank you for helping us grow the right way. The Cores are on me.",
  // PLACEHOLDER counts until the backend exposes real founding-award figures.
  placeholderClaimedCount: 743,
  placeholderMemberNumber: 744,
};
