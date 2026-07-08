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
  // `metadata` is a raw jsonb column, so guard against a null/absent value the
  // non-nullable type doesn't cover.
  const metadata = reward.metadata ?? {};

  switch (reward.rewardType) {
    case ContributionRewardType.Cores:
      // A Cores reveal is only meaningful with a real amount — its whole point
      // is the count-up. Without one, fall through to the note so we never show
      // a fabricated figure.
      if (typeof metadata.amount === 'number') {
        return {
          kind: 'cores',
          amount: metadata.amount,
          headline: `+${reward.title}, landed.`,
          body: 'Yours to spend across daily.dev. Keep them coming.',
        };
      }
      break;
    case ContributionRewardType.PlusDays:
      return {
        kind: 'plus',
        duration: formatPlusDuration(metadata.days),
        headline: 'Plus, unlocked.',
        body: 'Ad-free, custom feeds, the works. Starts the moment you claim.',
      };
    case ContributionRewardType.StoreDiscount:
      // Same as Cores: the discount percent is the payoff, so skip the reveal
      // rather than promising a made-up percentage.
      if (typeof metadata.percent === 'number') {
        return {
          kind: 'swagDiscount',
          percent: metadata.percent,
          headline: 'A little surprise is waiting.',
          body: "You've unlocked a contributor discount. Open the gift to see what's inside.",
        };
      }
      break;
    case ContributionRewardType.PatchyPicture:
      return {
        kind: 'mascotHug',
        headline: 'You and Patchy, official.',
        body: 'Save it, share it, make it your profile picture.',
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
      // Bespoke, already-unlocked copy — the tier's own title/description can
      // read as "earn the right to…", which is wrong once it's claimed.
      return {
        kind: 'suggestCause',
        headline: 'You help shape where it goes.',
        body: "Nominate a nonprofit or open-source fund you care about, and if it's a fit, it joins the causes everyone can back.",
      };
    case ContributionRewardType.Council:
      return { kind: 'council', headline: reward.title, body };
    default:
      break;
  }

  // A grateful/funny "note from daily.dev" — the safe, always-available payoff
  // for a joke reward, any unmapped type, or a value-driven reward whose
  // metadata is missing the value it needs.
  return {
    kind: 'note',
    emoji: '💛',
    stamp: 'Unlocked',
    headline: reward.title,
    body,
  };
};

// ---------------------------------------------------------------------------
// Founding award — the journey's special FIRST step. A one-time, limited
// "First 1,000 contributors" gift: a Patchy award + Cores from the CEO.
//
// Live spot count + the visitor's founding number come from the backend
// (`useContributionFoundingAward`). The values below are stable product content
// (the cap and the CEO's note), not per-visitor data.
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
  // Matches the backend cap (CONTRIBUTION_FOUNDING_LIMIT); the live query returns
  // it too, used as the display fallback before the query resolves.
  totalSpots: 1000,
  ceoName: 'Nimrod',
  ceoTitle: 'Co-founder & CEO',
  ceoImage:
    'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
  ceoNote:
    "You're one of the very first to back this. Thank you for helping us grow the right way. The Cores are on me.",
};
