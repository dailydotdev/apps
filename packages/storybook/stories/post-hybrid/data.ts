import type { Ad, Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';

// One realistic data set for every Post Page Hybrid story. The real
// production components (comments, widgets, action bar) read it from a
// seeded query cache, so the page renders without the API.

const hoursAgo = (h: number): string =>
  new Date(Date.now() - h * 3_600_000).toISOString();

const postImage = (hash: string): string =>
  `https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/${hash}?_a=AQAEuop`;

export const people = {
  maya: {
    id: 'u-maya',
    name: 'Maya Levin',
    username: 'mayalevin',
    image:
      'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
    permalink: 'https://app.daily.dev/mayalevin',
    bio: 'Staff engineer, databases and the things that make them slow.',
    reputation: 4820,
    createdAt: '2021-03-02T10:00:00.000Z',
  },
  omer: {
    id: 'u-omer',
    name: 'Omer Katz',
    username: 'omerk',
    image:
      'https://media.daily.dev/image/upload/s--CAIUuwxP--/f_auto,q_auto/v1701901463/avatars/avatar_5Q1yteeM08cxesQG2actL',
    permalink: 'https://app.daily.dev/omerk',
    createdAt: '2022-05-10T10:00:00.000Z',
    reputation: 1290,
  },
  priya: {
    id: 'u-priya',
    name: 'Priya Natarajan',
    username: 'priyan',
    image:
      'https://media.daily.dev/image/upload/s--IOCG5ocV--/f_auto/v1745861623/avatars/avatar_lfRKMBQjVJU9aG1HuqtVg',
    permalink: 'https://app.daily.dev/priyan',
    createdAt: '2022-05-10T10:00:00.000Z',
    reputation: 860,
  },
  lucas: {
    id: 'u-lucas',
    name: 'Lucas Moreau',
    username: 'lucasm',
    image:
      'https://media.daily.dev/image/upload/s--M_c0s8Ky--/f_auto/v1721658650/avatars/avatar_WVJSfJtDe63PxQFAsmXFO',
    permalink: 'https://app.daily.dev/lucasm',
    createdAt: '2022-05-10T10:00:00.000Z',
    reputation: 312,
  },
  dana: {
    id: 'u-dana',
    name: 'Dana Cohen',
    username: 'danacodes',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-',
    permalink: 'https://app.daily.dev/danacodes',
    createdAt: '2022-05-10T10:00:00.000Z',
    reputation: 2104,
  },
};

const publication = {
  id: 'hackaday',
  handle: 'hackaday',
  name: 'Hackaday',
  type: SourceType.Machine,
  image:
    'https://media.daily.dev/image/upload/s--JhDfhy70--/f_auto,q_auto/v1767541814/logos/hackaday',
  permalink: 'https://app.daily.dev/sources/hackaday',
  description:
    'Fresh hacks every day. Hardware, software and the people who build them.',
  membersCount: 48200,
  flags: { totalUpvotes: 391000 },
  public: true,
};

const videoChannel = {
  id: 'fireship',
  handle: 'fireship',
  name: 'Fireship',
  type: SourceType.Machine,
  image:
    'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
  permalink: 'https://app.daily.dev/sources/fireship',
  description: 'High-intensity code tutorials and tech news.',
  membersCount: 126000,
  flags: { totalUpvotes: 1_240_000 },
  public: true,
};

export const squad = {
  id: 'sq-backend',
  handle: 'backend',
  name: 'Backend Engineers',
  type: SourceType.Squad,
  image:
    'https://media.daily.dev/image/upload/s--E7LK6L3y--/f_auto,q_auto/v1774179051/logos/expo-blog?_a=BAMAMiWQ0',
  permalink: 'https://app.daily.dev/squads/backend',
  description: 'Databases, queues, APIs and the war stories behind them.',
  membersCount: 18400,
  flags: { totalUpvotes: 92000, totalPosts: 2210 },
  public: true,
  active: true,
  features: {},
};

const summary =
  'The team traced a 900 ms p99 on their busiest endpoint to one composite index that Postgres stopped using once the table passed 200 million rows. Instead of adding hardware, they replaced it with three partial indexes scoped to the hot status values, rewrote two ORM queries so the planner could see the predicate, and moved a nightly backfill off the primary. ' +
  'p99 dropped from 900 ms to 170 ms and the primary’s CPU fell by a third. The write-up walks through the EXPLAIN plans before and after, why the planner flipped to a sequential scan, and how they tested each index on a production snapshot before shipping it. ' +
  'It closes with the checklist they now run before every new index: measure selectivity, check the write amplification, and confirm the planner actually picks it under real parameter values, not the ones in your test fixtures.';

export const articlePost: Post = {
  id: 'hybrid-article',
  type: PostType.Article,
  title:
    'How we cut our Postgres p99 by 80% with three partial indexes and zero new hardware',
  summary,
  permalink: 'https://hackaday.com/postgres-partial-indexes',
  commentsPermalink: 'https://app.daily.dev/posts/hybrid-article',
  domain: 'hackaday.com',
  createdAt: hoursAgo(9),
  readTime: 11,
  image: postImage('7eeedd824847f90cc09aade5c25acad5'),
  source: publication as unknown as Post['source'],
  author: people.maya as unknown as Post['author'],
  tags: ['postgresql', 'database', 'performance', 'backend', 'sql'],
  numUpvotes: 412,
  numComments: 10,
  numAwards: 3,
  bookmarked: false,
  userState: { vote: UserVote.None, flags: {} } as Post['userState'],
  toc: [
    { text: 'The 900 ms mystery', id: 'mystery' },
    { text: 'Why the planner gave up', id: 'planner' },
    { text: 'Three partial indexes', id: 'indexes' },
    { text: 'The checklist', id: 'checklist' },
  ] as Post['toc'],
};

export const videoPost: Post = {
  ...articlePost,
  id: 'hybrid-video',
  type: PostType.VideoYouTube,
  title: 'Postgres in 100 seconds, and the one index everybody gets wrong',
  summary:
    'A fast tour of how Postgres stores rows, what an index actually costs on every write, and why partial and covering indexes are the cheapest performance win most teams never try. Ends with a live EXPLAIN ANALYZE before and after.',
  domain: 'youtube.com',
  permalink: 'https://www.youtube.com/watch?v=n2Fluyr3lbc',
  videoId: 'n2Fluyr3lbc',
  image: postImage('e1c76dd75f21885653c4d5b8baac1cda'),
  readTime: 3,
  source: videoChannel as unknown as Post['source'],
  author: undefined,
  toc: undefined,
  numUpvotes: 1280,
  numComments: 10,
};

export const squadSharePost: Post = {
  id: 'hybrid-share',
  type: PostType.Share,
  title:
    'We hit exactly this last quarter. The partial index trick saved us a replica, worth reading the EXPLAIN section twice.',
  createdAt: hoursAgo(3),
  permalink: 'https://app.daily.dev/posts/hybrid-share',
  commentsPermalink: 'https://app.daily.dev/posts/hybrid-share',
  image: articlePost.image,
  source: squad as unknown as Post['source'],
  author: people.dana as unknown as Post['author'],
  sharedPost: articlePost as Post['sharedPost'],
  tags: [],
  numUpvotes: 86,
  numComments: 10,
  numAwards: 0,
  bookmarked: false,
  userState: { vote: UserVote.None, flags: {} } as Post['userState'],
};

export const freeformPost: Post = {
  id: 'hybrid-freeform',
  type: PostType.Freeform,
  title: 'What is your rule of thumb before adding a new index?',
  contentHtml:
    '<p>Every few months someone on our team adds an index to fix one slow query and we pay for it on every write. I am trying to write a short checklist we can put in the PR template.</p><p>So far:</p><ul><li>Measure selectivity on production data, not fixtures</li><li>Check write amplification on the hottest table</li><li>Confirm the planner picks it with real parameter values</li></ul><p>What would you add? Anything you learned the hard way?</p>',
  createdAt: hoursAgo(5),
  permalink: 'https://app.daily.dev/posts/hybrid-freeform',
  commentsPermalink: 'https://app.daily.dev/posts/hybrid-freeform',
  image: postImage('29ea8864c396ba75ebaf16542f42fd22'),
  source: squad as unknown as Post['source'],
  author: people.omer as unknown as Post['author'],
  tags: [],
  numUpvotes: 54,
  numComments: 10,
  numAwards: 0,
  bookmarked: false,
  userState: { vote: UserVote.None, flags: {} } as Post['userState'],
};

const xAccount = {
  id: 'x-rauchg',
  handle: 'rauchg',
  name: 'Guillermo Rauch',
  type: SourceType.Machine,
  image:
    'https://media.daily.dev/image/upload/s--GalxSgjS--/f_auto/v1757768087/avatars/avatar_ezH33Lu6a37KM1SfsCwIx?_a=BAMClqZW0',
  permalink: 'https://app.daily.dev/sources/rauchg',
  description: 'CEO of Vercel.',
  membersCount: 9800,
  flags: { totalUpvotes: 41000 },
  public: true,
};

const extraSource = (
  id: string,
  name: string,
  image: string,
  description: string,
) => ({
  id,
  handle: id,
  name,
  type: SourceType.Machine,
  image,
  permalink: `https://app.daily.dev/sources/${id}`,
  description,
  membersCount: 12000,
  flags: { totalUpvotes: 54000 },
  public: true,
});

const encoreBlog = extraSource(
  'encore-blog',
  'Encore',
  'https://media.daily.dev/image/upload/s--8Bz0eBFn--/f_auto,q_auto/v1780213589/logos/encore-blog?_a=BAMAMiWQ0',
  'Backend engineering, from the people who build Encore.',
);
const expoBlog = extraSource(
  'expo-blog',
  'Expo',
  'https://media.daily.dev/image/upload/s--E7LK6L3y--/f_auto,q_auto/v1774179051/logos/expo-blog?_a=BAMAMiWQ0',
  'News and guides from the Expo team.',
);
const roundTheCode = extraSource(
  'roundthecode',
  'Round The Code',
  'https://media.daily.dev/image/upload/s--HmwWBSI1--/f_auto,q_auto/v1791119052/logos/roundthecode?_a=BAMAMicg0',
  '.NET and web development tutorials.',
);
const unoPlatform = extraSource(
  'uno-platform',
  'Uno Platform',
  'https://media.daily.dev/image/upload/s--04Uc7--c--/f_auto,q_auto/v1783840777/logos/uno-platform?_a=BAMAMicg0',
  'Cross-platform .NET apps, from the Uno team.',
);

const collectionsSource = {
  id: 'collections',
  handle: 'collections',
  name: 'Collections',
  type: SourceType.Machine,
  image:
    'https://media.daily.dev/image/upload/s--8Bz0eBFn--/f_auto,q_auto/v1780213589/logos/encore-blog?_a=BAMAMiWQ0',
  permalink: 'https://app.daily.dev/sources/collections',
  description: 'The best of the week, stitched together from every source.',
  membersCount: 210000,
  flags: { totalUpvotes: 2_400_000 },
  public: true,
};

const briefingSource = {
  id: 'briefing',
  handle: 'briefing',
  name: 'Presidential briefing',
  type: SourceType.Machine,
  image:
    'https://media.daily.dev/image/upload/s--K2OWMAgB--/f_auto,q_auto/v1774960837/logos/ssp-sh?_a=BAMAMiWQ0',
  permalink: 'https://app.daily.dev/sources/briefing',
  public: true,
};

const linkedArticle: Post = {
  ...articlePost,
  id: 'hybrid-linked-article',
  title: 'Zero-downtime migrations on a 2 TB table',
  summary:
    'How a payments team ran an online schema change on its largest table: shadow writes, a backfill throttled by replica lag, and a cutover that took four seconds.',
  domain: 'hackaday.com',
  permalink: 'https://hackaday.com/zero-downtime-migrations',
  image: postImage('bbf3ebb2a1127728d3d490a948939068'),
  readTime: 9,
};

export const sharedLinkPost: Post = {
  ...squadSharePost,
  id: 'hybrid-shared-link',
  title: linkedArticle.title,
  author: people.lucas as unknown as Post['author'],
  sharedPost: linkedArticle as Post['sharedPost'],
};

export const sharedVideoPost: Post = {
  ...squadSharePost,
  id: 'hybrid-shared-video',
  title:
    'Short and sharp. The index part at 1:40 is the best explanation I have seen.',
  author: people.priya as unknown as Post['author'],
  sharedPost: videoPost as Post['sharedPost'],
};

export const tweetPost: Post = {
  id: 'hybrid-tweet',
  type: PostType.SocialTwitter,
  subType: 'tweet',
  title:
    'Partial indexes are the most underrated Postgres feature. One line of SQL, a third of the write cost, and the planner finally does what you meant.',
  createdAt: hoursAgo(4),
  permalink: 'https://x.com/rauchg/status/1',
  commentsPermalink: 'https://app.daily.dev/posts/hybrid-tweet',
  domain: 'x.com',
  image: postImage('8702cf7f6ed5c9ebb7331501764b9971'),
  source: xAccount as unknown as Post['source'],
  tags: ['postgresql', 'database'],
  numUpvotes: 214,
  numComments: 10,
  numAwards: 0,
  bookmarked: false,
  userState: { vote: UserVote.None, flags: {} } as Post['userState'],
} as Post;

export const sharedTweetPost: Post = {
  ...squadSharePost,
  id: 'hybrid-shared-tweet',
  title: 'This is the whole thread in one tweet.',
  author: people.omer as unknown as Post['author'],
  sharedPost: tweetPost as Post['sharedPost'],
};

export const collectionPost: Post = {
  ...articlePost,
  id: 'hybrid-collection',
  type: PostType.Collection,
  title: 'Postgres 18 is out: async I/O, virtual columns and faster upgrades',
  summary: undefined,
  contentHtml:
    '<p>Postgres 18 shipped this week, and six sources covered it from different angles. Here is what changed and why it matters.</p><h3>Async I/O</h3><p>Sequential scans and vacuum can now issue reads asynchronously. Early benchmarks show 2x to 3x faster cold reads on cloud disks.</p><h3>Virtual generated columns</h3><p>Generated columns are now virtual by default, computed on read instead of stored, so adding one no longer rewrites the table.</p><h3>Faster major upgrades</h3><p>pg_upgrade keeps planner statistics, so a freshly upgraded database no longer runs on guesses until ANALYZE finishes.</p>',
  domain: undefined,
  permalink: 'https://app.daily.dev/posts/hybrid-collection',
  image: postImage('e48a3996a227a289af7fda1442e5d398'),
  source: collectionsSource as unknown as Post['source'],
  author: undefined,
  numCollectionSources: 6,
  collectionSources: [
    publication,
    videoChannel,
    encoreBlog,
    expoBlog,
    roundTheCode,
    unoPlatform,
  ] as unknown as Post['collectionSources'],
  readTime: 4,
  toc: undefined,
  numUpvotes: 640,
};

export const pollPost: Post = {
  ...freeformPost,
  id: 'hybrid-poll',
  type: PostType.Poll,
  title: 'Which index type do you reach for first on a slow query?',
  contentHtml: undefined,
  image: undefined as unknown as string,
  author: people.maya as unknown as Post['author'],
  pollOptions: [
    { id: 'o1', text: 'Plain B-tree', order: 1, numVotes: 182 },
    { id: 'o2', text: 'Partial index', order: 2, numVotes: 96 },
    { id: 'o3', text: 'Covering index (INCLUDE)', order: 3, numVotes: 61 },
    { id: 'o4', text: 'I look at the query first', order: 4, numVotes: 140 },
  ],
  endsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  numPollVotes: 479,
  numUpvotes: 38,
};

export const briefPost: Post = {
  id: 'hybrid-brief',
  type: PostType.Brief,
  title: 'Your briefing for Tuesday',
  contentHtml:
    '<p>Postgres 18 lands with async I/O, a partial-index write-up is climbing the feeds, and Shopify takes Tailwind under its wing.</p><h2>Must know</h2><ul><li><strong>Postgres 18 is out</strong>: Async I/O, virtual generated columns and pg_upgrade that keeps statistics. <a href="https://daily.dev/posts/hybrid-collection">Read more</a></li><li><strong>Partial indexes cut a p99 by 80%</strong>: A team replaced one composite index with three partial ones and dropped a replica. <a href="https://daily.dev/posts/hybrid-article">Read more</a></li></ul><h2>Good to know</h2><ul><li><strong>Zero-downtime migrations on a 2 TB table</strong>: Shadow writes and a lag-throttled backfill. <a href="https://daily.dev/posts/hybrid-linked-article">Read more</a></li></ul>',
  createdAt: hoursAgo(2),
  permalink: 'https://app.daily.dev/posts/hybrid-brief',
  commentsPermalink: 'https://app.daily.dev/posts/hybrid-brief',
  image: postImage('63787cbd93e449475d5bf0ce461c4acb'),
  source: briefingSource as unknown as Post['source'],
  readTime: 3,
  tags: [],
  numUpvotes: 12,
  numComments: 10,
  numAwards: 0,
  bookmarked: false,
  userState: { vote: UserVote.None, flags: {} } as Post['userState'],
} as Post;

export enum PostKind {
  Article = 'Article',
  Video = 'Video',
  SquadPost = 'Squad post',
  SharedPost = 'Shared post',
  SharedLink = 'Shared link',
  SharedVideo = 'Shared video',
  SharedX = 'Shared X post',
  XPost = 'X post',
  Collection = 'Collection',
  Poll = 'Poll',
  Brief = 'Brief',
}

export const postsByKind: Record<PostKind, Post> = {
  [PostKind.Article]: articlePost,
  [PostKind.Video]: videoPost,
  [PostKind.SquadPost]: freeformPost,
  [PostKind.SharedPost]: squadSharePost,
  [PostKind.SharedLink]: sharedLinkPost,
  [PostKind.SharedVideo]: sharedVideoPost,
  [PostKind.SharedX]: sharedTweetPost,
  [PostKind.XPost]: tweetPost,
  [PostKind.Collection]: collectionPost,
  [PostKind.Poll]: pollPost,
  [PostKind.Brief]: briefPost,
};

/** What each type is, in a line, for the story list. */
export const kindNotes: Record<PostKind, string> = {
  [PostKind.Article]: 'A publication article: TLDR, cover, Read post.',
  [PostKind.Video]:
    'A YouTube video: the player opens small and grows on play.',
  [PostKind.SquadPost]:
    'A member writes a post in a Squad: author-led, markdown body.',
  [PostKind.SharedPost]:
    'A member shares an article into a Squad, with commentary.',
  [PostKind.SharedLink]:
    'A member shares a link into a Squad with nothing to add.',
  [PostKind.SharedVideo]: 'A member shares a video into a Squad.',
  [PostKind.SharedX]: 'A member shares an X post into a Squad.',
  [PostKind.XPost]: 'An X post daily.dev picked up on its own.',
  [PostKind.Collection]: 'A story stitched together from several sources.',
  [PostKind.Poll]: 'A member asks a question in a Squad.',
  [PostKind.Brief]: 'A Plus briefing: a written digest of the day.',
};

/** Related posts a collection is built from. */
export const collectionSources = [
  ['cs-1', 'Postgres 18 release notes, annotated', publication],
  ['cs-2', 'Benchmarking async I/O on EBS and local NVMe', publication],
  [
    'cs-3',
    'Virtual generated columns, explained in five queries',
    videoChannel,
  ],
  ['cs-4', 'Upgrading to 18 without an ANALYZE storm', encoreBlog],
  ['cs-5', 'What Postgres 18 means for your mobile backend', expoBlog],
  ['cs-6', 'Npgsql and Postgres 18: what changes for .NET', roundTheCode],
].map(([id, title, source]) => ({
  id: id as string,
  slug: id as string,
  title: title as string,
  commentsPermalink: `https://app.daily.dev/posts/${id}`,
  createdAt: hoursAgo(30),
  summary: '',
  source: source as typeof publication,
}));

/** Every source a collection is stitched from, for hover-card seeding. */
export const allCollectionSources = [
  publication,
  videoChannel,
  encoreBlog,
  expoBlog,
  roundTheCode,
  unoPlatform,
];

const comment = (
  id: string,
  author: (typeof people)[keyof typeof people],
  html: string,
  hours: number,
  numUpvotes: number,
  children: Comment[] = [],
): Comment => ({
  id,
  content: html.replace(/<[^>]+>/g, ''),
  contentHtml: html,
  createdAt: hoursAgo(hours),
  permalink: `https://app.daily.dev/posts/hybrid-article#c-${id}`,
  author: author as Comment['author'],
  numUpvotes,
  numAwards: 0,
  userState: { vote: UserVote.None } as Comment['userState'],
  children: {
    edges: children.map((node) => ({ node, cursor: node.id })),
    pageInfo: { hasNextPage: false },
  } as Comment['children'],
});

export const comments: Comment[] = [
  comment(
    'c1',
    people.omer,
    '<p>The part about the planner flipping to a seq scan once the table grew is the real lesson here. Statistics targets on the status column would have caught it months earlier.</p>',
    7,
    48,
    [
      comment(
        'c1r1',
        people.maya,
        '<p>Exactly, we bumped the stats target to 1000 on that column afterwards. Should have mentioned it in the post, will add it.</p>',
        6,
        21,
      ),
    ],
  ),
  comment(
    'c2',
    people.priya,
    '<p>Did you measure the write cost of three partial indexes against the one composite? On our side partial indexes were nearly free because the hot rows are a tiny slice.</p>',
    6,
    17,
  ),
  comment(
    'c3',
    people.lucas,
    '<p>Saving this for the checklist alone. "Confirm the planner picks it under real parameter values" is the step everyone skips.</p>',
    5,
    12,
  ),
  comment(
    'c4',
    people.dana,
    '<p>Moving the backfill off the primary probably did half the work here. Would love a follow-up on how you split the load.</p>',
    4,
    9,
    [
      comment(
        'c4r1',
        people.omer,
        '<p>+1, logical replica or a read-only pool?</p>',
        3,
        2,
      ),
    ],
  ),
  comment(
    'c5',
    people.omer,
    '<p>Great write-up. The before and after EXPLAIN plans side by side make it very easy to follow.</p>',
    2,
    4,
  ),
  comment(
    'c6',
    people.priya,
    '<p>Bookmarked. We are about to hit 200M rows on our events table and this is the exact failure mode I was worried about.</p>',
    1,
    3,
  ),
  comment(
    'c7',
    people.lucas,
    '<p>Curious whether you tried BRIN on the created_at side before going partial. For append-only tables it is tiny.</p>',
    1,
    2,
  ),
  comment(
    'c8',
    people.dana,
    '<p>Sharing this with our platform team, the testing-on-a-snapshot step is exactly what we were missing.</p>',
    0.5,
    1,
  ),
];

const relatedPost = (
  id: string,
  title: string,
  hash: string,
  numUpvotes: number,
  numComments: number,
  source = publication,
): Post =>
  ({
    id,
    title,
    permalink: `https://app.daily.dev/posts/${id}`,
    commentsPermalink: `https://app.daily.dev/posts/${id}`,
    slug: id,
    image: postImage(hash),
    readTime: 6,
    numUpvotes,
    numComments,
    numAwards: 0,
    bookmarked: false,
    source,
    tags: ['postgresql', 'database'],
  } as unknown as Post);

export const furtherReading = {
  trendingPosts: [
    {
      ...relatedPost(
        'fr-1',
        'Why your ORM is quietly doing N+1 queries in production',
        '296db54d934bea83d8826794f171b561',
        933,
        64,
      ),
      trending: 412,
    },
  ],
  similarPosts: [
    relatedPost(
      'fr-2',
      'Index-only scans: the Postgres feature you are probably not using',
      '24bcf3df26819756454e22826d32cf49',
      310,
      22,
    ),
    relatedPost(
      'fr-3',
      'A practical guide to EXPLAIN ANALYZE for application developers',
      'a4a6069d0b87d8bf0a39e361ac727ecf',
      201,
      15,
    ),
    relatedPost(
      'fr-4',
      'Zero-downtime migrations on a 2 TB table',
      'bbf3ebb2a1127728d3d490a948939068',
      188,
      31,
    ),
  ],
};

export const featuredArchives = {
  featuredArchives: [
    {
      id: 'ar-1',
      scopeType: 'tag',
      scopeId: 'postgresql',
      periodType: 'month',
      periodStart: '2026-09-01T00:00:00.000Z',
      keyword: { value: 'postgresql', flags: { title: 'PostgreSQL' } },
    },
    {
      id: 'ar-2',
      scopeType: 'tag',
      scopeId: 'database',
      periodType: 'year',
      periodStart: '2025-01-01T00:00:00.000Z',
      keyword: { value: 'database', flags: { title: 'Database' } },
    },
    {
      id: 'ar-3',
      scopeType: 'global',
      scopeId: null,
      periodType: 'month',
      periodStart: '2026-09-01T00:00:00.000Z',
    },
  ],
};

export const directAd: Ad = {
  company: 'Neon',
  source: 'Neon',
  tagLine: 'Serverless Postgres.',
  description:
    'Branch your database like code. Autoscaling, instant restores and a generous free tier.',
  image: postImage('d9e28a2f9fa6af540e6ff0ed7ee2b27d'),
  link: 'https://neon.tech',
  referralLink: 'https://neon.tech',
  callToAction: 'Start free',
  adDomain: 'neon.tech',
  providerId: 'sb-provider',
};
