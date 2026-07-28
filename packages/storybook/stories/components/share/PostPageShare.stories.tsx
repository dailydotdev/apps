import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { CopySummaryButton } from '@dailydotdev/shared/src/components/post/share/CopySummaryButton';
import { ShareWithTeamStrip } from '@dailydotdev/shared/src/components/post/share/ShareWithTeamStrip';
import { ShareModuleHeader } from '@dailydotdev/shared/src/components/post/share/ShareModuleHeader';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const summary =
  'React Compiler memoizes components automatically, so most useMemo and useCallback calls become dead weight. The article walks through what the compiler can and cannot infer, and where you still need to reach for manual memoization.';

const post = {
  id: 'p1',
  title: 'You can delete most of your useMemo calls',
  permalink: 'https://daily.dev/r/p1',
  commentsPermalink: 'https://app.daily.dev/posts/p1',
  createdAt: '2026-05-01T00:00:00.000Z',
  numUpvotes: 128,
  numComments: 24,
  summary,
  type: PostType.Article,
  source: {
    id: 'react',
    handle: 'reactjs',
    name: 'React',
    permalink: 'https://app.daily.dev/sources/reactjs',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react',
    type: SourceType.Machine,
  },
} as unknown as Post;

// Freeform posts are authored inside daily.dev and never carry a generated
// TL;DR, so the copy-summary action has nothing to copy.
const freeformPost = {
  ...post,
  id: 'p2',
  type: PostType.Freeform,
  summary: undefined,
} as unknown as Post;

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

const meta: Meta = {
  title: 'Components/Share/PostPageShare',
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      // Mock the short-URL resolution so copy/social actions don't hit network.
      queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

      const LogContext = getLogContextStatic();

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
              <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-4 p-4">
                <Story />
              </div>
            </LogContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj;

// Wish-list #1 — the TL;DR block with its secondary copy action. "Read post"
// stays the only filled button so the copy action never competes with it.
export const CopySummary: Story = {
  render: () => (
    <>
      <p className="select-text break-words text-text-secondary typo-markdown">
        {summary}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          icon={<OpenLinkIcon />}
          size={ButtonSize.Small}
          tag="a"
          href={post.permalink}
          variant={ButtonVariant.Primary}
        >
          Read post
        </Button>
        <CopySummaryButton post={post} summary={post.summary} />
      </div>
    </>
  ),
};

// Freeform posts have no summary — the action renders nothing at all.
export const CopySummaryOnFreeform: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
        Read post
      </Button>
      <CopySummaryButton post={freeformPost} summary={freeformPost.summary} />
    </div>
  ),
};

// Wish-list #6 — the quiet team strip. "Send to Slack" copies the link, since
// Slack has no web share-intent URL; a pasted daily.dev link unfurls from OG.
export const TeamStrip: Story = {
  render: () => <ShareWithTeamStrip post={post} />,
};

// The strip collapses to a stacked layout below tablet.
export const TeamStripNarrow: Story = {
  render: () => (
    <div className="w-[22rem]">
      <ShareWithTeamStrip post={post} />
    </div>
  ),
};

// Wish-list #10 — the heading shared by the desktop and mobile recommend
// modules, replacing the old "Would you recommend this post?" question.
export const RecommendModuleHeader: Story = {
  render: () => <ShareModuleHeader />,
};
