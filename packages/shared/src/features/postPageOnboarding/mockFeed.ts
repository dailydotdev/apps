import type { Post } from '../../graphql/posts';
import { webappUrl } from '../../lib/constants';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';

interface MockSeed {
  title: string;
  source: string;
  upvotes: number;
  comments: number;
}

const toPost = (item: MockSeed, id: string): Post =>
  ({
    id,
    title: item.title,
    commentsPermalink: webappUrl,
    permalink: webappUrl,
    image: cloudinaryPostImageCoverPlaceholder,
    numUpvotes: item.upvotes,
    numComments: item.comments,
    source: {
      name: item.source,
      image: cloudinaryPostImageCoverPlaceholder,
    },
  } as unknown as Post);

const build = (seeds: MockSeed[], prefix: string): Post[] =>
  seeds.map((seed, index) => toPost(seed, `${prefix}-${index}`));

/**
 * Realistic placeholder content so the discovery experience always looks full
 * and alive — used as a fallback when the live tag feed is empty, and to
 * populate themed rows we don't yet have a dedicated query for.
 */
export const mockTrending = build(
  [
    {
      title: 'Why I stopped using useEffect for data fetching',
      source: 'Josh W. Comeau',
      upvotes: 842,
      comments: 96,
    },
    {
      title: 'The 2025 State of JavaScript results are in',
      source: 'State of JS',
      upvotes: 1290,
      comments: 214,
    },
    {
      title: 'Building a fully type-safe API layer with tRPC',
      source: 'tRPC Blog',
      upvotes: 537,
      comments: 48,
    },
    {
      title: 'How Rust is quietly taking over backend infrastructure',
      source: 'The Pragmatic Engineer',
      upvotes: 1631,
      comments: 305,
    },
    {
      title: 'CSS :has() is a game changer — here is why',
      source: 'web.dev',
      upvotes: 724,
      comments: 61,
    },
    {
      title: 'Stop over-engineering your React state',
      source: 'Kent C. Dodds',
      upvotes: 988,
      comments: 132,
    },
  ],
  'trend',
);

export const mockDiscussions = build(
  [
    {
      title: 'Is TypeScript still worth it in 2025? An honest take',
      source: 'Hacker News',
      upvotes: 2104,
      comments: 612,
    },
    {
      title: 'We migrated 2M lines from JS to TS. Here is what broke',
      source: 'Engineering Blog',
      upvotes: 1456,
      comments: 388,
    },
    {
      title: 'Why your team keeps shipping bugs (and how to stop)',
      source: 'LeadDev',
      upvotes: 903,
      comments: 277,
    },
    {
      title: 'The case against microservices for small teams',
      source: 'InfoQ',
      upvotes: 1188,
      comments: 341,
    },
    {
      title: 'AI pair programming: hype vs. what actually helps',
      source: 'Stack Overflow Blog',
      upvotes: 1675,
      comments: 459,
    },
  ],
  'disc',
);

export const mockTools = build(
  [
    {
      title: 'Biome: the all-in-one toolchain replacing ESLint + Prettier',
      source: 'Biome',
      upvotes: 1320,
      comments: 142,
    },
    {
      title: 'Bun 1.2 is fast — benchmarks that surprised me',
      source: 'Bun',
      upvotes: 1899,
      comments: 233,
    },
    {
      title: 'Zod 4 is here: smaller, faster schema validation',
      source: 'Total TypeScript',
      upvotes: 1044,
      comments: 88,
    },
    {
      title: 'The VS Code extensions every developer should install',
      source: 'Visual Studio Code',
      upvotes: 2210,
      comments: 401,
    },
    {
      title: 'Drizzle vs Prisma: which ORM in 2025?',
      source: 'Drizzle ORM',
      upvotes: 967,
      comments: 176,
    },
  ],
  'tool',
);
