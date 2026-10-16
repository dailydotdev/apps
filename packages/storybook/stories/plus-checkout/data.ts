// Facts and copy shared by every Plus checkout story. Prices are the live
// Paddle USD prices; the feature order follows internal usage data (not in
// this public repo).

export type Cycle = 'annual' | 'monthly';

export const prices = {
  annual: {
    perMonth: '$7.49',
    today: '$89.99',
    cycleLabel: 'once a year',
    renews: 'Renews 8 Oct 2027 at $89.99',
    unit: '$7.49/mo',
    badge: '3 months free', // $89.99 vs 12 × $9.99 = $119.88
  },
  monthly: {
    perMonth: '$9.99',
    today: '$9.99',
    cycleLabel: 'every month',
    renews: 'Renews 8 Nov 2026 at $9.99',
    unit: '$9.99/mo',
    badge: undefined as string | undefined,
  },
  sale: { code: 'SUMMER50', label: '50% off', annualToday: '$44.99' },
};

export type Feature = {
  id: string;
  label: string;
  line: string;
  hero?: boolean;
};

// Ordered by what Plus members use and what buyers touch before paying.
export const features: Feature[] = [
  {
    id: 'brief',
    label: 'Presidential Briefing',
    line: 'What moved in your stack, on your schedule. 3–5 min.',
    hero: true,
  },
  {
    id: 'feeds',
    label: 'Custom feeds',
    line: 'Scoped to the tools, languages and topics you choose.',
    hero: true,
  },
  {
    id: 'ads',
    label: 'Ad-free',
    line: 'Every ad gone, in the feed and on posts.',
    hero: true,
  },
  {
    id: 'clean',
    label: 'AI-cleaned titles',
    line: 'Clickbait rewritten to say what the post says.',
  },
  {
    id: 'folders',
    label: 'Bookmark folders',
    line: 'Sort your saves into folders.',
  },
  {
    id: 'keywords',
    label: 'Keyword filters',
    line: 'Mute a word once; it stays muted in every feed.',
  },
  {
    id: 'api',
    label: 'Higher API rate limits',
    line: 'More requests for your scripts and MCP tools.',
  },
  {
    id: 'translate',
    label: 'Auto-translate your feed',
    line: 'Titles and summaries in your language.',
  },
  {
    id: 'quests',
    label: 'Bonus quest slots',
    line: 'Two extra quests for more XP, Reputation and Cores.',
  },
  {
    id: 'support',
    label: 'Priority support',
    line: 'Members-only Squad and faster answers from the team.',
  },
];

