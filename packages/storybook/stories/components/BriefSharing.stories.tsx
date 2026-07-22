import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BriefCopyMenu } from '@dailydotdev/shared/src/components/brief/BriefCopyMenu';
import { BriefListItem } from '@dailydotdev/shared/src/components/brief/BriefListItem';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { Origin, TargetId } from '@dailydotdev/shared/src/lib/log';
import { fn } from 'storybook/test';

const briefPost = {
  id: 'brief-1',
  slug: 'presidential-briefing-jul-22',
  title: 'Presidential briefing',
  summary:
    'Rust 1.90 lands async closures, Node 24 ships a stable permission model, and three CVEs hit the npm supply chain.',
  commentsPermalink: 'https://app.daily.dev/posts/presidential-briefing-jul-22',
  createdAt: '2026-07-22T06:00:00.000Z',
  readTime: 4,
  read: false,
  flags: { posts: 42, sources: 18 },
} as unknown as Post;

const withProviders = (Story: () => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // Mock the short-URL resolution so copy actions don't hit network.
  queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

  const LogContext = getLogContextStatic();

  const mockUser = {
    id: '1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
    providers: ['google'],
    createdAt: '2024-01-01T00:00:00.000Z',
    permalink: 'https://daily.dev/testuser',
  } as unknown as LoggedUser;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          shouldShowLogin: false,
          isLoggedIn: true,
          isAuthReady: true,
          showLogin: fn(),
          closeLogin: fn(),
          logout: fn(),
          updateUser: fn(),
          tokenRefreshed: true,
          getRedirectUri: fn(),
          loadingUser: false,
          loadedUserFromCache: true,
          refetchBoot: fn(),
          squads: [],
          isAndroidApp: false,
        }}
      >
        <LogContext.Provider
          value={{
            logEvent: fn(),
            logEventStart: fn(),
            logEventEnd: fn(),
            sendBeacon: () => false,
          }}
        >
          <div className="flex min-h-40 w-full max-w-2xl flex-col justify-center gap-4">
            <Story />
          </div>
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof BriefCopyMenu> = {
  title: 'Components/Share/BriefSharing',
  component: BriefCopyMenu,
  args: {
    post: briefPost,
    origin: Origin.BriefPage,
  },
  decorators: [withProviders],
};

export default meta;

type Story = StoryObj<typeof BriefCopyMenu>;

// The per-item copy menu on its own: copy link, copy summary, copy title + link.
export const CopyMenu: Story = {};

// A brief with no generated summary hides the "Copy summary" entry.
export const CopyMenuWithoutSummary: Story = {
  args: { post: { ...briefPost, summary: undefined } as Post },
};

// The briefing-list row with the copy menu enabled (flag on).
export const ListItemWithCopyActions: StoryObj<typeof BriefListItem> = {
  render: () => (
    <BriefListItem
      post={briefPost}
      title={briefPost.title}
      pill={{ label: 'Just in' }}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      origin={Origin.BriefPage}
      targetId={TargetId.List}
      showCopyActions
    />
  ),
};

// Flag-off control: the row renders exactly as it does on main today.
// `showCopyActions` is pinned explicitly because Storybook aliases GrowthBook to
// a mock that returns the string 'control' — truthy — for every flag, so the
// gate always reads as ON here. Flag-off behaviour is asserted in Jest instead.
export const ListItemControl: StoryObj<typeof BriefListItem> = {
  render: () => (
    <BriefListItem
      post={briefPost}
      title={briefPost.title}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      origin={Origin.BriefPage}
      targetId={TargetId.List}
      showCopyActions={false}
    />
  ),
};

// Read state — the copy menu stays available on already-read briefings.
export const ListItemRead: StoryObj<typeof BriefListItem> = {
  render: () => (
    <BriefListItem
      post={briefPost}
      title={briefPost.title}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      origin={Origin.BriefPage}
      targetId={TargetId.List}
      isRead
      showCopyActions
    />
  ),
};
