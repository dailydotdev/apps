import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ShareGrid } from '@dailydotdev/shared/src/components/cards/share/ShareGrid';
import { CollectionGrid } from '@dailydotdev/shared/src/components/cards/collection/CollectionGrid';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import PollGrid from '@dailydotdev/shared/src/components/cards/poll/PollGrid';

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

const mockSquadSource = {
  id: 'squad-1',
  handle: 'devs',
  name: 'Developer Squad',
  permalink: 'https://app.daily.dev/squads/devs',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/squad',
  type: 'squad' as const,
  active: true,
  public: true,
  membersCount: 150,
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

const make = (overrides: Record<string, unknown>): Post =>
  ({ ...basePost, ...overrides } as unknown as Post);

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

// Mixed post types — shared-to-squad, collection and freeform float over their
// cover image; the text-only freeform and the poll deliberately keep the inline
// bar because there is no image to float over.
const sharePost = make({
  id: 'glass-share',
  title: 'Great breakdown of edge rendering — worth a read',
  source: mockSquadSource,
  type: PostType.Share,
  sharedPost: {
    id: 'shared-article-1',
    title: 'TypeScript Best Practices for 2024',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
    readTime: 11,
    permalink: 'https://api.daily.dev/r/shared-article-1',
    commentsPermalink: 'https://app.daily.dev/posts/shared-article-1',
    summary: 'Learn the best TypeScript practices for modern development.',
    createdAt: '2024-01-07T19:26:43.146Z',
    private: false,
    type: PostType.Article,
    tags: ['typescript'],
    source: mockSource,
  },
});

const collectionPost = make({
  id: 'glass-collection',
  title: 'Essential React Hooks Every Developer Should Know',
  source: mockSource,
  type: PostType.Collection,
  readTime: 15,
  collectionSources: [mockSource, mockSquadSource],
  numCollectionSources: 5,
});

const freeformPost = make({
  id: 'glass-freeform',
  title: 'Just shipped a new feature! 🚀',
  source: mockSquadSource,
  type: PostType.Freeform,
  contentHtml: '<p>Just shipped a new feature! 🚀</p>',
});

const freeformTextPost = make({
  id: 'glass-freeform-text',
  title: 'A text-only markdown post',
  source: mockSquadSource,
  type: PostType.Freeform,
  image: undefined,
  contentHtml:
    '<p>This freeform post has no cover image, so the glass bar floats over the bottom of the text — which blurs through the glass.</p>',
});

const pollPost = make({
  id: 'glass-poll',
  title: 'What is your favorite programming language for 2024?',
  source: mockSquadSource,
  type: PostType.Poll,
  pollOptions: [
    { id: 'opt-1', text: 'JavaScript', order: 1, numVotes: 45 },
    { id: 'opt-2', text: 'Python', order: 2, numVotes: 32 },
    { id: 'opt-3', text: 'TypeScript', order: 3, numVotes: 28 },
  ],
  endsAt: '2026-01-22T10:30:00.000Z',
  numPollVotes: 105,
});

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
        shorter because the bar no longer takes its own row. By default it shows
        a compact left-aligned peek (upvotes + comments only) so it barely
        covers the artwork; <strong>hover a card</strong> to expand it into the
        full action bar. On touch devices the full bar is always shown. Gated by
        the <code>feed_card_glass_actions</code> GrowthBook flag (on by default
        in this mock-up). Toggle Storybook&apos;s light/dark theme to see both.
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

      <h3 className="mb-2 mt-12 text-xl font-bold text-text-primary">
        Other post types
      </h3>
      <p className="mb-6 max-w-2xl text-sm text-text-tertiary">
        Every post type gets the floating bar. Shared-to-squad, collection and
        image freeform cards float it over their cover image; the text-only
        markdown post floats it over the bottom of the content (which blurs
        through the glass); the poll reserves a little space at the bottom so it
        never covers the vote options. (Storybook force-enables the separate
        shared-post-preview experiment, so the share card here shows its preview
        layout with the inline bar; with that experiment off — the default — a
        shared-to-squad post uses the cover image and gets the glass bar.)
      </p>
      <div
        className="mx-auto grid grid-cols-3 gap-8"
        style={{
          ...gridContainerStyle,
          maxWidth:
            'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
        }}
      >
        <ShareGrid post={sharePost} {...actionHandlers} />
        <CollectionGrid post={collectionPost} {...actionHandlers} />
        <FreeformGrid post={freeformPost} {...actionHandlers} />
        <FreeformGrid post={freeformTextPost} {...actionHandlers} />
        <PollGrid post={pollPost} {...actionHandlers} />
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
