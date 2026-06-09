import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';

import ExtensionProviders from '../../extension/_providers';

const mockSource = {
  id: 'tds',
  handle: 'tds',
  name: 'Towards Data Science',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: 'machine' as const,
  active: true,
};

const mockAuthor = {
  id: 'author-1',
  name: 'John Developer',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  permalink: 'https://app.daily.dev/johndeveloper',
  username: 'johndeveloper',
  bio: 'Full-stack developer',
};

const basePost = {
  numUpvotes: 42,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['javascript', 'react', 'typescript'],
  source: mockSource,
  author: mockAuthor,
  readTime: 8,
  createdAt: '2024-01-15T10:30:00.000Z',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
  type: PostType.Article,
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
};

const make = (overrides: Partial<Post>): Post =>
  ({ ...basePost, ...overrides } as Post);

const posts: Post[] = [
  make({
    id: 'glass-1',
    title:
      'Understanding React Server Components: A Deep Dive into the Future of Web Development',
  }),
  make({
    id: 'glass-2',
    title: 'A short and punchy headline',
    numUpvotes: 1280,
    numComments: 342,
  }),
  make({
    id: 'glass-3',
    title: 'The TypeScript features you are probably not using yet',
    bookmarked: true,
  }),
  make({
    id: 'glass-4',
    title: 'Why everyone is talking about edge rendering in 2024',
    read: true,
    numUpvotes: 7,
  }),
  make({
    id: 'glass-5',
    title: 'Building resilient systems with queues and idempotency keys',
    trending: 25,
  }),
  make({
    id: 'glass-6',
    title: 'How we cut our bundle size in half (and what broke along the way)',
    userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
    upvoted: true,
    numUpvotes: 512,
  }),
];

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

const gridContainerStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
} as React.CSSProperties;

const GlassActionsGrid = () => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default p-8">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Feed cards — glass floating actions
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-text-tertiary">
        The engagement bar floats over the bottom of the cover image with an
        iOS-style dark glass (translucent + blur) treatment, and each card is
        shorter because the bar no longer takes its own row. Gated by the{' '}
        <code>feed_card_glass_actions</code> GrowthBook flag (on by default in
        this mock-up). Toggle Storybook&apos;s light/dark theme to see both.
      </p>
      <div
        className="mx-auto grid grid-cols-3 gap-8"
        style={{
          ...gridContainerStyle,
          maxWidth:
            'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
        }}
      >
        {posts.map((post) => (
          <ArticleGrid key={post.id} post={post} {...actionHandlers} />
        ))}
      </div>
    </div>
  </ExtensionProviders>
);

const meta: Meta = {
  title: 'Components/Cards/Glass Actions Grid',
  component: GlassActionsGrid,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const GlassActions: Story = {
  render: () => <GlassActionsGrid />,
  name: 'Glass Floating Actions',
};
