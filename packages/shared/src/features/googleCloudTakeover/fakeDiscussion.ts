import type { QueryClient } from '@tanstack/react-query';
import type { Author, Comment, PostCommentsData } from '../../graphql/comments';
import { generateCommentsQueryKey, getAllCommentsQuery } from '../../lib/query';

// A simulated discussion for the sponsored Google Cloud blog post, so the
// sales demo can show engagement. Seeded straight into the comments query
// cache (and pinned so a refetch can't clear it) since the post isn't a real
// backend post.

// Real avatar photos (deterministic per index) so the discussion doesn't look
// like a placeholder. Verified company logos use GitHub org avatars, which
// redirect to the real image and load reliably.
const avatar = (img: number): string => `https://i.pravatar.cc/150?img=${img}`;
const orgLogo = (org: string): string => `https://github.com/${org}.png`;

type Person = {
  name: string;
  username: string;
  img: number;
  reputation: number;
  company?: { name: string; org: string };
};

const people: Person[] = [
  {
    name: 'Priya Sharma',
    username: 'priyabuilds',
    img: 5,
    reputation: 18430,
    company: { name: 'Vercel', org: 'vercel' },
  },
  { name: 'Marcus Lee', username: 'marcusdev', img: 12, reputation: 9120 },
  {
    name: 'Sofia Alvarez',
    username: 'sofiacodes',
    img: 47,
    reputation: 31280,
    company: { name: 'Stripe', org: 'stripe' },
  },
  { name: 'Tom Becker', username: 'tbecker', img: 33, reputation: 2740 },
  {
    name: 'Aisha Khan',
    username: 'aishak',
    img: 23,
    reputation: 12660,
    company: { name: 'Microsoft', org: 'microsoft' },
  },
  { name: 'Daniel Park', username: 'dpark', img: 8, reputation: 5380 },
  {
    name: 'Lena Novak',
    username: 'lenan',
    img: 16,
    reputation: 44910,
    company: { name: 'GitHub', org: 'github' },
  },
  { name: 'Owen Wright', username: 'owenw', img: 51, reputation: 870 },
  {
    name: 'Rina Tanaka',
    username: 'rinat',
    img: 44,
    reputation: 21540,
    company: { name: 'Datadog', org: 'DataDog' },
  },
  { name: 'Caleb Stone', username: 'cstone', img: 60, reputation: 3960 },
  { name: 'Mira Patel', username: 'mirap', img: 26, reputation: 15070 },
  { name: 'Jonas Vogel', username: 'jvogel', img: 14, reputation: 6620 },
];

const remarks = [
  'The Spot VM optimization is going to cut our batch costs significantly. Already testing it this week.',
  'Finally proper in-country processing for Gemini. This unblocks a sovereign workload we shelved last year.',
  'The serverless Spark improvements look great. Cold starts were the only thing holding us back.',
  'Gemini Enterprise integration with our data warehouse is exactly what the team has been asking for.',
  'Good roundup. The agentic tooling updates alone are worth a read for anyone shipping AI features.',
  'Migrated a service to managed clusters last month — the autoscaling changes here would have saved us a lot of tuning.',
  'Curious how the new API management features compare to what we built in-house. Might be time to switch.',
  'The multi-tenant guidance is solid. We learned most of this the hard way.',
  'Bookmarking this. The links to the deep-dive posts are the real value here.',
  'Been waiting for the VS Code workbench notebooks to go GA. Local + managed compute is the dream workflow.',
  'Anyone tried the new data residency controls in production yet? Wondering about latency impact.',
  'The cost optimizer recommendations have been surprisingly accurate for our fleet. Nice to see it expanding.',
  'Great to see first-class support for this. The docs are clearer than they used to be too.',
  'We run a similar stack and the reliability numbers they quote line up with what we see.',
  'This is the kind of update that quietly makes day-to-day infra work less painful.',
  'Shared this with the platform team. A few of these land directly on our roadmap.',
];

const days = [
  '2026-06-20T11:40:00.000Z',
  '2026-06-20T09:15:00.000Z',
  '2026-06-19T18:05:00.000Z',
  '2026-06-19T08:30:00.000Z',
  '2026-06-18T20:50:00.000Z',
];

// Hand-tuned, granular upvote counts so they don't all cluster around one
// value — a real discussion has a long tail of low-engagement replies and a
// few standouts.
const upvotes = [
  214, 7, 86, 1, 132, 19, 3, 58, 0, 41, 9, 167, 24, 2, 73, 12, 38, 5, 95, 0, 16,
  49, 4, 121, 8, 31, 1, 62, 14, 6, 88, 0, 27, 53, 3, 109, 11, 2, 44, 19, 7, 76,
  0, 35, 5, 23, 1, 64,
];

const buildComments = (count: number): Comment[] =>
  Array.from({ length: count }).map((_, i) => {
    const person = people[i % people.length];
    const text = remarks[i % remarks.length];
    const author: Author = {
      id: `gcp-author-${i}`,
      name: person.name,
      username: person.username,
      permalink: `https://app.daily.dev/${person.username}`,
      image: avatar(person.img),
      reputation: person.reputation,
      createdAt: '2021-03-01T00:00:00.000Z',
      companies: person.company
        ? [
            {
              id: person.company.org,
              name: person.company.name,
              image: orgLogo(person.company.org),
              createdAt: new Date('2021-01-01'),
              updatedAt: new Date('2021-01-01'),
            },
          ]
        : undefined,
    } as Author;

    return {
      id: `gcp-comment-${i}`,
      content: text,
      contentHtml: `<p>${text}</p>`,
      contentEmbeds: [],
      createdAt: days[i % days.length],
      lastUpdatedAt: days[i % days.length],
      permalink: 'https://cloud.google.com/blog',
      numUpvotes: upvotes[i % upvotes.length],
      numAwards: 0,
      author,
      children: { edges: [], pageInfo: { hasNextPage: false } },
    } as Comment;
  });

export const buildGoogleCloudDiscussion = (count = 48): PostCommentsData => ({
  postComments: {
    edges: buildComments(count).map((node) => ({ node })),
    pageInfo: { hasNextPage: false, endCursor: null },
  },
});

// Seed every comments-query-key variant for the post and pin it so the live
// (empty) refetch can't replace the simulated discussion.
export const seedGoogleCloudDiscussion = (
  queryClient: QueryClient,
  postId: string,
  count = 48,
): void => {
  const data = buildGoogleCloudDiscussion(count);
  const keys = [
    generateCommentsQueryKey({ postId }),
    ...getAllCommentsQuery(postId),
  ];
  keys.forEach((key) => {
    queryClient.setQueryDefaults(key, {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryData(key, data);
  });
};
