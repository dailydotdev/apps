import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

// Grid Cards
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import PollGrid from '@dailydotdev/shared/src/components/cards/poll/PollGrid';
import { ShareGrid } from '@dailydotdev/shared/src/components/cards/share/ShareGrid';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import { CollectionGrid } from '@dailydotdev/shared/src/components/cards/collection/CollectionGrid';

// List Cards
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import { ShareList } from '@dailydotdev/shared/src/components/cards/share/ShareList';
import { FreeformList } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformList';
import { CollectionList } from '@dailydotdev/shared/src/components/cards/collection/CollectionList';

import ExtensionProviders from '../../extension/_providers';

// Mock Data
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

const basePost: Partial<Post> = {
  numUpvotes: 42,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['javascript', 'react', 'typescript'],
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
};

const articlePost: Post = {
  ...basePost,
  id: 'article-1',
  title: 'Understanding React Server Components: A Deep Dive into the Future of Web Development',
  summary: 'Learn how React Server Components change the way we build web applications',
  permalink: 'https://api.daily.dev/r/article-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: mockSource,
  readTime: 8,
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  author: mockAuthor,
  type: PostType.Article,
} as Post;

const pollPost: Post = {
  ...basePost,
  id: 'poll-1',
  title: 'What is your favorite programming language for 2024?',
  summary: 'A poll about programming languages',
  permalink: 'https://api.daily.dev/r/poll-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: mockSquadSource,
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/poll-placeholder',
  commentsPermalink: 'https://daily.dev/posts/poll-1',
  author: mockAuthor,
  type: PostType.Poll,
  pollOptions: [
    { id: 'opt-1', text: 'JavaScript', order: 1, numVotes: 45 },
    { id: 'opt-2', text: 'Python', order: 2, numVotes: 32 },
    { id: 'opt-3', text: 'TypeScript', order: 3, numVotes: 28 },
    { id: 'opt-4', text: 'Rust', order: 4, numVotes: 15 },
  ],
  endsAt: '2026-01-22T10:30:00.000Z',
  numPollVotes: 120,
} as Post;

const sharePost: Post = {
  ...basePost,
  id: 'share-1',
  title: 'Great article about TypeScript best practices!',
  permalink: 'https://api.daily.dev/r/share-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: mockSquadSource,
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/6',
  commentsPermalink: 'https://daily.dev/posts/share-1',
  author: mockAuthor,
  type: PostType.Share,
  sharedPost: {
    id: 'shared-article-1',
    title: 'TypeScript Best Practices for 2024',
    image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ts-article',
    readTime: 11,
    permalink: 'https://api.daily.dev/r/shared-article-1',
    commentsPermalink: 'https://app.daily.dev/posts/shared-article-1',
    summary: 'Learn the best TypeScript practices for modern development.',
    createdAt: '2024-01-07T19:26:43.146Z',
    private: false,
    type: PostType.Article,
    tags: ['typescript', 'best-practices'],
    source: mockSource,
  },
} as Post;

const freeformPost: Post = {
  ...basePost,
  id: 'freeform-1',
  title: 'Just shipped a new feature! 🚀 Really excited about this one - it uses AI to automatically suggest code improvements.',
  permalink: 'https://api.daily.dev/r/freeform-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: mockSquadSource,
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/freeform-placeholder',
  commentsPermalink: 'https://daily.dev/posts/freeform-1',
  author: mockAuthor,
  type: PostType.Freeform,
  contentHtml: '<p>Just shipped a new feature! 🚀</p>',
} as Post;

const collectionPost: Post = {
  ...basePost,
  id: 'collection-1',
  title: 'Essential React Hooks Every Developer Should Know',
  summary: 'A curated collection of the most useful React hooks',
  permalink: 'https://api.daily.dev/r/collection-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: mockSource,
  readTime: 15,
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/collection-placeholder',
  commentsPermalink: 'https://daily.dev/posts/collection-1',
  author: mockAuthor,
  type: PostType.Collection,
  collectionSources: [mockSource, mockSquadSource],
  numCollectionSources: 5,
} as Post;

// Common action handlers
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

// Grid container styles matching the app's FeedContainer
const gridContainerStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
} as React.CSSProperties;

// Component to render all cards
const FeedCardsOverview = () => {
  return (
    <ExtensionProviders>
      <div className="space-y-12 p-8 bg-background-default">
        {/* Grid Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Grid Cards</h2>
          <p className="text-sm text-text-tertiary mb-4">
            Grid layout using CSS custom properties: --num-cards: 3, --feed-gap: 2rem (matching app's FeedContainer)
          </p>
          <div
            className="grid grid-cols-3 gap-8 mx-auto"
            style={{
              ...gridContainerStyle,
              maxWidth: 'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
            }}
          >
            <ArticleGrid post={articlePost} {...actionHandlers} />
            <PollGrid post={pollPost} {...actionHandlers} />
            <ShareGrid post={sharePost} {...actionHandlers} />
            <FreeformGrid post={freeformPost} {...actionHandlers} />
            <CollectionGrid post={collectionPost} {...actionHandlers} />
          </div>
        </section>

        {/* List Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">List Cards</h2>
          <div className="space-y-4 max-w-4xl">
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">ArticleList</h3>
              <ArticleList post={articlePost} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">PollList</h3>
              <PollList post={pollPost} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">ShareList</h3>
              <ShareList post={sharePost} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">FreeformList</h3>
              <FreeformList post={freeformPost} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">CollectionList</h3>
              <CollectionList post={collectionPost} {...actionHandlers} />
            </div>
          </div>
        </section>

        {/* Card States Section */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Card States</h2>
          <p className="text-sm text-text-tertiary mb-4">
            Different card states shown in grid layout
          </p>
          <div
            className="grid grid-cols-3 gap-8 mx-auto"
            style={{
              ...gridContainerStyle,
              maxWidth: 'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
            }}
          >
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Read State</h3>
              <ArticleGrid post={{ ...articlePost, id: 'read-1', read: true }} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Bookmarked State</h3>
              <ArticleGrid post={{ ...articlePost, id: 'bookmarked-1', bookmarked: true }} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Upvoted State</h3>
              <ArticleGrid
                post={{
                  ...articlePost,
                  id: 'upvoted-1',
                  userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
                }}
                {...actionHandlers}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Trending (Hot)</h3>
              <ArticleGrid post={{ ...articlePost, id: 'trending-1', trending: 25 }} {...actionHandlers} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Pinned</h3>
              <ArticleGrid
                post={{ ...articlePost, id: 'pinned-1', pinnedAt: '2024-01-15T10:30:00.000Z' }}
                {...actionHandlers}
              />
            </div>
          </div>
        </section>
      </div>
    </ExtensionProviders>
  );
};

const meta: Meta = {
  title: 'Components/Cards/Feed Cards Overview',
  component: FeedCardsOverview,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const AllCards: Story = {
  render: () => <FeedCardsOverview />,
  name: 'All Feed Cards',
};

// Individual card type stories for easier debugging
export const GridCardsOnly: Story = {
  render: () => (
    <ExtensionProviders>
      <div className="p-8 bg-background-default">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Grid Cards</h2>
        <div
          className="grid grid-cols-3 gap-8 mx-auto"
          style={{
            ...gridContainerStyle,
            maxWidth: 'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
          }}
        >
          <ArticleGrid post={articlePost} {...actionHandlers} />
          <PollGrid post={pollPost} {...actionHandlers} />
          <ShareGrid post={sharePost} {...actionHandlers} />
          <FreeformGrid post={freeformPost} {...actionHandlers} />
          <CollectionGrid post={collectionPost} {...actionHandlers} />
        </div>
      </div>
    </ExtensionProviders>
  ),
  name: 'Grid Cards Only',
};

export const ListCardsOnly: Story = {
  render: () => (
    <ExtensionProviders>
      <div className="p-8 bg-background-default">
        <h2 className="text-2xl font-bold text-text-primary mb-6">List Cards</h2>
        <div className="space-y-4 max-w-4xl">
          <ArticleList post={articlePost} {...actionHandlers} />
          <PollList post={pollPost} {...actionHandlers} />
          <ShareList post={sharePost} {...actionHandlers} />
          <FreeformList post={freeformPost} {...actionHandlers} />
          <CollectionList post={collectionPost} {...actionHandlers} />
        </div>
      </div>
    </ExtensionProviders>
  ),
  name: 'List Cards Only',
};
