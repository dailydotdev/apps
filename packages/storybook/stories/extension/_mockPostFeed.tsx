import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';

// Real feed cards, not grey boxes: judging a sponsor strip means
// judging it against the visual weight of actual post covers.

const mockSource: Source = {
  id: 'tds',
  handle: 'tds',
  name: 'Towards Data Science',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: SourceType.Machine,
  public: true,
};

const TITLES = [
  'Understanding React Server Components: a deep dive into the future of the web',
  'Why your CI is slow, and the three fixes that actually matter',
  'Postgres indexing mistakes almost everyone makes',
  'A tour of the new TypeScript compiler internals',
  'How we cut our bundle size by 60% without dropping a feature',
  'LLM eval pipelines that do not lie to you',
  'The hidden cost of microservices, five years on',
  'Your retry logic is probably wrong',
];

// Spread through a Partial<Post> the way the other card stories do:
// the fixtures only carry the fields a grid card reads.
const basePost: Partial<Post> = {
  source: mockSource,
  tags: ['javascript', 'react', 'typescript'],
  type: PostType.Article,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
};

export const MOCK_POSTS: Post[] = TITLES.map(
  (title, index) =>
    ({
      ...basePost,
      id: `post-${index}`,
      title,
      summary: 'A short standfirst that sits under the title in some layouts.',
      permalink: `https://api.daily.dev/r/post-${index}`,
      commentsPermalink: `https://daily.dev/posts/post-${index}`,
      createdAt: '2026-01-15T10:30:00.000Z',
      readTime: 4 + (index % 7),
      numUpvotes: 18 + index * 13,
      numComments: 3 + index * 2,
      image: `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${
        (index % 8) + 1
      }`,
    } as Post),
);

const actionHandlers = {
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

/** Mirrors the app's FeedContainer grid variables. */
const gridStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
  maxWidth:
    'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
} as React.CSSProperties;

export function MockFeedGrid({
  /** Node spliced into the grid after `insertAfter` cards. */
  insert,
  insertAfter = 3,
  count = MOCK_POSTS.length,
}: {
  insert?: ReactNode;
  insertAfter?: number;
  count?: number;
}): ReactElement {
  const posts = MOCK_POSTS.slice(0, count);

  return (
    <div
      className="mx-auto grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3"
      style={gridStyle}
    >
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
          {insert && index === insertAfter ? insert : null}
          <ArticleGrid post={post} {...actionHandlers} />
        </React.Fragment>
      ))}
    </div>
  );
}

/** The feed's own chrome, so the strip is judged against real neighbours. */
export function MockFeedHeader(): ReactElement {
  return (
    <div
      className="mx-auto mb-6 flex w-full items-center gap-3"
      style={gridStyle}
    >
      <h1 className="font-bold text-text-primary typo-title3">For you</h1>
      <span
        className="ml-auto h-8 w-24 rounded-10 bg-surface-float"
        aria-hidden
      />
      <span className="h-8 w-8 rounded-10 bg-surface-float" aria-hidden />
    </div>
  );
}
