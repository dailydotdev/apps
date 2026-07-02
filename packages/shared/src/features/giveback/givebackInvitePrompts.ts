// Copy for the header/rail gift entry point. This surface is an ACQUISITION
// hook, not a personal tracker: most people never contribute, and we don't
// track per-user interactions here. Every prompt is generic + community-framed
// and exists to pull the user into /giveback. Voice follows the giveback
// "honest trade" system: you help us grow, we redirect the budget to causes you
// pick, you never pay. Org rules: "daily.dev" lowercase; never state a user
// count (money-raised figures are fine).

export interface GivebackInvitePromptData {
  id: string;
  // Small kicker above the headline (e.g. a live/community tag).
  eyebrow?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  // Festive community moment — fires confetti + glow. Use sparingly.
  celebrate?: boolean;
}

// A rotating set so the header stays fresh and hits different motivations:
// social proof, how-it-works/no-cost, cause spotlight, and a plain invite.
export const givebackInvitePrompts: GivebackInvitePromptData[] = [
  {
    id: 'community-raised',
    eyebrow: 'Raised together',
    headline: 'The community just crossed $12,340 for good causes',
    body: 'All of it funded by everyday daily.dev activity — not out of anyone’s pocket.',
    ctaLabel: 'Join in',
    celebrate: true,
  },
  {
    id: 'how-it-works',
    eyebrow: 'No cost to you',
    headline: 'Turn your daily.dev activity into real donations',
    body: 'You help us grow, we redirect the budget to causes you pick. You never pay a cent.',
    ctaLabel: 'See how it works',
  },
  {
    id: 'cause-funded',
    eyebrow: 'Just funded',
    headline: 'Dev scholarships just got a boost 🎓',
    body: 'Choose which real-world causes your daily.dev activity backs.',
    ctaLabel: 'Pick your causes',
    celebrate: true,
  },
  {
    id: 'invite',
    eyebrow: 'Two clicks',
    headline: 'Give back while you read',
    body: 'Developers are turning their daily habit into donations right now. Add yours.',
    ctaLabel: 'Start giving back',
  },
];
