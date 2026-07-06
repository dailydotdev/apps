import type { ContributionRewardTier } from '../../types';
import { ContributionRewardType } from '../../types';
import {
  cloudinaryCharm404,
  cloudinaryCharmInviteFriends,
} from '../../../../lib/image';

// The reward-claim "reveal": the cinematic pop-up shown after a contributor
// claims a reward tier on the journey. Each reward gets a bespoke payoff moment
// instead of a generic toast.
//
// The backend reward contract only carries a coarse `rewardType` (see
// `ContributionRewardType`), so the finer "fun" reveals (roast, trivia, Patchy,
// swag, council, suggest-a-cause) are matched here by a stable slug that the
// seeded reward tiers use as their id. `resolveRewardReveal` is the single place
// to extend when the backend starts sending an explicit reveal discriminator.

export type RevealKind =
  | 'note' // grateful/funny "note from daily.dev" card
  | 'roast' // "get roasted"
  | 'mascotHug' // "picture with Patchy"
  | 'trivia' // scratch-to-reveal secret about daily.dev
  | 'cores' // parameterized by amount
  | 'plus' // parameterized by duration
  | 'call' // a 1:1 with the team
  | 'swagDiscount' // parameterized by percent
  | 'suggestCause' // right to nominate a cause
  | 'council' // seat in the private Slack
  | 'privilege'; // generic access/prestige perk

export interface RewardReveal {
  kind: RevealKind;
  headline: string;
  body: string;
  // note: rubber-stamp word + a big sticker emoji.
  stamp?: string;
  emoji?: string;
  // trivia: the single secret revealed at this level.
  fact?: string;
  // roast: canned roast text (backend-generated in the real flow).
  roastText?: string;
  // cores: how many.
  amount?: number;
  // plus: duration label ("1 week", "1 year").
  duration?: string;
  // swag: discount percent.
  percent?: number;
  // council: the private channel.
  channel?: string;
  // an anchor illustration where one helps.
  image?: string;
}

// The devil-emoji art the Roast page already uses.
const ROAST_EMOJI_IMAGE =
  'https://media.daily.dev/image/upload/s--bLTH_SfU--/f_auto/v1707242870/public/Roast-emoji.png.png';

// Placeholder roast copy. In the live flow this is generated server-side from
// the contributor's reading history; kept here so the reveal is demoable behind
// the flag until that endpoint exists.
const PLACEHOLDER_ROAST_TEXT =
  'Your profile says "senior engineer." Your bookmarks say "saved 400 articles, opened 3." You star repos the way other people hoard tote bags: great intentions, zero follow-through. You have named three different side projects "final" and shipped precisely zero of them. You have strong opinions about tabs versus spaces but none about your unit tests, which do not exist. You came here to donate to a good cause, got distracted by the feed for 45 minutes, and called it "research." We see all of it. And honestly? We funded a cause anyway. You are still one of the good ones.';

// The pool of secrets — one is revealed per trivia level (picked deterministically
// per tier below). Org rules: brand stays lowercase, never an explicit user count.
const TRIVIA_FACTS: ReadonlyArray<string> = [
  'daily.dev began as a browser extension that took over your new-tab page.',
  'The mascot is a dog named Patchy. He does not, and will not, fetch.',
  'The color palette is food-themed. There is genuinely a shade called "bacon".',
  'The whole product runs on one belief: your feed should respect your time.',
  'Millions of developers open daily.dev to start the day. You help fund where that goes.',
];

// Slugs the seeded reward tiers align their ids to, so the bespoke reveals can
// be matched without a backend discriminator. Adding a reward here (or aligning
// a tier id to one) is all engineering needs to wire a new payoff.
export const RevealSlug = {
  Roast: 'roast',
  PatchyPicture: 'picture-with-patchy',
  Secret: 'daily-dev-secret',
  Swag: 'swag-discount',
  SuggestCause: 'suggest-a-cause',
  Council: 'council',
} as const;

const PRESETS: Record<string, RewardReveal> = {
  [RevealSlug.Roast]: {
    kind: 'roast',
    headline: 'Brace yourself.',
    body: 'Built from your reading history. You asked for this.',
    image: ROAST_EMOJI_IMAGE,
    roastText: PLACEHOLDER_ROAST_TEXT,
  },
  [RevealSlug.PatchyPicture]: {
    kind: 'mascotHug',
    headline: "Patchy's got you.",
    body: 'Save it, post it, make it your PFP. Patchy already signed the model release.',
    image: cloudinaryCharmInviteFriends,
  },
  [RevealSlug.Secret]: {
    kind: 'trivia',
    headline: 'A secret, unlocked.',
    body: 'Scratch the card to reveal it.',
    // `fact` is filled in per tier by resolveRewardReveal so different secret
    // levels reveal different facts.
  },
  [RevealSlug.Swag]: {
    kind: 'swagDiscount',
    headline: 'A little surprise is waiting.',
    body: "You've unlocked a contributor reward. Open the gift to see what's inside.",
    percent: 50,
  },
  [RevealSlug.SuggestCause]: {
    kind: 'suggestCause',
    headline: 'You can suggest causes.',
    body: 'Nominate a nonprofit or open-source fund. If it fits, it joins the causes everyone can donate to.',
  },
  [RevealSlug.Council]: {
    kind: 'council',
    headline: 'Welcome to the Council.',
    body: "This is our internal Slack. You've got a seat next to the daily.dev team, in the same channels where we decide what to build next.",
    channel: '#council',
  },
};

// Pull the leading number out of a reward title like "1,000 Cores" so the Cores
// reveal can size its coin art and count-up. Falls back to a sensible default.
const parseAmount = (title: string, fallback: number): number => {
  const match = title.replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : fallback;
};

// Pull a human duration ("1 week", "1 year") out of a Plus reward title.
const parseDuration = (title: string): string | undefined => {
  const match = title.match(/\d+\s*(day|week|month|year)s?/i);
  return match?.[0];
};

// Resolve the reveal for a reward tier. Bespoke presets win (matched by tier
// id/slug); everything else derives from the coarse reward type, with the
// tier's own title/description as the copy.
export const resolveRewardReveal = (
  reward: ContributionRewardTier,
): RewardReveal => {
  const preset = PRESETS[reward.id];
  if (preset) {
    if (preset.kind === 'trivia') {
      // Pick a fact deterministically from the tier so different secret levels
      // reveal different facts (and it stays stable across re-renders).
      const index = reward.thresholdPoints % TRIVIA_FACTS.length;
      return { ...preset, fact: TRIVIA_FACTS[index] };
    }
    return preset;
  }

  const body =
    reward.description ?? 'A little something from us for backing the causes.';

  switch (reward.rewardType) {
    case ContributionRewardType.Cores:
      return {
        kind: 'cores',
        amount: parseAmount(reward.title, 500),
        headline: `+${reward.title}, landed.`,
        body: 'Yours to spend across daily.dev. Keep them coming.',
      };
    case ContributionRewardType.PlusDays:
      return {
        kind: 'plus',
        duration: parseDuration(reward.title),
        headline: 'Plus, unlocked.',
        body: 'Ad-free, custom feeds, the works. Starts the moment you claim.',
      };
    case ContributionRewardType.Call:
      return {
        kind: 'call',
        headline: reward.title,
        body,
        image: cloudinaryCharm404,
      };
    case ContributionRewardType.Privilege:
      return { kind: 'privilege', headline: reward.title, body };
    case ContributionRewardType.Custom:
    default:
      // A grateful/funny "note from daily.dev" — the safe, always-available
      // payoff for a custom reward with no bespoke preset.
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
