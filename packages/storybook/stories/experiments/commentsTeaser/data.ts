import type { Author, Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import type { PostCommentsData } from '@dailydotdev/shared/src/graphql/comments';

// Synthetic people and comments: no real reader's name, handle or avatar
// ends up in Storybook. Avatars are initials on a flat colour, drawn here.

const avatar = (initials: string, hue: number): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="hsl(${hue} 45% 42%)"/><text x="40" y="51" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>`,
  )}`;

const person = (
  id: string,
  name: string,
  username: string,
  hue: number,
  reputation: number,
): Author => ({
  id,
  name,
  username,
  image: avatar(
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2),
    hue,
  ),
  permalink: `https://app.daily.dev/${username}`,
  reputation,
});

export const people = {
  maya: person('sb-maya', 'Maya Torres', 'mayadev', 12, 4210),
  ken: person('sb-ken', 'Ken Okafor', 'kenokafor', 205, 1830),
  lior: person('sb-lior', 'Lior Ben-Ami', 'liorba', 150, 960),
  priya: person('sb-priya', 'Priya Raman', 'priyar', 280, 12400),
  tomas: person('sb-tomas', 'Tomas Lind', 'tlind', 35, 310),
  aiko: person('sb-aiko', 'Aiko Mori', 'aikom', 330, 2750),
  sam: person('sb-sam', 'Sam Reyes', 'samr', 95, 88),
  noor: person('sb-noor', 'Noor Haddad', 'noorh', 180, 5600),
};

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3600 * 1000).toISOString();

const html = (text: string): string =>
  text
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('');

let counter = 0;
const comment = (
  author: Author,
  text: string,
  upvotes: number,
  hours: number,
  replies: Comment[] = [],
): Comment => {
  counter += 1;
  const id = `sb-c${counter}`;
  return {
    __typename: 'Comment',
    id,
    content: text,
    contentHtml: html(text),
    author,
    createdAt: hoursAgo(hours),
    permalink: `https://app.daily.dev/posts/sb#c-${id}`,
    numUpvotes: upvotes,
    numAwards: 0,
    children: {
      edges: replies.map((node) => ({ node, cursor: node.id })),
      pageInfo: { hasNextPage: false, endCursor: '' },
    } as Connection<Comment>,
  };
};

/** Top-level comments, most upvoted first, a few with replies. */
export const allComments: Comment[] = [
  comment(
    people.priya,
    'The part about reaching for the phone in every queue hit home. I started leaving it in my bag on walks and the first week was genuinely uncomfortable. Week three is when the good ideas started showing up again.',
    48,
    20,
    [
      comment(
        people.ken,
        'Same. Most of my "shower thoughts" for hard bugs came back once I stopped filling every gap with a podcast.',
        12,
        18,
      ),
      comment(
        people.maya,
        'Week three matches my experience too. The itch fades and something else moves in.',
        7,
        16,
      ),
      comment(
        people.sam,
        'Trying this tomorrow. No phone on the walk to the office.',
        3,
        9,
      ),
    ],
  ),
  comment(
    people.lior,
    'I think this is also why rubber-ducking works. Explaining the problem forces the slow, bored kind of thinking that we skip when we jump straight to search.',
    31,
    22,
  ),
  comment(
    people.aiko,
    'Counterpoint: boredom was never the goal, unstructured time was. A notebook and no agenda gets me the same result without pretending I enjoy being bored.',
    26,
    14,
    [
      comment(
        people.noor,
        'That distinction matters. "Bored" sounds like a punishment, "unscheduled" sounds like a plan.',
        9,
        12,
      ),
    ],
  ),
  comment(
    people.tomas,
    'Our team tried "no-meeting Wednesday afternoons" for this exact reason. Half the team filled it with Slack anyway.',
    17,
    11,
  ),
  comment(
    people.noor,
    'Would love a follow-up on how this plays with on-call. Hard to be bored when the pager might go off.',
    9,
    8,
  ),
  comment(
    people.maya,
    'Saving this for the next time someone asks me why I take the long way home.',
    6,
    6,
  ),
  comment(
    people.ken,
    'The best architecture decision I made last year came from a two-hour delay at an airport with a dead laptop.',
    5,
    4,
  ),
];

/** A comment long enough to clamp, for the "long first comment" case. */
export const longComment: Comment = comment(
  people.priya,
  [
    'Long one, sorry. I have been running a small experiment for six months: every day I block 30 minutes with nothing in the calendar entry and no device in reach. No reading, no podcast, no "quick" check of the build.',
    'The first month was mostly anxiety about what I might be missing. The second month I started carrying a notebook because ideas kept arriving at inconvenient moments. By month four I had a backlog of fixes for things that had annoyed me for years, and two of them shipped.',
    'The surprising part was not the ideas themselves but how much calmer code review felt. When you are not context-switching every ninety seconds you actually read the diff.',
  ].join('\n\n'),
  64,
  26,
);

/** Every comment, replies included, the way post.numComments counts them. */
export const countAll = (comments: Comment[]): number =>
  comments.reduce(
    (total, { children }) => total + 1 + (children?.edges.length ?? 0),
    0,
  );

export const toCommentsData = (comments: Comment[]): PostCommentsData => ({
  postComments: {
    edges: comments.map((node) => ({ node, cursor: node.id })),
    pageInfo: { hasNextPage: false, endCursor: '' },
  } as PostCommentsData['postComments'],
});

export interface Scenario {
  id: string;
  label: string;
  /** What the reader sees, in one line. */
  summary: string;
  comments: Comment[];
  /** post.numComments; defaults to every comment, replies included. */
  numComments?: number;
}

const withoutReplies = (comments: Comment[]): Comment[] =>
  comments.map((item) => ({
    ...item,
    children: { ...item.children!, edges: [] },
  }));

export const scenarios: Scenario[] = [
  {
    id: 'none',
    label: 'No comments',
    summary: 'Skeleton only, "Join the conversation".',
    comments: [],
  },
  {
    id: 'one',
    label: '1 comment',
    summary: 'The one comment, then the skeleton. Nothing is hidden.',
    comments: withoutReplies(allComments.slice(1, 2)),
  },
  {
    id: 'three',
    label: '3 comments',
    summary:
      'All three show. Nothing is hidden, so the copy invites, not teases.',
    comments: withoutReplies(allComments.slice(1, 4)),
  },
  {
    id: 'four',
    label: '4 comments',
    summary: 'Three show, the fourth is behind the gate.',
    comments: withoutReplies(allComments.slice(1, 5)),
  },
  {
    id: 'many',
    label: '11 comments, with replies',
    summary: 'Three top comments, their replies folded behind sign-up.',
    comments: allComments,
  },
  {
    id: 'huge',
    label: '1.2K comments',
    summary: 'The count on the gate is the real total, compact.',
    comments: allComments,
    numComments: 1214,
  },
  {
    id: 'long',
    label: 'Long first comment',
    summary: 'Comments show in full; the gate never cuts a comment in half.',
    comments: [longComment, ...withoutReplies(allComments.slice(1, 4))],
  },
];

export const scenarioById = (id: string): Scenario =>
  scenarios.find((item) => item.id === id) ?? scenarios[0];

export const totalOf = (scenario: Scenario): number =>
  scenario.numComments ?? countAll(scenario.comments);
