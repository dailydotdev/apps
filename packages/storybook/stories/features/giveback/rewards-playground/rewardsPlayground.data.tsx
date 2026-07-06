import { ContributionRewardType } from '@dailydotdev/shared/src/features/giveback/types';
import {
  cloudinaryCharmInviteFriends,
  cloudinaryCharmReadLater,
} from '@dailydotdev/shared/src/lib/image';

// PLAYGROUND ONLY. Design-iteration sandbox for the giveback reward journey.
//
// The reward SET is fixed (the list below). Each reward is a single generic
// TEMPLATE with parameters, so engineering assigns it to any level/rank and
// tunes the payload (Cores amount, Plus duration, swag %, trivia facts, …).
// `PLAYGROUND_TIERS` at the bottom is just an EXAMPLE ladder built from the
// templates — swap thresholds/params freely.

// The devil-emoji art the real Roast page uses.
export const ROAST_EMOJI_IMAGE =
  'https://media.daily.dev/image/upload/s--bLTH_SfU--/f_auto/v1707242870/public/Roast-emoji.png.png';

// The nine reward kinds we ship. Each maps to one reveal component.
export type RevealKind =
  | 'joke' // "parents will be proud" / "earn your place in heaven"
  | 'roast' // "get roasted"
  | 'mascotHug' // "picture with Patchy"
  | 'trivia' // "trivia facts about daily.dev"
  | 'cores' // parameterized by amount
  | 'plus' // parameterized by duration
  | 'swagDiscount' // parameterized by percent
  | 'suggestCause' // "get the right to suggest a cause"
  | 'council'; // "access to daily.dev council"

// perk = tangible (Cores, Plus, swag) · privilege = access/say (cause, council)
// · fun = a laugh/flex (jokes, roast, Patchy, trivia).
export type TierCategory = 'perk' | 'privilege' | 'fun';

export interface PlaygroundReveal {
  kind: RevealKind;
  headline: string;
  body: string;
  // joke: rubber-stamp word + a big sticker emoji.
  stamp?: string;
  emoji?: string;
  // trivia: the single secret revealed at this level.
  fact?: string;
  // roast: canned roast text for the mock.
  roastText?: string;
  // cores: how many.
  amount?: number;
  // plus: duration label ("1 week", "1 year").
  duration?: string;
  // swag: discount percent + code.
  percent?: number;
  code?: string;
  // council: the private channel.
  channel?: string;
  // an anchor illustration where one helps.
  image?: string;
}

export interface PlaygroundTier {
  id: string;
  title: string;
  // Approved points needed to unlock. Points map 1:1 to dollars donated.
  threshold: number;
  category: TierCategory;
  // Picks the ladder marker's icon (the shared node maps 5 reward types).
  rewardType: ContributionRewardType;
  description: string;
  claimCta: string;
  reveal: PlaygroundReveal;
}

// The pool of secrets — one is revealed per level. Org rules: brand stays
// lowercase, never an explicit user count.
export const TRIVIA_FACTS = [
  'daily.dev began as a browser extension that took over your new-tab page.',
  'The mascot is a dog named Patchy. He does not, and will not, fetch.',
  'The color palette is food-themed. There is genuinely a shade called "bacon".',
  'The whole product runs on one belief: your feed should respect your time.',
  'Millions of developers open daily.dev to start the day. You help fund where that goes.',
];

// ---------------------------------------------------------------------------
// Reward templates — ONE per reward, each generic + parameterized. Engineering
// calls these with the level's threshold and payload.
// ---------------------------------------------------------------------------

// A joke / grateful-message reward. ONE generic template — the whole payload
// (id, title, the big sticker emoji, the rubber stamp, headline + body) is the
// parameter, so a level can generate any grateful/funny message and drop it in.
export interface JokeMessage {
  id: string;
  title: string;
  claimCta: string;
  description: string;
  // The oversized sticker emoji at the top of the card.
  emoji: string;
  // The rubber-stamp "seal of approval" word.
  stamp: string;
  headline: string;
  body: string;
}

export const rewardTemplates = {
  // Fun — a joke/grateful message. Pass any generated message payload.
  joke: (threshold: number, message: JokeMessage): PlaygroundTier => ({
    id: message.id,
    title: message.title,
    threshold,
    category: 'fun',
    rewardType: ContributionRewardType.Custom,
    description: message.description,
    claimCta: message.claimCta,
    reveal: {
      kind: 'joke',
      emoji: message.emoji,
      stamp: message.stamp,
      headline: message.headline,
      body: message.body,
    },
  }),
  getRoasted: (threshold: number): PlaygroundTier => ({
    id: 'roast',
    title: 'Get roasted',
    threshold,
    category: 'fun',
    rewardType: ContributionRewardType.Custom,
    description: "You've earned the right to be humbled. By us.",
    claimCta: 'Roast me',
    reveal: {
      kind: 'roast',
      headline: 'Brace yourself.',
      body: 'Built from your reading history. You asked for this.',
      image: ROAST_EMOJI_IMAGE,
      roastText:
        'Your profile says "senior engineer." Your bookmarks say "saved 400 articles, opened 3." You star repos the way other people hoard tote bags: great intentions, zero follow-through. Your VS Code has 38 tabs open, none of them the one you\'re looking for. You\'ve read "10 habits of 10x developers" four times and adopted exactly none. Your side project folder is a graveyard with better commit messages than your day job. Your terminal history is 90 percent "git status" and "clear." You have named three different side projects "final" and shipped precisely zero of them. You rewrite your portfolio more often than you push to prod. Your "quick refactor" is now a 400-file pull request that nobody will ever review. You have strong opinions about tabs versus spaces but none about your unit tests, which do not exist. You bookmarked this giveback page, closed it, reopened it a week later, and called that "commitment." You came here to donate to a good cause, got distracted by the feed for 45 minutes, and called it "research." We see all of it. And honestly? We funded a cause anyway. You\'re still one of the good ones.',
    },
  }),
  pictureWithPatchy: (threshold: number): PlaygroundTier => ({
    id: 'patchy-hug',
    title: 'Picture with Patchy',
    threshold,
    category: 'fun',
    rewardType: ContributionRewardType.Custom,
    description: 'Our mascot wants a photo with you. Non-negotiable.',
    claimCta: 'Get your hug',
    reveal: {
      kind: 'mascotHug',
      headline: "Patchy's got you.",
      body: 'Save it, post it, make it your PFP. Patchy already signed the model release.',
      image: cloudinaryCharmInviteFriends,
    },
  }),
  // ONE secret per level — engineering passes the single fact for this level;
  // the next level reveals the next one.
  secret: (threshold: number, fact: string): PlaygroundTier => ({
    id: 'trivia',
    title: 'daily.dev secret',
    threshold,
    category: 'fun',
    rewardType: ContributionRewardType.Custom,
    description: 'Scratch to reveal a hidden secret about daily.dev.',
    claimCta: 'Scratch the card',
    reveal: {
      kind: 'trivia',
      headline: 'A secret, unlocked.',
      body: 'Scratch the card to reveal it. A new secret unlocks every time you level up.',
      fact,
    },
  }),

  // Perks — the customizable payload lives in the params.
  cores: (threshold: number, amount: number): PlaygroundTier => ({
    id: `cores-${amount}`,
    title: `${amount.toLocaleString()} Cores`,
    threshold,
    category: 'perk',
    rewardType: ContributionRewardType.Cores,
    description: 'Spend them anywhere across daily.dev. On us.',
    claimCta: `Claim ${amount.toLocaleString()} Cores`,
    reveal: {
      kind: 'cores',
      amount,
      headline: `+${amount.toLocaleString()} Cores, landed.`,
      body: 'Yours to spend across daily.dev. Keep them coming.',
    },
  }),
  plus: (threshold: number, duration: string): PlaygroundTier => ({
    id: `plus-${duration.replace(/\s+/g, '-').toLowerCase()}`,
    title: `${duration} of Plus`,
    threshold,
    category: 'perk',
    rewardType: ContributionRewardType.PlusDays,
    description: 'The full daily.dev experience, our treat.',
    claimCta: `Claim ${duration} of Plus`,
    reveal: {
      kind: 'plus',
      duration,
      headline: `Plus, unlocked for ${duration}.`,
      body: 'Ad-free, custom feeds, the works. Starts the moment you claim.',
    },
  }),
  swagDiscount: (
    threshold: number,
    percent: number,
    code: string,
  ): PlaygroundTier => ({
    id: 'swag-discount',
    title: `${percent}% off the swag store`,
    threshold,
    category: 'perk',
    rewardType: ContributionRewardType.Custom,
    description: 'A contributor-only discount on the swag store.',
    claimCta: 'Claim your code',
    reveal: {
      kind: 'swagDiscount',
      percent,
      code,
      headline: 'A little surprise is waiting.',
      body: "You've unlocked a contributor reward. Open the gift to see what's inside.",
    },
  }),

  // Privileges.
  suggestCause: (threshold: number): PlaygroundTier => ({
    id: 'suggest-cause',
    title: 'Suggest a cause',
    threshold,
    category: 'privilege',
    rewardType: ContributionRewardType.Privilege,
    description: 'Nominate the charities daily.dev donates to.',
    claimCta: 'Suggest a cause',
    reveal: {
      kind: 'suggestCause',
      headline: 'You can suggest causes.',
      body: 'Nominate a nonprofit or open-source fund. If it fits, it joins the causes everyone can donate to.',
    },
  }),
  council: (threshold: number, channel: string): PlaygroundTier => ({
    id: 'council',
    title: 'daily.dev Council',
    threshold,
    category: 'privilege',
    rewardType: ContributionRewardType.Privilege,
    description: 'A seat in our private Slack. Help shape what we build next.',
    claimCta: 'Take your seat',
    reveal: {
      kind: 'council',
      channel,
      headline: 'Welcome to the Council.',
      body: "This is our internal Slack. You've got a seat next to the daily.dev team, in the same channels where we decide what to build next.",
    },
  }),
};

// Example ladder built from the templates (low → high). Cores stay < 5,000 (the
// post-boost threshold). Engineering swaps thresholds/params per real level.
export const PLAYGROUND_TIERS: PlaygroundTier[] = [
  rewardTemplates.joke(25, {
    id: 'parents-proud',
    title: 'Your parents will be proud',
    claimCta: 'Make them proud',
    description: 'Proof you finally used the internet for good. Frame it.',
    emoji: '🥹',
    stamp: 'Officially proud',
    headline: 'Your parents are proud of you.',
    body: 'You turned everyday scrolling into real donations. Somewhere, a parent is telling a neighbor about you right now.',
  }),
  rewardTemplates.cores(100, 250),
  rewardTemplates.secret(200, TRIVIA_FACTS[0]),
  rewardTemplates.pictureWithPatchy(400),
  rewardTemplates.plus(650, '1 week'),
  rewardTemplates.joke(900, {
    id: 'heaven',
    title: 'Earn your place in heaven',
    claimCta: 'Claim your spot',
    description: 'We put in a good word upstairs. Results may vary.',
    emoji: '😇',
    stamp: 'Pre-approved',
    headline: 'Your spot in heaven is reserved.',
    body: 'Turns out funding real causes counts for something up there. Cloud nine, window seat, your name on the door.',
  }),
  rewardTemplates.cores(1400, 1000),
  rewardTemplates.getRoasted(2200),
  rewardTemplates.swagDiscount(3200, 50, 'GIVEBACK50'),
  rewardTemplates.suggestCause(5000),
  rewardTemplates.plus(9000, '1 year'),
  rewardTemplates.council(15000, '#council'),
];

// ---------------------------------------------------------------------------
// Founding award — the journey's special FIRST step (unchanged). A one-time,
// limited "First 1,000 contributors" gift: a Patchy award + Cores from the CEO.
// ---------------------------------------------------------------------------

export interface PlaygroundAward {
  name: string;
  image: string;
  value: number;
}

export const PATCHY_FOUNDING_AWARD: PlaygroundAward = {
  name: 'Founding Patchy',
  image: cloudinaryCharmReadLater,
  value: 1000,
};

export const FOUNDING_AWARD = {
  totalSpots: 1000,
  ceoName: 'Nimrod',
  ceoTitle: 'Co-founder & CEO',
  ceoNote:
    "You're one of the very first to back this. Thank you for helping us grow the right way. The Cores are on me.",
};

export type FoundingAwardState = 'intro' | 'claimable' | 'claimed' | 'soldOut';
