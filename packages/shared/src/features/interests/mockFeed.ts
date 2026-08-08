import type { Post } from '../../graphql/posts';
import { PostType, UserVote } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';

const logo = (handle: string) =>
  `https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/${handle}`;
const cover = (index: number) =>
  `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${index}`;

const sources = {
  github: {
    id: 'github',
    handle: 'github',
    name: 'GitHub',
    permalink: 'https://app.daily.dev/sources/github',
    image: logo('github'),
    type: SourceType.Machine,
    public: true,
  },
  hn: {
    id: 'hn',
    handle: 'hn',
    name: 'Hacker News',
    permalink: 'https://app.daily.dev/sources/hn',
    image: logo('hn'),
    type: SourceType.Machine,
    public: true,
  },
  medium: {
    id: 'medium',
    handle: 'medium',
    name: 'Medium',
    permalink: 'https://app.daily.dev/sources/medium',
    image: logo('medium'),
    type: SourceType.Machine,
    public: true,
  },
  infoq: {
    id: 'infoq',
    handle: 'infoq',
    name: 'InfoQ',
    permalink: 'https://app.daily.dev/sources/infoq',
    image: logo('infoq'),
    type: SourceType.Machine,
    public: true,
  },
  echojs: {
    id: 'echojs',
    handle: 'echojs',
    name: 'Echo JS',
    permalink: 'https://app.daily.dev/sources/echojs',
    image: logo('echojs'),
    type: SourceType.Machine,
    public: true,
  },
  ph: {
    id: 'ph',
    handle: 'ph',
    name: 'Product Hunt',
    permalink: 'https://app.daily.dev/sources/ph',
    image: logo('ph'),
    type: SourceType.Machine,
    public: true,
  },
} as unknown as Record<string, Post['source']>;

const hoursAgo = (hours: number) =>
  new Date(Date.now() - 1000 * 60 * 60 * hours).toISOString();

type MockPostSeed = {
  id: string;
  title: string;
  summary: string;
  source: Post['source'];
  tags: string[];
  readTime: number;
  numUpvotes: number;
  numComments: number;
  hours: number;
  domain: string;
  cover: number;
  score: number;
  rationale: string;
  type?: PostType;
  contentHtml?: string;
};

const seeds: MockPostSeed[] = [
  {
    id: 'mock-finding-1',
    title:
      'Bun 2.0 ships a Zig-powered bundler that beats esbuild on cold start',
    summary:
      'The rewrite moves module resolution into Zig and drops the Go dependency entirely. Cold-start numbers are 3.1x better on the benchmark suite, with the caveat that watch mode is unchanged.',
    source: sources.github,
    tags: ['zig', 'bun', 'performance'],
    readTime: 7,
    numUpvotes: 412,
    numComments: 63,
    hours: 3,
    domain: 'github.com',
    cover: 1,
    score: 0.94,
    rationale:
      'Real benchmark numbers on a Zig rewrite, not an announcement — this is the kind of source-level post you keep opening.',
  },
  {
    id: 'mock-finding-2',
    title:
      'Writing a toy database in Zig: allocators, comptime and no hidden control flow',
    summary:
      'A maintainer walks through building a B-tree store from scratch, focusing on how explicit allocators change the design compared to the same project in Rust.',
    source: sources.medium,
    tags: ['zig', 'databases', 'systems'],
    readTime: 18,
    numUpvotes: 287,
    numComments: 41,
    hours: 9,
    domain: 'medium.com',
    cover: 2,
    score: 0.89,
    rationale:
      'Build-it-from-scratch walkthrough by a maintainer. Matches your interest in how allocators shape a design.',
  },
  {
    id: 'mock-finding-3',
    title:
      'TigerBeetle post-mortem: the deterministic simulator caught a bug we shipped anyway',
    summary:
      'An honest write-up of a production incident, and why deterministic simulation testing only helps if you actually read the failures it reports.',
    source: sources.hn,
    tags: ['zig', 'testing', 'distributed-systems'],
    readTime: 12,
    numUpvotes: 934,
    numComments: 188,
    hours: 14,
    domain: 'tigerbeetle.com',
    cover: 3,
    score: 0.87,
    rationale:
      'Honest post-mortem from the TigerBeetle team. You upvoted their last two write-ups.',
  },
  {
    id: 'mock-finding-4',
    title: 'Zig 0.15 release notes: the self-hosted backend is now the default',
    summary:
      'LLVM is no longer required for debug builds. Compile times drop sharply, and the incremental compilation work finally lands behind a flag.',
    source: sources.github,
    tags: ['zig', 'compilers', 'release'],
    readTime: 9,
    numUpvotes: 1204,
    numComments: 233,
    hours: 22,
    domain: 'ziglang.org',
    cover: 4,
    score: 0.85,
    rationale:
      'Core release news. Kept it even though you asked for fewer announcements — the self-hosted backend is a real shift.',
  },
  {
    id: 'mock-finding-5',
    title: 'Cross-compiling C projects with zig cc, one year in',
    summary:
      'A practical account of replacing an entire cross-compilation toolchain with zig cc — what worked, what broke, and the two cases that still need the old setup.',
    source: sources.infoq,
    tags: ['zig', 'c', 'toolchain'],
    readTime: 11,
    numUpvotes: 198,
    numComments: 27,
    hours: 30,
    domain: 'infoq.com',
    cover: 5,
    score: 0.78,
    rationale:
      'A year of production use rather than a first impression, which is what you said you wanted more of.',
  },
  {
    id: 'mock-finding-6',
    title:
      'Ghostty is now open source: a terminal written in Zig with native rendering everywhere',
    summary:
      'The long-awaited release includes GPU-accelerated rendering on macOS and Linux, plus a config format that deliberately avoids scripting.',
    source: sources.ph,
    tags: ['zig', 'terminal', 'open-source'],
    readTime: 6,
    numUpvotes: 1583,
    numComments: 302,
    hours: 38,
    domain: 'ghostty.org',
    cover: 6,
    score: 0.74,
    rationale:
      'Big launch and very high engagement. Slightly outside "projects" but the source is worth a read.',
  },
  {
    id: 'mock-finding-7',
    title: 'Benchmarking Zig against Rust and C for a hot-path parser',
    summary:
      'All three land within noise of each other once you match allocation strategies — the interesting differences are in build times and debug ergonomics.',
    source: sources.echojs,
    tags: ['zig', 'rust', 'benchmarks'],
    readTime: 14,
    numUpvotes: 156,
    numComments: 89,
    hours: 46,
    domain: 'echojs.com',
    cover: 7,
    score: 0.66,
    rationale:
      'Benchmarks are noisy, but the build-time comparison is the useful part.',
  },
  {
    id: 'mock-finding-8',
    title: 'comptime is not a macro system, and treating it like one will hurt',
    summary:
      'A short argument about the mental model behind Zig comptime, with three refactors that get simpler once you stop reaching for code generation.',
    source: sources.medium,
    tags: ['zig', 'language-design'],
    readTime: 8,
    numUpvotes: 341,
    numComments: 54,
    hours: 55,
    domain: 'medium.com',
    cover: 8,
    score: 0.61,
    rationale:
      'Opinion piece — lower confidence. Included because the refactors at the end are concrete.',
  },
  {
    id: 'mock-finding-9',
    title: 'Six Zig projects worth reading the source of',
    summary:
      'Short annotated tour of codebases that show idiomatic Zig, ordered by how approachable they are on a first read.',
    source: sources.hn,
    tags: ['zig', 'open-source', 'learning'],
    readTime: 10,
    numUpvotes: 622,
    numComments: 71,
    hours: 68,
    domain: 'news.ycombinator.com',
    cover: 1,
    score: 0.55,
    rationale:
      'Link roundup. Borderline for your quality bar, but it points at six codebases you have not seen yet.',
  },
];

const toMockPost = (seed: MockPostSeed): Post =>
  ({
    id: seed.id,
    title: seed.title,
    summary: seed.summary,
    permalink: `https://api.daily.dev/r/${seed.id}`,
    commentsPermalink: `https://app.daily.dev/posts/${seed.id}`,
    slug: seed.id,
    createdAt: hoursAgo(seed.hours),
    image: cover(seed.cover),
    readTime: seed.readTime,
    numUpvotes: seed.numUpvotes,
    numComments: seed.numComments,
    numAwards: 0,
    source: seed.source,
    tags: seed.tags,
    type: seed.type ?? PostType.Article,
    contentHtml: seed.contentHtml,
    domain: seed.domain,
    bookmarked: false,
    upvoted: false,
    commented: false,
    read: false,
    clickbaitTitleDetected: false,
    private: false,
    userState: { vote: UserVote.None },
  } as unknown as Post);

export const mockFeedPosts: Post[] = seeds.map(toMockPost);

export const mockFeedItems = seeds.map((seed) => ({
  id: seed.id,
  post: toMockPost(seed),
  score: seed.score,
  rationale: seed.rationale,
  createdAt: hoursAgo(seed.hours),
}));
