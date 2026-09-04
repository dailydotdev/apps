// Reading streak milestone rewards. Mock data for the exploration.
//
// The streak ladder and the flame tier artwork come from the streak progression
// PR (#5613, feat/streak-progression-system). The PNGs are copied into the
// Storybook public folder, so everything here renders with the real assets.
//
// The catalogue mirrors the partner network we are working with: consumer
// brands, and every partner writes its own offer. Disney+ discounts a monthly
// price, Hulu gives a trial, Notion gives months of a plan, Uber gives money off
// rides. Nothing here is a real deal, but the shapes are the real shapes, so no
// component may assume one sentence structure fits all of them.

export enum StreakTier {
  Ember = 'ember',
  Spark = 'spark',
  Kindle = 'kindle',
  Flame = 'flame',
  Blaze = 'blaze',
  Firestorm = 'firestorm',
  Inferno = 'inferno',
  Scorcher = 'scorcher',
  EternalFlame = 'eternal-flame',
  Supernova = 'supernova',
  Legendary = 'legendary',
  Phoenix = 'phoenix',
  Titan = 'titan',
  Godflame = 'godflame',
}

export const tierArt = (tier: StreakTier): string =>
  `/streak-tiers/${tier}.png`;

export const sponsoredGiftArt = '/streak-tiers/sponsored-gift.png';

/** The shattered flame from the streak progression PR (#5613). */
export const streakBrokenArt = '/streak-tiers/streak-recover-cover.png';

export enum OfferCategory {
  Streaming = 'Streaming',
  Music = 'Music',
  Productivity = 'Productivity',
  Software = 'Software',
  Learning = 'Learning',
  Lifestyle = 'Lifestyle',
}

export interface Offer {
  id: string;
  brand: string;
  /** Partner-owned colour. Brand paint is data, not a theme token. */
  brandColor: string;
  /** Real favicon-resolution brand mark, downloaded into public/brand-logos. */
  logo: string;
  mark: string;
  tagline: string;
  headline: string;
  /** Two or three words. The version a coupon can shout. */
  short: string;
  /** What kind of deal it is, in one or two words. The card's top pill. */
  tag: string;
  /** The offer without the brand name in front, for cards that show both. */
  offerLine: string;
  /** The product being given, without the duration. */
  plan: string;
  value: string;
  category: OfferCategory;
  terms: string;
  expiresIn: string;
  /** Three facts, in the order a developer asks them. */
  bullets: [string, string, string];
  code: string;
  /** Real photography, for the layouts that lead with an image. */
  photo?: string;
  /** What daily.dev earns when the gift is claimed. Funds the giveback swap. */
  payout: number;
}

export const offers = {
  disneyplus: {
    id: 'disneyplus',
    brand: 'Disney+',
    brandColor: '#0B1B45',
    logo: '/brand-logos/disneyplus.png',
    mark: 'D+',
    tagline: 'Unlimited entertainment',
    headline: 'Disney+ for $4.99/mo for 3 months',
    short: '$4.99/mo',
    tag: 'Discount',
    offerLine: '$4.99/mo for 3 months',
    plan: 'Disney+ Standard',
    value: 'Save $27',
    category: OfferCategory.Streaming,
    terms: 'New and returning subscribers. Auto-renews at full price.',
    expiresIn: '14 days',
    bullets: [
      'Disney, Pixar, Marvel, Star Wars and National Geographic',
      'New and returning subscribers',
      'Renews at $10.99/mo after three months',
    ],
    code: 'DAILYDEV-DPLUS',
    photo: '/offer-art/cinema.jpg',
    payout: 8,
  },
  hulu: {
    id: 'hulu',
    brand: 'Hulu',
    brandColor: '#1CE783',
    logo: '/brand-logos/hulu.png',
    mark: 'H',
    tagline: 'Movies, shows & live TV',
    headline: '30 days free trial on Hulu',
    short: '30 days free',
    tag: 'Free trial',
    offerLine: '30 days free',
    plan: 'Hulu (with ads)',
    value: '$18 value',
    category: OfferCategory.Streaming,
    terms: 'New subscribers only, US.',
    expiresIn: '10 days',
    bullets: [
      'Full streaming library plus Hulu Originals',
      'New subscribers only, US',
      'Cancel any time before the trial ends',
    ],
    code: 'DAILYDEV-HULU30',
    photo: '/offer-art/popcorn.jpg',
    payout: 10,
  },
  notion: {
    id: 'notion',
    brand: 'Notion',
    brandColor: '#111111',
    logo: '/brand-logos/notion.png',
    mark: 'N',
    tagline: 'Notes, Tasks, AI',
    headline: '3 months of Notion Business, free',
    short: '3 months free',
    tag: 'Free months',
    offerLine: '3 months of Business',
    plan: 'Notion Business',
    value: '$180 value',
    category: OfferCategory.Productivity,
    terms: 'Teams of 10 or fewer.',
    expiresIn: '14 days',
    bullets: [
      'Business plan with unlimited Notion AI',
      'Teams of 10 or fewer',
      'Keeps your existing workspace',
    ],
    code: 'DAILYDEV-NOTION',
    photo: '/offer-art/workspace.jpg',
    payout: 20,
  },
  applemusic: {
    id: 'applemusic',
    brand: 'Apple Music',
    brandColor: '#FA2D48',
    logo: '/brand-logos/applemusic.png',
    mark: 'AM',
    tagline: '100M songs, ad-free',
    headline: '3 months of Apple Music on us',
    short: '3 months free',
    tag: 'Free trial',
    offerLine: '3 months free access',
    plan: 'Individual plan',
    value: '$32 value',
    category: OfferCategory.Music,
    terms: 'New subscribers. One offer per Apple ID.',
    expiresIn: '21 days',
    bullets: [
      'Over 100 million songs, no ads',
      'New subscribers, one offer per Apple ID',
      'Renews at $10.99/mo unless you cancel',
    ],
    code: 'DAILYDEV-AMUSIC',
    photo: '/offer-art/music.jpg',
    payout: 9,
  },
  spotify: {
    id: 'spotify',
    brand: 'Spotify',
    brandColor: '#1DB954',
    logo: '/brand-logos/spotify.png',
    mark: 'S',
    tagline: 'Music and podcasts',
    headline: 'Spotify Premium free for 2 months',
    short: '2 months free',
    tag: 'Free months',
    offerLine: '2 months of Premium',
    plan: 'Premium Individual',
    value: '$23 value',
    category: OfferCategory.Music,
    terms: 'New Premium accounts only.',
    expiresIn: '14 days',
    bullets: [
      'Ad-free listening and offline downloads',
      'New Premium accounts only',
      'Renews at $11.99/mo unless you cancel',
    ],
    code: 'DAILYDEV-SPOT2M',
    photo: '/offer-art/music.jpg',
    payout: 7,
  },
  nordvpn: {
    id: 'nordvpn',
    brand: 'NordVPN',
    brandColor: '#4687FF',
    logo: '/brand-logos/nordvpn.png',
    mark: 'N',
    tagline: 'Private, fast VPN',
    headline: '70% off a 2-year NordVPN plan',
    short: '70% off',
    tag: 'Discount',
    offerLine: '70% off a 2-year plan',
    plan: '2-year plan',
    value: 'Save $180',
    category: OfferCategory.Software,
    terms: 'New customers. 30 day money-back guarantee.',
    expiresIn: '7 days',
    bullets: [
      'Covers up to 10 devices',
      'New customers only',
      '30 day money-back guarantee',
    ],
    code: 'DAILYDEV-NORD70',
    photo: '/offer-art/workspace.jpg',
    payout: 22,
  },
  uber: {
    id: 'uber',
    brand: 'Uber One',
    brandColor: '#0E0E0E',
    logo: '/brand-logos/uber.png',
    mark: 'U',
    tagline: 'Rides and delivery',
    headline: '$25 off your next five rides',
    short: '$25 off',
    tag: 'Credit',
    offerLine: '$25 off five rides',
    plan: 'Uber One trial',
    value: '$25 off',
    category: OfferCategory.Lifestyle,
    terms: 'New Uber One members. Selected cities.',
    expiresIn: '30 days',
    bullets: [
      '$5 off each of your next five rides',
      'New Uber One members, selected cities',
      'Trial renews at $9.99/mo unless cancelled',
    ],
    code: 'DAILYDEV-UBER25',
    photo: '/offer-art/travel.jpg',
    payout: 12,
  },
  hellofresh: {
    id: 'hellofresh',
    brand: 'HelloFresh',
    brandColor: '#91C11E',
    logo: '/brand-logos/hellofresh.png',
    mark: 'HF',
    tagline: 'Recipe kits, delivered',
    headline: '16 free meals across your first 7 boxes',
    short: '16 free meals',
    tag: 'Free meals',
    offerLine: '16 meals across 7 boxes',
    plan: 'Weekly plan',
    value: '$180 value',
    category: OfferCategory.Lifestyle,
    terms: 'New customers. Selected countries.',
    expiresIn: '14 days',
    bullets: [
      'Free meals spread across your first seven boxes',
      'New customers, selected countries',
      'Skip or cancel any week',
    ],
    code: 'DAILYDEV-HF16',
    photo: '/offer-art/travel.jpg',
    payout: 25,
  },
  duolingo: {
    id: 'duolingo',
    brand: 'Duolingo',
    brandColor: '#58CC02',
    logo: '/brand-logos/duolingo.png',
    mark: 'D',
    tagline: 'Learn a language',
    headline: '2 months of Super Duolingo, free',
    short: '2 months free',
    tag: 'Free months',
    offerLine: '2 months of Super',
    plan: 'Super Duolingo',
    value: '$24 value',
    category: OfferCategory.Learning,
    terms: 'New Super subscribers.',
    expiresIn: '14 days',
    bullets: [
      'No ads, unlimited hearts, personalised practice',
      'New Super subscribers only',
      'Renews at $12.99/mo unless you cancel',
    ],
    code: 'DAILYDEV-DUO2M',
    photo: '/offer-art/workspace.jpg',
    payout: 6,
  },
  audible: {
    id: 'audible',
    brand: 'Audible',
    brandColor: '#F8991C',
    logo: '/brand-logos/audible.png',
    mark: 'A',
    tagline: 'Audiobooks and originals',
    headline: '3 months of Audible Premium Plus',
    short: '3 months free',
    tag: 'Free months',
    offerLine: '3 months of Premium Plus',
    plan: 'Premium Plus',
    value: '$45 value',
    category: OfferCategory.Lifestyle,
    terms: 'New members, US only.',
    expiresIn: '10 days',
    bullets: [
      'One credit a month plus the Plus catalogue',
      'New members, US only',
      'Renews at $14.95/mo unless you cancel',
    ],
    code: 'DAILYDEV-AUD3M',
    photo: '/offer-art/audio.jpg',
    payout: 10,
  },
} satisfies Record<string, Offer>;

export const offerList: Offer[] = Object.values(offers);

/** What we hand out on a milestone with no partner gift. Always ours. */
export interface FirstPartyReward {
  id: string;
  headline: string;
  detail: string;
  mark: string;
}

export const firstPartyRewards: FirstPartyReward[] = [
  {
    id: 'freeze',
    headline: 'A streak freeze, on the house',
    detail: 'Covers one missed day. Yours whether or not you ever use it.',
    mark: '🧊',
  },
  {
    id: 'cores',
    headline: '100 Cores',
    detail: 'Spend them on awards for posts and comments you liked.',
    mark: '◆',
  },
  {
    id: 'plus',
    headline: '7 days of daily.dev Plus',
    detail: 'Clean feed, smart digest, custom feeds. No card needed.',
    mark: '✦',
  },
];

export interface StreakMilestone {
  day: number;
  tier: StreakTier;
  /** The tier name doubles as the thing you brag about. */
  label: string;
  /** What the day gives. First-party unless `sponsored` is set. */
  reward: string;
  /** Sponsored gift days. Deliberately rare, and never two in a row. */
  sponsored?: boolean;
  /**
   * A daily.dev prize we keep hidden until the day is reached: Plus, a course,
   * a big Cores drop. The gift artwork on the ladder means exactly this, so a
   * wrapped box on the rail always reads as "not revealed yet".
   */
  mystery?: boolean;
  headline: string;
  subhead: string;
  /** Share of readers who ever get here. Drives how loud the moment is. */
  rarity: string;
}

export const streakLadder: StreakMilestone[] = [
  {
    day: 3,
    tier: StreakTier.Spark,
    label: 'Spark',
    reward: '10 Cores',
    headline: 'Three days in a row',
    subhead: 'The habit is catching.',
    rarity: '38% of readers',
  },
  {
    day: 5,
    tier: StreakTier.Kindle,
    label: 'Kindle',
    reward: '10 Cores',
    headline: 'Five days in a row',
    subhead: 'A working week, unbroken.',
    rarity: '24% of readers',
  },
  {
    day: 7,
    tier: StreakTier.Flame,
    label: 'Flame',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'A full week, unbroken',
    subhead: 'Seven days is where a habit stops being an accident.',
    rarity: '17% of readers',
  },
  {
    day: 14,
    tier: StreakTier.Blaze,
    label: 'Blaze',
    reward: '48h post boost',
    headline: 'Two weeks straight',
    subhead: 'You have read on daily.dev every day for a fortnight.',
    rarity: '9% of readers',
  },
  {
    day: 21,
    tier: StreakTier.Firestorm,
    label: 'Firestorm',
    reward: '50 Cores',
    headline: 'Twenty one days',
    subhead: 'Three weeks. Nothing has broken it yet.',
    rarity: '6% of readers',
  },
  {
    day: 30,
    tier: StreakTier.Inferno,
    label: 'Inferno',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'A full month, unbroken',
    subhead: 'Top 4% of everyone reading on daily.dev.',
    rarity: '4% of readers',
  },
  {
    day: 60,
    tier: StreakTier.Scorcher,
    label: 'Scorcher',
    reward: 'Mystery daily.dev prize',
    mystery: true,
    headline: 'Sixty days',
    subhead: 'Two months without missing a single day.',
    rarity: '2% of readers',
  },
  {
    day: 90,
    tier: StreakTier.EternalFlame,
    label: 'Eternal Flame',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'Ninety days',
    subhead: 'A quarter of a year of showing up.',
    rarity: '1% of readers',
  },
  {
    day: 180,
    tier: StreakTier.Supernova,
    label: 'Supernova',
    reward: 'Mystery daily.dev prize',
    mystery: true,
    headline: 'Half a year',
    subhead: 'One hundred and eighty days in a row.',
    rarity: '0.4% of readers',
  },
  {
    day: 365,
    tier: StreakTier.Legendary,
    label: 'Legendary',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'One year, every single day',
    subhead: 'Fewer than 1 in 500 readers ever get here.',
    rarity: '0.2% of readers',
  },
];

export const milestoneByDay = (day: number): StreakMilestone =>
  streakLadder.find((milestone) => milestone.day === day) ?? streakLadder[0];

/** The three days used across the stories, so the examples stay comparable. */
export const milestones = {
  week: milestoneByDay(7),
  month: milestoneByDay(30),
  year: milestoneByDay(365),
};

/** The last seven days behind the current streak, for the day strip. */
export const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
