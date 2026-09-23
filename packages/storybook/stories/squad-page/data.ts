import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';

// The daily.dev Changelog squad (@daily_updates), snapshotted from the public
// API on 15 Sep 2026: identity, stats, the admin/moderator list and the last
// 14 posts are real. Everything marked "illustrative" is what a verified
// company page would add on top and does not exist on the API yet.

export interface SquadLink {
  label: string;
  href: string;
}

export interface SquadData {
  handle: string;
  name: string;
  description: string;
  /** One line. The description is the paragraph; this is the promise. */
  tagline: string;
  image: string;
  headerImage: string;
  permalink: string;
  category: string;
  createdAt: string;
  membersCount: number;
  totalPosts: number;
  totalViews: number;
  totalUpvotes: number;
  totalAwards: number;
  /** Illustrative: the badge is the thing being sold. */
  verified: boolean;
  /** Illustrative. */
  links: SquadLink[];
  /** Illustrative. Company location and size the way LinkedIn shows them. */
  company: { location: string; size: string; website: string };
}

export const squad: SquadData = {
  handle: 'daily_updates',
  name: 'daily.dev Changelog',
  tagline: 'Every product update and announcement from the daily.dev team.',
  description:
    'Get the latest product updates and announcements about daily.dev',
  image:
    'https://media.daily.dev/image/upload/s--COeiQtov--/f_auto/v1704465510/squads/daily_updates',
  headerImage:
    'https://daily-now-res.cloudinary.com/image/upload/s--DZ2olKlo--/f_auto,q_auto/v1704465234/squads/dailv.dev_background_1',
  permalink: 'https://daily.dev/squads/daily_updates',
  category: 'DevRel',
  createdAt: '2023-02-06T14:24:34.644Z',
  membersCount: 11499,
  totalPosts: 151,
  totalViews: 652515,
  totalUpvotes: 29314,
  totalAwards: 1,
  verified: true,
  links: [
    { label: 'daily.dev', href: 'https://daily.dev' },
    { label: 'github.com/dailydotdev', href: 'https://github.com/dailydotdev' },
    { label: 'x.com/dailydotdev', href: 'https://x.com/dailydotdev' },
  ],
  company: {
    location: 'Tel Aviv, Israel',
    size: '11-50 employees',
    website: 'daily.dev',
  },
};

export enum TeamRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  image: string;
  role: TeamRole;
  title: string;
  reputation: number;
}

export const team: TeamMember[] = [
  {
    id: 'kramer',
    name: 'Nimrod Kramer',
    username: 'kramer',
    image:
      'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
    role: TeamRole.Admin,
    title: 'Co-founder & CEO',
    reputation: 130145,
  },
  {
    id: 'idoshamun',
    name: 'Ido Shamun',
    username: 'idoshamun',
    image:
      'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
    role: TeamRole.Admin,
    title: 'Co-founder & CTO',
    reputation: 183690,
  },
  {
    id: 'tsahimatsliah',
    name: 'Tsahi Matsliah',
    username: 'tsahimatsliah',
    image:
      'https://media.daily.dev/image/upload/s--k80T3WJe--/f_auto,q_auto/v1703793130/avatars/avatar_5e0af68445e04c02b0656c3530664aff',
    role: TeamRole.Moderator,
    title: 'Co-founder & CDO',
    reputation: 92100,
  },
  {
    id: 'dailydevtips',
    name: 'Chris Bongers',
    username: 'dailydevtips',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-?_a=BAMAMiZW0',
    role: TeamRole.Moderator,
    title: 'Web team lead',
    reputation: 210430,
  },
  {
    id: 'capjavert',
    name: 'Ante Barić',
    username: 'capjavert',
    image:
      'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 88240,
  },
  {
    id: 'amar',
    name: 'Amar',
    username: 'amar',
    image:
      'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
    role: TeamRole.Moderator,
    title: 'Engineer',
    reputation: 64010,
  },
  {
    id: 'davidecruz',
    name: 'Davide Cruz',
    username: 'davidecruz',
    image:
      'https://media.daily.dev/image/upload/s--3UsMy--X--/f_auto/v1785312754/avatars/avatar_C2COXE8XbFvGuOxiki3Po?_a=BAMAMicg0',
    role: TeamRole.Moderator,
    title: 'Data scientist',
    reputation: 31200,
  },
  {
    id: 'vasn',
    name: 'Vas N',
    username: 'vasn',
    image:
      'https://lh3.googleusercontent.com/a-/AOh14GhZpI6rlti8BFP-fzWGDxrFlAmSfb72Vd6u7XS5=s100',
    role: TeamRole.Moderator,
    title: 'Growth',
    reputation: 18700,
  },
];

const teamById = Object.fromEntries(team.map((member) => [member.id, member]));

export interface Entry {
  id: string;
  title: string;
  image: string | null;
  summary: string;
  createdAt: string;
  upvotes: number;
  comments: number;
  awards: number;
  tags: string[];
  author: TeamMember;
  pinned?: boolean;
}

export const entries: Entry[] = [
  {
    id: 'JP5X9El1T',
    title: 'Release notes (updates live)',
    image: null,
    summary:
      'Ongoing release notes for daily.dev covering updates from March through June 2026. UI redesigns, new features, bug fixes across mobile, PWA and the extension, and gamification additions like streaks and quest achievements.',
    createdAt: '2026-03-16T12:17:15.138Z',
    upvotes: 30,
    comments: 11,
    awards: 1,
    tags: ['dailydev'],
    author: teamById.dailydevtips,
    pinned: true,
  },
  {
    id: 'Ljj8kH9SA',
    title: 'Public API access is now open for everyone',
    image:
      'https://media.daily.dev/image/upload/s--A-Poy1Mx--/f_auto/v1789395874/posts/Ljj8kH9SA?_a=BAMAMicg0',
    summary:
      'Every account can now create a personal access token from Settings, with 200 free requests per month and higher limits for Plus. Ships with integrations for Claude Code, Cursor, Codex and OpenClaw, plus five step-by-step guides.',
    createdAt: '2026-09-14T14:24:34.118Z',
    upvotes: 116,
    comments: 16,
    awards: 9,
    tags: ['devtools', 'architecture', 'dailydev'],
    author: teamById.capjavert,
  },
  {
    id: 'W3ts5p7yS',
    title: 'Meet World: the 3D place your reading builds',
    image:
      'https://media.daily.dev/image/upload/s--EGXE4BEM--/f_auto/v1788170246/posts/W3ts5p7yS?_a=BAMAMicg0',
    summary:
      'World turns your reading history into an explorable 3D city. Topics become districts grouped into six realms, and districts grow as you read more on a topic. Customise the sky, lighting and crest, or redesign buildings with a coding agent.',
    createdAt: '2026-08-31T09:57:25.108Z',
    upvotes: 153,
    comments: 45,
    awards: 0,
    tags: ['devtools', 'dailydev'],
    author: teamById.idoshamun,
  },
  {
    id: 'gSWhwq5qh',
    title: 'Headlines in your Claude statusline',
    image:
      'https://media.daily.dev/image/upload/s--7au3vpvS--/f_auto/v1787732248/posts/gSWhwq5qh?_a=BAMAMicg0',
    summary:
      'A daily.dev plugin for Claude Code surfaces top developer news headlines in the terminal statusline while Claude runs. Curated top stories mixed with the day’s most-upvoted community posts, refreshed every 10 minutes.',
    createdAt: '2026-08-26T08:17:28.006Z',
    upvotes: 115,
    comments: 20,
    awards: 2,
    tags: ['devtools', 'claude-code', 'dailydev'],
    author: teamById.dailydevtips,
  },
  {
    id: 'BkDuK0um3',
    title: 'Community take: see what other developers think about a post',
    image:
      'https://media.daily.dev/image/upload/s--tdsrO-LY--/f_auto/v1787148852/posts/BkDuK0um3?_a=BAMAMicg0',
    summary:
      'Community Take aggregates developer discussion from Hacker News and Lobsters into a summary attached to each post: a TL;DR, a sentiment breakdown, arguments for and against, and standout quotes linked to the original threads.',
    createdAt: '2026-08-19T14:14:12.195Z',
    upvotes: 78,
    comments: 22,
    awards: 7,
    tags: ['dailydev'],
    author: teamById.dailydevtips,
  },
  {
    id: 'Wlycvd5Ce',
    title: 'The Watercooler feed is here',
    image:
      'https://media.daily.dev/image/upload/s--vNh_4FJj--/f_auto/v1785854446/posts/Wlycvd5Ce?_a=BAMAMicg0',
    summary:
      'Watercooler is a new opt-in feed, separate from the main tech news feed, for shower thoughts, hot takes, cursed screenshots and developer banter. Posts stay out of the regular feed unless you go looking for them.',
    createdAt: '2026-08-04T14:40:45.576Z',
    upvotes: 136,
    comments: 15,
    awards: 7,
    tags: ['community', 'dailydev'],
    author: teamById.idoshamun,
  },
  {
    id: 'MdJHk19ga',
    title: 'Read articles inside daily.dev',
    image:
      'https://media.daily.dev/image/upload/s--9fo21NFF--/f_auto/v1785742885/posts/MdJHk19ga?_a=BAMAMicg0',
    summary:
      'An in-app reader opens articles, videos and digests directly inside daily.dev with the discussion panel alongside. Requires the browser extension; enable it from the first-use prompt or in Settings → Appearance.',
    createdAt: '2026-08-03T07:41:24.521Z',
    upvotes: 176,
    comments: 27,
    awards: 13,
    tags: ['devtools', 'dailydev'],
    author: teamById.dailydevtips,
  },
  {
    id: 'b7IaAiDo9',
    title: 'Notifications, cleaned up',
    image:
      'https://media.daily.dev/image/upload/s--HO7Vo_mk--/f_auto/v1785483605/posts/b7IaAiDo9?_a=BAMAMicg0',
    summary:
      'The notifications page was rebuilt around category filters, time grouping, rows that lead with the actor’s name, aligned post covers, stacked avatars for repeated interactions and a one-tap thank-you for Awards.',
    createdAt: '2026-07-31T07:40:04.207Z',
    upvotes: 146,
    comments: 19,
    awards: 1,
    tags: ['ui-ux'],
    author: teamById.dailydevtips,
  },
  {
    id: 'VzLdLBbCl',
    title: 'Trends are here!',
    image:
      'https://media.daily.dev/image/upload/s--6UEmCkDN--/f_auto/v1785165533/posts/VzLdLBbCl?_a=BAMAMicg0',
    summary:
      'Trends aggregate posts around one trending topic into a single view with a TL;DR that updates as new content arrives. Like Collections, but for the day-to-day discussions, hot takes and controversies.',
    createdAt: '2026-07-29T07:00:00.207Z',
    upvotes: 71,
    comments: 18,
    awards: 1,
    tags: [],
    author: teamById.davidecruz,
  },
  {
    id: 'YaeS3yS0T',
    title: 'Miss a day, keep your streak',
    image:
      'https://media.daily.dev/image/upload/s--SqpaPl57--/f_auto/v1785152078/posts/YaeS3yS0T?_a=BAMAMicg0',
    summary:
      'Streak freezes automatically cover missed days. Buy them in 3-packs or 5-packs from the streak popover, stash up to five, and get notified when one is used or supplies run low.',
    createdAt: '2026-07-27T11:34:37.753Z',
    upvotes: 145,
    comments: 86,
    awards: 1,
    tags: ['dailydev'],
    author: teamById.dailydevtips,
  },
  {
    id: 'htlRrNKKr',
    title: 'Post now, publish later',
    image:
      'https://media.daily.dev/image/upload/s--bJxfpOGd--/f_auto/v1783245829/posts/htlRrNKKr?_a=BAMAMicg0',
    summary:
      'Creators can schedule posts up to 14 days ahead. Scheduled posts can be edited any time or published immediately from the queue, and a notification goes out when one goes live.',
    createdAt: '2026-07-05T10:03:48.515Z',
    upvotes: 91,
    comments: 20,
    awards: 2,
    tags: ['content-creation'],
    author: teamById.idoshamun,
  },
  {
    id: 'JTxqzE58A',
    title: 'Just add daily.dev/ in front of any link',
    image:
      'https://media.daily.dev/image/upload/s--X_PzYEGB--/f_auto/v1782110425/posts/JTxqzE58A?_a=BAMAMiWQ0',
    summary:
      'Prepend daily.dev/ to any article URL to jump to its daily.dev page. If the post exists you land on it; if not, submit it as a shared post in one step. Works in any browser, no extension needed.',
    createdAt: '2026-06-22T06:40:25.426Z',
    upvotes: 164,
    comments: 40,
    awards: 7,
    tags: ['dailydev'],
    author: teamById.idoshamun,
  },
  {
    id: 'jT5FLZJL5',
    title: 'We squashed and merged our domains',
    image:
      'https://media.daily.dev/image/upload/s--GeH9hxyp--/f_auto/v1782034924/posts/jT5FLZJL5?_a=BAMAMiWQ0',
    summary:
      'The marketing site and the web app now live under one domain. app.daily.dev redirects to daily.dev and logged-in users are routed to the app automatically.',
    createdAt: '2026-06-21T09:42:04.385Z',
    upvotes: 62,
    comments: 20,
    awards: 2,
    tags: ['dailydev'],
    author: teamById.idoshamun,
  },
  {
    id: 'RZoF7hogy',
    title: 'Happening Now just got better',
    image:
      'https://media.daily.dev/image/upload/s--DSFz8w_0--/f_auto/v1780055325/posts/RZoF7hogy?_a=BAMAMiWQ0',
    summary:
      'A Security section with its own digest for breaches, CVEs and vulnerabilities, an All section without filters, a redesigned layout for topical digests and deduplication across issues.',
    createdAt: '2026-05-29T11:48:45.576Z',
    upvotes: 47,
    comments: 25,
    awards: 2,
    tags: [],
    author: teamById.idoshamun,
  },
];

export const pinnedEntry = entries.find((entry) => entry.pinned) as Entry;
export const latestEntry = entries.find((entry) => !entry.pinned) as Entry;
export const feedEntries = entries.filter((entry) => !entry.pinned);

/** Illustrative. The real stack on this squad holds one item, daily.dev. */
export const stack = [
  { name: 'Next.js', image: 'https://cdn.simpleicons.org/nextdotjs/white' },
  { name: 'TypeScript', image: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Node.js', image: 'https://cdn.simpleicons.org/nodedotjs' },
  { name: 'GraphQL', image: 'https://cdn.simpleicons.org/graphql' },
  { name: 'PostgreSQL', image: 'https://cdn.simpleicons.org/postgresql' },
  { name: 'Google Cloud', image: 'https://cdn.simpleicons.org/googlecloud' },
];

/** Illustrative. Recruiter already exists; a company page would surface it. */
export const jobs = [
  {
    title: 'Senior Frontend Engineer',
    location: 'Remote (EU)',
    type: 'Full-time',
  },
  { title: 'Developer Advocate', location: 'Remote', type: 'Full-time' },
];

const source = {
  id: squad.handle,
  handle: squad.handle,
  name: squad.name,
  permalink: squad.permalink,
  image: squad.image,
  type: 'squad' as const,
  active: true,
  public: true,
  membersCount: squad.membersCount,
};

/** The shape the real feed cards take, so the grid layouts render production cards. */
export const toPost = (entry: Entry): Post =>
  ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    image: entry.image ?? undefined,
    permalink: `https://daily.dev/posts/${entry.id}`,
    commentsPermalink: `https://daily.dev/posts/${entry.id}`,
    createdAt: entry.createdAt,
    numUpvotes: entry.upvotes,
    numComments: entry.comments,
    numAwards: entry.awards,
    tags: entry.tags,
    pinnedAt: entry.pinned ? entry.createdAt : undefined,
    type: PostType.Freeform,
    contentHtml: `<p>${entry.summary}</p>`,
    source,
    author: {
      id: entry.author.id,
      name: entry.author.name,
      username: entry.author.username,
      image: entry.author.image,
      permalink: `https://daily.dev/${entry.author.username}`,
      reputation: entry.author.reputation,
    },
    bookmarked: false,
    read: false,
    upvoted: false,
    commented: false,
    userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
  } as unknown as Post);

export const formatCount = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(value);
};

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const shortMonthYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

export const formatMonth = (iso: string): string =>
  monthFormatter.format(new Date(iso));
export const formatDay = (iso: string): string =>
  dayFormatter.format(new Date(iso));
export const formatSince = (iso: string): string =>
  shortMonthYear.format(new Date(iso));

/** Newest first, grouped by month. The publication layout reads like a changelog. */
export const entriesByMonth = feedEntries.reduce<
  { month: string; items: Entry[] }[]
>((groups, entry) => {
  const month = formatMonth(entry.createdAt);
  const group = groups.find((item) => item.month === month);
  if (group) {
    group.items.push(entry);
  } else {
    groups.push({ month, items: [entry] });
  }
  return groups;
}, []);

export interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Open source';
  /** Where the listing was imported from. Ratings are the source's. */
  source: 'Product Hunt' | 'G2' | 'GitHub' | 'Website';
  rating?: number;
  reviews?: number;
  /** daily.dev members with this in their stack. */
  inStacks: number;
  links: { label: string; href: string }[];
}

/** Illustrative. Real products, ratings and counts are placeholders. */
export const products: Product[] = [
  {
    id: 'app',
    name: 'daily.dev',
    tagline:
      'The professional network for developers to learn, grow and stay updated.',
    image: squad.image,
    category: 'Developer news',
    pricing: 'Free',
    source: 'Product Hunt',
    rating: 4.9,
    reviews: 1240,
    inStacks: 8420,
    links: [
      { label: 'Website', href: 'https://daily.dev' },
      {
        label: 'Product Hunt',
        href: 'https://www.producthunt.com/products/daily-dev',
      },
    ],
  },
  {
    id: 'extension',
    name: 'daily.dev browser extension',
    tagline: 'Your feed in every new tab. Chrome, Edge, Firefox and Opera.',
    image: 'https://cdn.simpleicons.org/googlechrome',
    category: 'Browser extension',
    pricing: 'Free',
    source: 'Website',
    rating: 4.7,
    reviews: 3100,
    inStacks: 5210,
    links: [{ label: 'Chrome Web Store', href: 'https://daily.dev/extension' }],
  },
  {
    id: 'plus',
    name: 'daily.dev Plus',
    tagline: 'Smart briefings, clickbait shield, custom feeds and more.',
    image: squad.image,
    category: 'Subscription',
    pricing: 'Paid',
    source: 'G2',
    rating: 4.6,
    reviews: 212,
    inStacks: 1930,
    links: [
      { label: 'Website', href: 'https://daily.dev/plus' },
      { label: 'G2', href: 'https://www.g2.com/products/daily-dev' },
    ],
  },
  {
    id: 'recruiter',
    name: 'daily.dev Recruiter',
    tagline: 'Hire developers where they already read.',
    image: squad.image,
    category: 'Hiring',
    pricing: 'Paid',
    source: 'Website',
    inStacks: 140,
    links: [{ label: 'Website', href: 'https://daily.dev/recruiter' }],
  },
  {
    id: 'api',
    name: 'Public API',
    tagline:
      'Personal access tokens, 200 free requests a month, guides for agents.',
    image: 'https://cdn.simpleicons.org/graphql',
    category: 'API',
    pricing: 'Freemium',
    source: 'GitHub',
    inStacks: 610,
    links: [
      { label: 'Docs', href: 'https://docs.daily.dev/api' },
      { label: 'GitHub', href: 'https://github.com/dailydotdev' },
    ],
  },
  {
    id: 'claude-plugin',
    name: 'Claude Code plugin',
    tagline: 'Developer headlines in your terminal statusline.',
    image: 'https://cdn.simpleicons.org/anthropic',
    category: 'Integration',
    pricing: 'Open source',
    source: 'GitHub',
    rating: 4.8,
    reviews: 96,
    inStacks: 880,
    links: [{ label: 'GitHub', href: 'https://github.com/dailydotdev' }],
  },
];

/** Illustrative. Reddit's rules widget: numbered, one line, the why underneath. */
export const rules: [string, string][] = [
  [
    'Stay on topic',
    'Posts are about daily.dev: releases, questions, feedback, bugs.',
  ],
  [
    'Search before you ask',
    'Q&A and FAQ first. Duplicates get merged into the original.',
  ],
  [
    'Show your work, not your product',
    'Show and tell is for the technical details of what you built. Commercial promotion is removed.',
  ],
  [
    'Bugs get a template',
    'Steps, expected and actual, browser or app version, a screenshot.',
  ],
  [
    'Be useful',
    'Low-effort posts and comments are removed. Answers that help stay.',
  ],
  [
    'One account, one voice',
    'No vote brigading, no sockpuppets, no reposting removed content.',
  ],
];

/** Illustrative. Ratings on the web, pulled into one place. */
export interface ReviewSource {
  id: string;
  name: string;
  image: string;
  rating: number;
  count: number;
  href: string;
}

export const reviewSources: ReviewSource[] = [
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    image: 'https://cdn.simpleicons.org/trustpilot',
    rating: 4.5,
    count: 1240,
    href: 'https://www.trustpilot.com/review/daily.dev',
  },
  {
    id: 'g2',
    name: 'G2',
    image: 'https://cdn.simpleicons.org/g2',
    rating: 4.6,
    count: 212,
    href: 'https://www.g2.com/products/daily-dev',
  },
  {
    id: 'chrome',
    name: 'Chrome Web Store',
    image: 'https://cdn.simpleicons.org/googlechrome',
    rating: 4.7,
    count: 3100,
    href: 'https://daily.dev/extension',
  },
  {
    id: 'appstore',
    name: 'App Store',
    image: 'https://cdn.simpleicons.org/appstore',
    rating: 4.8,
    count: 890,
    href: 'https://daily.dev/ios',
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    image: 'https://cdn.simpleicons.org/producthunt',
    rating: 4.9,
    count: 1180,
    href: 'https://www.producthunt.com/products/daily-dev',
  },
];

export interface Review {
  id: string;
  author: TeamMember;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  reply?: { author: TeamMember; body: string; date: string };
}

/** Illustrative. Authors are the team, standing in for members. */
export const reviews: Review[] = [
  {
    id: 'r1',
    author: team[6],
    rating: 5,
    title: 'Replaced three newsletters and a Slack channel',
    body: 'The feed is the first thing I open. Custom feeds got good enough that I dropped my RSS reader, and the in-app reader means I stop tab hoarding. Squads are where the actual conversation is.',
    date: 'Sep 12',
    helpful: 41,
    reply: {
      author: team[3],
      body: 'Thank you. The reader was the most requested thing this year, glad it landed for you.',
      date: 'Sep 13',
    },
  },
  {
    id: 'r2',
    author: team[5],
    rating: 4,
    title: 'Great on desktop, the mobile app is catching up',
    body: 'Extension and web are excellent. The iOS app is fine for reading but posting from it is still clunky, and I want the same keyboard shortcuts.',
    date: 'Sep 4',
    helpful: 18,
  },
  {
    id: 'r3',
    author: team[7],
    rating: 5,
    title: 'The public API changed how I use it',
    body: 'Morning briefing agent in Claude Code, bookmarks synced to Obsidian, all with a personal token. 200 free requests is enough for a daily digest.',
    date: 'Aug 30',
    helpful: 27,
  },
  {
    id: 'r4',
    author: team[4],
    rating: 3,
    title: 'Too many notifications by default',
    body: 'Good product, but a new account gets a lot of streak and squad noise before it learns you. Turn it down out of the box.',
    date: 'Aug 22',
    helpful: 9,
    reply: {
      author: team[1],
      body: 'Fair. Defaults are getting a pass this quarter; the streak ones are already quieter for new accounts.',
      date: 'Aug 23',
    },
  },
];

export const ratingBreakdown: [number, number][] = [
  [5, 68],
  [4, 21],
  [3, 7],
  [2, 3],
  [1, 1],
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  /** How the squad answered, in percent, one per option. */
  split: number[];
  /** The release the question is generated from. */
  source: string;
}

/** Illustrative. Generated from the changelog's own posts. */
export const quiz = {
  title: 'This month on daily.dev',
  played: 2140,
  questions: [
    {
      id: 'q1',
      question:
        'How many free requests a month does a non-Plus account get on the public API?',
      options: ['50', '200', '1,000', 'Unlimited in beta'],
      answer: 1,
      split: [12, 61, 19, 8],
      source: 'Public API access is now open for everyone',
    },
    {
      id: 'q2',
      question: 'In World, what does a district grow with?',
      options: [
        'Posts you write',
        'Days in your streak',
        'How much you read on that topic',
        'Upvotes you receive',
      ],
      answer: 2,
      split: [9, 23, 58, 10],
      source: 'Meet World: the 3D place your reading builds',
    },
    {
      id: 'q3',
      question: 'How many streak freezes can you keep stashed at once?',
      options: ['Two', 'Three', 'Five', 'Ten'],
      answer: 2,
      split: [14, 31, 47, 8],
      source: 'Miss a day, keep your streak',
    },
    {
      id: 'q4',
      question: 'Which communities does Community Take pull discussion from?',
      options: [
        'Reddit and X',
        'Hacker News and Lobsters',
        'Discord and Slack',
        'GitHub and Stack Overflow',
      ],
      answer: 1,
      split: [22, 52, 11, 15],
      source: 'Community take: see what other developers think about a post',
    },
  ] as QuizQuestion[],
};

export interface SquadPoll {
  id: string;
  question: string;
  options: string[];
  split: number[];
  votes: number;
  author: TeamMember;
  endsAt: string;
}

/** Illustrative. The polls a company squad runs: product decisions, not trivia. */
export const polls: SquadPoll[] = [
  {
    id: 'p1',
    question: 'Which integration should we ship next for the public API?',
    options: ['Raycast', 'Obsidian', 'VS Code', 'Zapier'],
    split: [18, 34, 41, 7],
    votes: 1860,
    author: team[3],
    endsAt: '2026-09-30T09:00:00.000Z',
  },
  {
    id: 'p2',
    question: 'Where do you read daily.dev most?',
    options: ['New tab', 'Web app', 'iOS or Android', 'Email digest'],
    split: [52, 23, 19, 6],
    votes: 2410,
    author: team[1],
    endsAt: '2026-09-26T09:00:00.000Z',
  },
  {
    id: 'p3',
    question: 'Streak freezes: what should the default stash be?',
    options: ['Two', 'Three', 'Five', 'Let me choose'],
    split: [11, 29, 38, 22],
    votes: 1290,
    author: team[2],
    endsAt: '2026-09-24T09:00:00.000Z',
  },
];
