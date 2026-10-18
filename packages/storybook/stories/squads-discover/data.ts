import { cloudinarySquadsDirectoryCardBannerDefault } from '@dailydotdev/shared/src/lib/image';
import type { RawSquad } from './types';
import {
  categoryHandles,
  featuredHandles,
  rawCategories,
  rawSquads,
} from './raw';

// Every layout in this folder is drawn from the same squads: public squad
// branding from raw.ts, with placeholder member faces, so the comparison is
// about structure and not content.

export interface DiscoverSquad extends RawSquad {
  permalink: string;
  banner: string;
  members: string[];
}

interface DiscoverCategory {
  id: string;
  slug: string;
  title: string;
}

/**
 * No squad in today's data is both verified and featured, though the
 * combination exists. Ahurasense (verified, with a banner) stands in for one.
 */
const illustrativeFeatured = new Set(['ahurasense']);

const placeholderAvatar = (n: number) =>
  `https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/${n}`;

/**
 * Member faces for a squad's stack: up to five placeholders, picked from
 * the squad's id so each squad keeps the same faces. Never real members.
 */
const placeholderMembers = (raw: RawSquad): string[] => {
  const seed = [...raw.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: Math.min(5, raw.membersCount) }, (_, index) =>
    placeholderAvatar(((seed + index) % 8) + 1),
  );
};

const toSquad = (raw: RawSquad): DiscoverSquad => ({
  ...raw,
  featured: raw.featured || illustrativeFeatured.has(raw.handle),
  members: placeholderMembers(raw),
  permalink: `https://app.daily.dev/squads/${raw.handle}`,
  banner: raw.headerImage || cloudinarySquadsDirectoryCardBannerDefault,
});

const byHandle: Record<string, DiscoverSquad> = Object.fromEntries(
  rawSquads.map((raw) => [raw.handle, toSquad(raw)]),
);

export const squad = (handle: string): DiscoverSquad => {
  const found = byHandle[handle];
  if (!found) {
    throw new Error(`Unknown squad ${handle}`);
  }
  return found;
};

const many = (handles: string[]): DiscoverSquad[] => handles.map(squad);

export const categories: DiscoverCategory[] = rawCategories;

export const categoryTitle = (slug: string): string =>
  categories.find((category) => category.slug === slug)?.title ?? slug;

/** The category rows as production returns them, in production order. */
export const squadsByCategory = (slug: string): DiscoverSquad[] =>
  many(categoryHandles[slug] ?? []);

/** Production's Featured row. */
export const featuredSquads: DiscoverSquad[] = many([
  ...featuredHandles.slice(0, 2),
  ...illustrativeFeatured,
  ...featuredHandles.slice(2),
]);

const byMembers = (a: DiscoverSquad, b: DiscoverSquad): number =>
  b.membersCount - a.membersCount;

/**
 * Featured squads live only in the Featured area (strip, chip, shelf), so
 * every other list on the page leaves them out instead of repeating them.
 */
export const isBrowsable = (item: DiscoverSquad): boolean => !item.featured;

/**
 * A topic as the directory ranks it, featured squads aside: Verified
 * Company Squads first, then everyone else by members. Ranking ahead of regular squads is part of
 * what a company pays for (docs.daily.dev/verified-company-squads), so the
 * layouts keep it and explain it on screen instead of removing it.
 */
export const topByCategory = (slug: string): DiscoverSquad[] => {
  const list = squadsByCategory(slug).filter(isBrowsable).sort(byMembers);
  return [
    ...list.filter((item) => item.verified),
    ...list.filter((item) => !item.verified),
  ];
};

const allSquads = Object.values(byHandle);

/** Trending is a ranking by definition, so members decide alone. */
export const topSquads: DiscoverSquad[] = allSquads
  .filter(isBrowsable)
  .sort(byMembers)
  .slice(0, 40);

export enum PromotedKind {
  Verified = 'verified',
  Featured = 'featured',
  VerifiedFeatured = 'verified-featured',
  Regular = 'regular',
}

/**
 * Boosted squads come in four kinds, and the slot treats them the same:
 * a Verified Company Squad (Infisical), a squad the team also featured
 * (Syntax), a verified squad that is also featured (Ahurasense), and a
 * regular community squad (builder.io). These are illustrative
 * placements, not a claim about who pays.
 */
export const promotedByKind: Record<PromotedKind, DiscoverSquad> = {
  [PromotedKind.Verified]: squad('infisical'),
  [PromotedKind.Featured]: squad('syntax'),
  [PromotedKind.VerifiedFeatured]: squad('ahurasense'),
  [PromotedKind.Regular]: squad('builderio'),
};

export const promotedSquads: DiscoverSquad[] = [
  promotedByKind[PromotedKind.Verified],
  promotedByKind[PromotedKind.Featured],
  promotedByKind[PromotedKind.Regular],
  squad('agentfield'),
];

/** The campaign a view's slot gets, targeted by topic. */
export const promotedFor = (slug?: string): DiscoverSquad => {
  if (slug === 'featured') {
    return promotedByKind[PromotedKind.Featured];
  }
  if (slug === 'ai' || slug === 'devtools' || slug === 'web') {
    return promotedByKind[PromotedKind.Regular];
  }
  return promotedByKind[PromotedKind.Verified];
};

/**
 * An inner page's second campaign: the Promoted widget from laptop, the
 * first row of the list below it. Never the list's own slot, and never a
 * featured campaign, which belongs in the Featured area.
 */
export const spotlightFor = (slug: string): DiscoverSquad =>
  promotedSquads.find(
    (item) => item.id !== promotedFor(slug).id && isBrowsable(item),
  ) ?? promotedFor(slug);

export interface StarterPack {
  id: string;
  title: string;
  description: string;
  curator: string;
  /** The topic chip this pack opens, when it maps to one. */
  topic: string;
  squads: DiscoverSquad[];
}

export const starterPacks: StarterPack[] = [
  {
    id: 'frontend',
    topic: 'web',
    title: 'Frontend essentials',
    description: 'React, Next.js and the people shipping the modern web.',
    curator: 'daily.dev',
    squads: many([
      'nextjs',
      'the_react_community',
      'exceptionalfrontend',
      'typescriptdevelopers',
      'uxui',
    ]),
  },
  {
    id: 'ai-builders',
    topic: 'ai',
    title: 'AI builders',
    description: 'Agents, LLM apps and the research behind them.',
    curator: 'daily.dev',
    squads: many([
      'ai',
      'buildwithgenai',
      'agentic',
      'mlnews',
      'promptengineering',
    ]),
  },
  {
    id: 'backend',
    topic: 'devops-cloud',
    title: 'Backend & cloud',
    description: 'Node, Go, Postgres and the infra underneath.',
    curator: 'daily.dev',
    squads: many([
      'nodejsdevelopers',
      'golangnuts',
      'joindevops',
      'cloud',
      'postgresdaily',
    ]),
  },
  {
    id: 'career',
    topic: 'career',
    title: 'Grow your career',
    description: 'Roadmaps, leadership and honest talk about the job.',
    curator: 'daily.dev',
    squads: many([
      'roadmap',
      'engineeringleadership',
      'devleader',
      'managingdev',
      'watercooler',
    ]),
  },
  {
    id: 'mobile',
    topic: 'mobile',
    title: 'Mobile devs',
    description: 'Flutter, React Native and native iOS and Android.',
    curator: 'daily.dev',
    squads: many(['mobile', 'rndevs', 'fluttersquad', 'dartdevs', 'ios_dev']),
  },
  {
    id: 'fun',
    topic: 'fun',
    title: 'Off the clock',
    description: 'Memes, philosophy and what everyone is building.',
    curator: 'daily.dev',
    squads: many([
      'watercooler',
      'softwarephilosophy',
      'mememonday',
      'projectboard',
      'shareyourbuilds',
    ]),
  },
];

export const packForTopic = (slug: string): StarterPack | undefined =>
  starterPacks.find((pack) => pack.topic === slug);

/** Squads the reader already belongs to, for My Squads and joined states. */
export const mySquads: DiscoverSquad[] = many([
  'webdev',
  'learn_javascript',
  'devtools',
]);

/** Where the reader is admin or moderator (production's currentMember.role). */
export const myPrivilegedIds = new Set([squad('devtools').id]);

/** A post waiting in a moderator's queue (SourcePostModeration). */
export interface PendingPost {
  id: string;
  squad: DiscoverSquad;
  author: { name: string; image: string };
  createdAt: string;
  readTime: number;
  title: string;
  content: string;
  tags: string[];
  image: string;
}

/** The reader's moderation queue (useSquadPendingPosts, status pending). */
export const pendingPosts: PendingPost[] = [
  {
    id: 'pending-1',
    squad: squad('devtools'),
    author: { name: 'Maya Levin', image: placeholderAvatar(2) },
    createdAt: '2h ago',
    readTime: 6,
    title: 'The terminal tools I install on every new machine',
    content:
      'A short list of CLI tools that saved me hours this year, with the config I use for each.',
    tags: ['cli', 'productivity', 'terminal'],
    image:
      'https://daily-now-res.cloudinary.com/image/upload/s--_YYO9uBB--/f_auto,q_auto/v1696341292/public/Devtools-cover',
  },
  {
    id: 'pending-2',
    squad: squad('devtools'),
    author: { name: 'Daniel Ortiz', image: placeholderAvatar(3) },
    createdAt: '5h ago',
    readTime: 4,
    title: 'Debugging memory leaks in Chrome DevTools, step by step',
    content:
      'How I tracked down a leak in a React app with heap snapshots and the allocation timeline.',
    tags: ['devtools', 'debugging', 'chrome'],
    image:
      'https://daily-now-res.cloudinary.com/image/upload/s--z6Latw7Z--/f_auto/v1694078930/cover-webdev_gvkzsg',
  },
  {
    id: 'pending-3',
    squad: squad('devtools'),
    author: { name: 'Priya Natarajan', image: placeholderAvatar(4) },
    createdAt: '1d ago',
    readTime: 8,
    title: 'Why our team switched from Docker Desktop to Podman',
    content:
      'Licensing, speed and rootless containers: what changed for a team of twelve after six months.',
    tags: ['docker', 'podman', 'containers'],
    image:
      'https://daily-now-res.cloudinary.com/image/upload/s--Yyz66U17--/f_auto,q_auto/v1696341292/public/devops-cover',
  },
];

/** Squads that banned the reader (SourceMemberRole.Blocked): Join is off. */
export const bannedSquadIds = new Set([squad('mlnews').id]);

export const totalMembers = (slug: string): number =>
  squadsByCategory(slug).reduce((sum, item) => sum + item.membersCount, 0);
