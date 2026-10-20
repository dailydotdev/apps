import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { ProfileUploadBanner } from '@dailydotdev/shared/src/features/profile/components/ProfileUploadBanner';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import ExtensionProviders from '../../extension/_providers';

const cardHandlers = {
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

const feedTitles = [
  'Stop reaching for useEffect: a decision tree',
  'Shipping a monorepo with pnpm workspaces and Turborepo',
  'A practical guide to CSS container queries',
  'What a year of on-call taught us about alert design',
  'Type-safe environment variables without a build step',
  'Reading the SQLite source to understand WAL mode',
  'Designing APIs that are hard to misuse',
  'The hidden cost of feature flags',
];

const feedPosts = feedTitles.map(
  (title, index) =>
    ({
      id: `feed-${index}`,
      type: PostType.Article,
      title,
      permalink: `https://api.daily.dev/r/feed-${index}`,
      commentsPermalink: `https://app.daily.dev/posts/feed-${index}`,
      createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
      readTime: 5 + index,
      image: `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${
        (index % 6) + 1
      }`,
      numUpvotes: 128,
      numComments: 24,
      bookmarked: false,
      read: false,
      upvoted: false,
      commented: false,
      userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
      tags: ['webdev'],
      source: {
        id: 'tds',
        handle: 'tds',
        name: 'Towards Data Science',
        permalink: 'https://app.daily.dev/sources/tds',
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
        type: SourceType.Machine,
        public: true,
      },
    } as unknown as Post),
);

const bannerProps = {
  status: 'idle' as const,
  onClose: fn(),
  onUpload: fn(async () => undefined),
};

const meta: Meta<typeof ProfileUploadBanner> = {
  title: 'Features/Profile/ProfileUploadBanner',
  component: ProfileUploadBanner,
  parameters: {
    layout: 'padded',
  },
  args: bannerProps,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProfileUploadBanner>;

export const Default: Story = {};

export const JobsCopy: Story = {
  args: {
    banner: {
      title: 'Your next job should apply to you',
      description:
        'Upload your CV so we quietly match you with roles you might actually want. Nothing is shared without your ok.',
    },
  },
};

// Phones get the list cards and tablets up get the grid, as on the real feed.
const Feed = (): ReactElement => (
  <>
    <div className="flex flex-col tablet:hidden">
      {feedPosts.map((post) => (
        <ArticleList key={post.id} post={post} {...cardHandlers} />
      ))}
    </div>
    <div className="hidden grid-cols-2 gap-6 tablet:grid laptop:grid-cols-3 laptopL:grid-cols-4">
      {feedPosts.map((post) => (
        <ArticleGrid key={post.id} post={post} {...cardHandlers} />
      ))}
    </div>
  </>
);

export const InFeed: Story = {
  name: 'In the feed',
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="min-h-screen bg-background-default tablet:px-4 laptop:px-8">
      <div className="mx-auto flex max-w-[91rem] flex-col">
        <div className="px-4 tablet:px-0">
          <ProfileUploadBanner {...args} />
        </div>
        <Feed />
      </div>
    </div>
  ),
};

// Each width gets its own iframe so Tailwind's media queries resolve against
// a real viewport, not a resized container.
const RESOLUTIONS = [
  { label: 'Small phone', width: 320 },
  { label: 'iPhone', width: 390 },
  { label: 'Tablet', width: 768 },
  { label: 'Laptop', width: 1024 },
  { label: 'Laptop L', width: 1440 },
  { label: 'Desktop', width: 1920 },
];

export const Resolutions: Story = {
  name: 'In the feed · all resolutions',
  parameters: { layout: 'fullscreen' },
  render: (args, { globals }) => (
    <div className="flex flex-col gap-8 bg-background-default p-6">
      {RESOLUTIONS.map(({ label, width }) => (
        <section key={width} className="flex flex-col gap-2">
          <span className="font-bold text-text-primary typo-callout">
            {label} · {width}px
          </span>
          <iframe
            title={`${label} preview`}
            src={`iframe.html?id=features-profile-profileuploadbanner--in-feed&globals=theme:${
              globals.theme ?? 'light'
            }`}
            width={width}
            height={900}
            className="max-w-none rounded-16 border border-border-subtlest-tertiary"
          />
        </section>
      ))}
    </div>
  ),
};
