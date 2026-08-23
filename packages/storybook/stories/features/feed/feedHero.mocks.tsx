import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import type { Ad, Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import type { ExploreCategory } from '@dailydotdev/shared/src/components/feeds/exploreCategories';
import { featureHeroCards } from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import ExtensionProviders from '../../extension/_providers';

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const createSource = (id: string, name: string): Source => ({
  id,
  handle: id,
  name,
  permalink: `https://app.daily.dev/sources/${id}`,
  image: `https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/${id}`,
  type: SourceType.Machine,
  public: true,
});

const sources = {
  tds: createSource('tds', 'Towards Data Science'),
  tc: createSource('tc', 'TechCrunch'),
  ph: createSource('ph', 'Product Hunt'),
  tkdodo: createSource('tkdodo', 'TkDodo'),
};

const placeholder = (index: number): string =>
  `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${index}`;

const basePost = {
  numUpvotes: 128,
  numComments: 24,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
};

export const heroPosts: Post[] = [
  {
    ...basePost,
    id: 'hero-1',
    type: PostType.Article,
    title:
      'React 20 ships the compiler by default — what breaks and what to do',
    summary:
      'The compiler is no longer opt-in. Memoization hooks become no-ops, refs behave differently inside effects, and a handful of popular libraries need a patch release before you upgrade.',
    permalink: 'https://api.daily.dev/r/hero-1',
    commentsPermalink: 'https://app.daily.dev/posts/hero-1',
    createdAt: hoursAgo(3),
    readTime: 9,
    image: placeholder(1),
    source: sources.tds,
    tags: ['react', 'javascript', 'webdev'],
    numUpvotes: 842,
    numComments: 96,
    hero: {
      id: 'hero-sig-1',
      headline: 'React 20 ships the compiler by default',
      significance: 'breaking',
      size: 2,
      highlightedAt: hoursAgo(3),
    },
  },
  {
    ...basePost,
    id: 'hero-2',
    type: PostType.Article,
    title:
      'Postgres 19 makes logical replication usable for zero-downtime migrations',
    summary:
      'Sequences finally replicate, DDL is carried across publications, and failover slots survive a promotion — the three gaps that used to force a maintenance window.',
    permalink: 'https://api.daily.dev/r/hero-2',
    commentsPermalink: 'https://app.daily.dev/posts/hero-2',
    createdAt: hoursAgo(7),
    readTime: 12,
    image: placeholder(2),
    source: sources.tc,
    tags: ['postgres', 'databases', 'devops'],
    numUpvotes: 511,
    numComments: 48,
    hero: {
      id: 'hero-sig-2',
      headline: 'Postgres 19 lands zero-downtime logical replication',
      significance: 'major',
      size: 2,
      highlightedAt: hoursAgo(7),
    },
  },
  {
    ...basePost,
    id: 'hero-3',
    type: PostType.Article,
    title: 'We replaced our GraphQL gateway with a 400-line Rust proxy',
    summary:
      'p99 dropped from 340ms to 28ms and the on-call pager went quiet. A walkthrough of what the gateway was actually doing, and why almost none of it was needed.',
    permalink: 'https://api.daily.dev/r/hero-3',
    commentsPermalink: 'https://app.daily.dev/posts/hero-3',
    createdAt: hoursAgo(14),
    readTime: 15,
    image: placeholder(3),
    source: sources.tkdodo,
    tags: ['rust', 'graphql', 'performance'],
    numUpvotes: 1204,
    numComments: 187,
    hero: {
      id: 'hero-sig-3',
      headline: 'A 400-line Rust proxy replaced a GraphQL gateway',
      significance: 'breakout',
      size: 2,
      highlightedAt: hoursAgo(14),
    },
  },
  {
    ...basePost,
    id: 'hero-4',
    type: PostType.Article,
    title:
      'The agent benchmark everyone quotes has been measuring the wrong thing',
    summary:
      'A reproduction of the headline numbers, the prompt leak that inflated them, and a rerun on a clean split that puts every model within four points of each other.',
    permalink: 'https://api.daily.dev/r/hero-4',
    commentsPermalink: 'https://app.daily.dev/posts/hero-4',
    createdAt: hoursAgo(20),
    readTime: 11,
    image: placeholder(4),
    source: sources.ph,
    tags: ['ai', 'machine-learning', 'agents'],
    numUpvotes: 933,
    numComments: 142,
    hero: {
      id: 'hero-sig-4',
      headline: 'The agent benchmark everyone quotes is broken',
      significance: 'notable',
      size: 2,
      highlightedAt: hoursAgo(20),
    },
  },
];

export const feedPosts: Post[] = [
  {
    ...basePost,
    id: 'feed-1',
    type: PostType.Article,
    title: 'Stop reaching for useEffect: a decision tree',
    summary: 'Six common effects and where each one actually belongs.',
    permalink: 'https://api.daily.dev/r/feed-1',
    commentsPermalink: 'https://app.daily.dev/posts/feed-1',
    createdAt: hoursAgo(5),
    readTime: 6,
    image: placeholder(5),
    source: sources.tkdodo,
    tags: ['react', 'hooks'],
  },
  {
    ...basePost,
    id: 'feed-2',
    type: PostType.Article,
    title: 'Shipping a monorepo with pnpm workspaces and Turborepo in 2026',
    summary:
      'Caching, task graphs, and the traps that make CI slower, not faster.',
    permalink: 'https://api.daily.dev/r/feed-2',
    commentsPermalink: 'https://app.daily.dev/posts/feed-2',
    createdAt: hoursAgo(9),
    readTime: 10,
    image: placeholder(6),
    source: sources.tds,
    tags: ['monorepo', 'pnpm', 'ci'],
  },
  {
    ...basePost,
    id: 'feed-3',
    type: PostType.Article,
    title: 'A practical guide to CSS container queries',
    summary: 'Component-level breakpoints without a single media query.',
    permalink: 'https://api.daily.dev/r/feed-3',
    commentsPermalink: 'https://app.daily.dev/posts/feed-3',
    createdAt: hoursAgo(11),
    readTime: 7,
    image: placeholder(1),
    source: sources.tc,
    tags: ['css', 'frontend'],
  },
  {
    ...basePost,
    id: 'feed-4',
    type: PostType.Article,
    title: 'What a year of on-call taught us about alert design',
    summary:
      'Every alert that woke someone up, categorized and mostly deleted.',
    permalink: 'https://api.daily.dev/r/feed-4',
    commentsPermalink: 'https://app.daily.dev/posts/feed-4',
    createdAt: hoursAgo(16),
    readTime: 8,
    image: placeholder(2),
    source: sources.ph,
    tags: ['sre', 'observability'],
  },
  {
    ...basePost,
    id: 'feed-5',
    type: PostType.Article,
    title: 'Type-safe environment variables without a build step',
    summary: 'Zod, a tiny loader, and failing fast on boot.',
    permalink: 'https://api.daily.dev/r/feed-5',
    commentsPermalink: 'https://app.daily.dev/posts/feed-5',
    createdAt: hoursAgo(22),
    readTime: 5,
    image: placeholder(3),
    source: sources.tkdodo,
    tags: ['typescript', 'zod'],
  },
  {
    ...basePost,
    id: 'feed-6',
    type: PostType.Article,
    title: 'Reading the SQLite source to understand WAL mode',
    summary: 'What the checkpointer does, and why your writes stall.',
    permalink: 'https://api.daily.dev/r/feed-6',
    commentsPermalink: 'https://app.daily.dev/posts/feed-6',
    createdAt: hoursAgo(28),
    readTime: 14,
    image: placeholder(4),
    source: sources.tds,
    tags: ['sqlite', 'databases'],
  },
];

export const highlights: PostHighlight[] = [
  {
    id: 'highlight-1',
    channel: 'frontend',
    headline: 'React 20 makes the compiler the default in every new app',
    highlightedAt: hoursAgo(1),
    post: {
      id: 'hero-1',
      commentsPermalink: 'https://app.daily.dev/posts/hero-1',
    },
  },
  {
    id: 'highlight-2',
    channel: 'ai',
    headline: 'OpenAI and Anthropic both ship agent sandboxes on the same day',
    highlightedAt: hoursAgo(2),
    post: {
      id: 'highlight-post-2',
      commentsPermalink: 'https://app.daily.dev/posts/highlight-post-2',
    },
  },
  {
    id: 'highlight-3',
    channel: 'devops',
    headline: 'Cloudflare outage takes down half the JS ecosystem CDNs',
    highlightedAt: hoursAgo(4),
    post: {
      id: 'highlight-post-3',
      commentsPermalink: 'https://app.daily.dev/posts/highlight-post-3',
    },
  },
  {
    id: 'highlight-4',
    channel: 'languages',
    headline: 'TypeScript 7 preview lands with the Go-based compiler',
    highlightedAt: hoursAgo(9),
    post: {
      id: 'highlight-post-4',
      commentsPermalink: 'https://app.daily.dev/posts/highlight-post-4',
    },
  },
  {
    id: 'highlight-5',
    channel: 'security',
    headline: 'Another postinstall supply-chain attack hits 40 npm packages',
    highlightedAt: hoursAgo(13),
    post: {
      id: 'highlight-post-5',
      commentsPermalink: 'https://app.daily.dev/posts/highlight-post-5',
    },
  },
];

export const heroAd: Ad = {
  company: 'Vercel',
  source: 'Vercel',
  tagLine: 'Ship your Next.js app in seconds',
  description:
    'Zero-config deploys, a preview URL on every push, and analytics that come with it.',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/5',
  link: 'https://vercel.com',
  referralLink: 'https://vercel.com',
  companyLogo: 'https://svgl.app/library/vercel.svg',
  callToAction: 'Start deploying',
  adDomain: 'vercel.com',
  providerId: 'sb-provider',
  matchingTags: ['nextjs', 'react', 'devops'],
};

export const adWithoutTags: Ad = { ...heroAd, matchingTags: undefined };

export const adWithoutImage: Ad = { ...heroAd, image: undefined as never };

export const adWithoutAdvertiser: Ad = {
  ...heroAd,
  referralLink: undefined,
  companyLogo: undefined,
};

export const adWithLongCopy: Ad = {
  ...heroAd,
  company: 'Observability Cloud Platform',
  source: 'Observability Cloud Platform',
  description:
    'Distributed tracing, log search, RUM and synthetic checks in one place, with alerts that route straight to the on-call engineer who owns the service.',
  matchingTags: ['observability', 'sre', 'monitoring', 'devops'],
};

export const exploreCategories: ExploreCategory[] = [
  { id: 'ai', label: 'AI', path: '/explore/ai', tag: 'ai' },
  { id: 'react', label: 'React', path: '/explore/react', tag: 'react' },
  {
    id: 'typescript',
    label: 'TypeScript',
    path: '/explore/typescript',
    tag: 'typescript',
  },
  { id: 'devops', label: 'DevOps', path: '/explore/devops', tag: 'devops' },
  { id: 'rust', label: 'Rust', path: '/explore/rust', tag: 'rust' },
  { id: 'career', label: 'Career', path: '/explore/career', tag: 'career' },
  {
    id: 'databases',
    label: 'Databases',
    path: '/explore/databases',
    tag: 'databases',
  },
  {
    id: 'security',
    label: 'Security',
    path: '/explore/security',
    tag: 'security',
  },
  { id: 'webdev', label: 'Web dev', path: '/explore/webdev', tag: 'webdev' },
  {
    id: 'open-source',
    label: 'Open source',
    path: '/explore/open-source',
    tag: 'open-source',
  },
];

const squadSource: Source = {
  ...createSource('avengers', 'Frontend Avengers'),
  type: SourceType.Squad,
};

export const mixedTypeHeroPosts: Post[] = [
  heroPosts[0],
  {
    ...basePost,
    id: 'hero-share',
    type: PostType.Share,
    title: 'This is the clearest explanation of the compiler I have read',
    permalink: 'https://api.daily.dev/r/hero-share',
    commentsPermalink: 'https://app.daily.dev/posts/hero-share',
    createdAt: hoursAgo(4),
    image: placeholder(5),
    source: squadSource,
    tags: ['react', 'javascript'],
    sharedPost: {
      id: 'shared-1',
      title: 'React 20 ships the compiler by default',
      summary:
        'A walkthrough of the compiler output, the hooks it makes redundant, and the migration path for a large app.',
      image: placeholder(1),
      readTime: 9,
      permalink: 'https://api.daily.dev/r/shared-1',
      commentsPermalink: 'https://app.daily.dev/posts/shared-1',
      createdAt: hoursAgo(6),
      private: false,
      type: PostType.Article,
      tags: ['react'],
      source: sources.tds,
    },
  },
  {
    ...basePost,
    id: 'hero-collection',
    type: PostType.Collection,
    title: 'Everything we know about the npm supply-chain attack',
    summary:
      'Six reports on the same incident, merged into one timeline: what was published, which packages pulled it in, and how to check your lockfile.',
    permalink: 'https://api.daily.dev/r/hero-collection',
    commentsPermalink: 'https://app.daily.dev/posts/hero-collection',
    createdAt: hoursAgo(8),
    readTime: 6,
    image: placeholder(2),
    source: sources.tc,
    tags: ['security', 'npm'],
    collectionSources: [sources.tc, sources.ph, sources.tds],
    numCollectionSources: 6,
  },
  {
    ...basePost,
    id: 'hero-freeform',
    type: PostType.Freeform,
    title: 'We cut our CI bill by 70% — here is the full breakdown',
    permalink: 'https://api.daily.dev/r/hero-freeform',
    commentsPermalink: 'https://app.daily.dev/posts/hero-freeform',
    createdAt: hoursAgo(12),
    readTime: 4,
    image: placeholder(3),
    source: squadSource,
    tags: ['ci', 'devops'],
    contentHtml:
      '<p>Three changes did most of the work: caching the pnpm store, splitting the test matrix by package, and dropping the nightly full build.</p>',
  },
];

export const readHeroPost: Post = {
  ...heroPosts[0],
  id: 'hero-read',
  read: true,
  bookmarked: true,
};

export const noImageHeroPost: Post = {
  ...heroPosts[1],
  id: 'hero-no-image',
  image: undefined as never,
};

export const cardHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

export const FeedHeroProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <FeatureOverrides
      values={{
        [featureHeroCards.id]: {
          ...featureHeroCards.defaultValue,
          enabled: true,
        },
      }}
    >
      {children}
    </FeatureOverrides>
  </ExtensionProviders>
);
