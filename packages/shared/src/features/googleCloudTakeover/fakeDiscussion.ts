import type { QueryClient } from '@tanstack/react-query';
import type { Author, Comment, PostCommentsData } from '../../graphql/comments';
import { generateCommentsQueryKey, getAllCommentsQuery } from '../../lib/query';

// A simulated discussion for the sponsored Google Cloud blog post, so the
// sales demo can show engagement. Seeded straight into the comments query
// cache (and pinned so a refetch can't clear it) since the post isn't a real
// backend post.

const avatar = (bg: string, initials: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='${bg}'/><text x='32' y='42' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='#ffffff' text-anchor='middle'>${initials}</text></svg>`,
  )}`;

const people = [
  { name: 'Priya Sharma', username: 'priyabuilds', color: '#4285F4' },
  { name: 'Marcus Lee', username: 'marcusdev', color: '#EA4335' },
  { name: 'Sofia Alvarez', username: 'sofiacodes', color: '#34A853' },
  { name: 'Tom Becker', username: 'tbecker', color: '#FBBC04' },
  { name: 'Aisha Khan', username: 'aishak', color: '#A142F4' },
  { name: 'Daniel Park', username: 'dpark', color: '#00ACC1' },
  { name: 'Lena Novak', username: 'lenan', color: '#F4511E' },
  { name: 'Owen Wright', username: 'owenw', color: '#3949AB' },
  { name: 'Rina Tanaka', username: 'rinat', color: '#00897B' },
  { name: 'Caleb Stone', username: 'cstone', color: '#8E24AA' },
  { name: 'Mira Patel', username: 'mirap', color: '#43A047' },
  { name: 'Jonas Vogel', username: 'jvogel', color: '#FB8C00' },
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

const buildComments = (count: number): Comment[] =>
  Array.from({ length: count }).map((_, i) => {
    const person = people[i % people.length];
    const initials = person.name
      .split(' ')
      .map((part) => part[0])
      .join('');
    const text = remarks[i % remarks.length];
    const author: Author = {
      id: `gcp-author-${i}`,
      name: person.name,
      username: person.username,
      permalink: `https://app.daily.dev/${person.username}`,
      image: avatar(person.color, initials),
    } as Author;

    return {
      id: `gcp-comment-${i}`,
      content: text,
      contentHtml: `<p>${text}</p>`,
      contentEmbeds: [],
      createdAt: days[i % days.length],
      lastUpdatedAt: days[i % days.length],
      permalink: 'https://cloud.google.com/blog',
      numUpvotes: Math.max(0, 47 - i),
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
