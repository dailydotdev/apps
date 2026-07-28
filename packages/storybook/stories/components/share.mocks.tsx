import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { fn } from 'storybook/test';

export const mockShareLink = 'https://daily.dev/posts/how-to-ship-fast';
export const mockShareText = 'Check out this post on daily.dev';

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

/**
 * Signed-in auth + logging + a seeded short URL, which is everything the share
 * components read. `wrapperClassName` sizes the story frame.
 */
export const shareDecorator =
  (wrapperClassName: string): Decorator =>
  (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    // Seeded so copy/social actions resolve without hitting the network.
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
            <div className={wrapperClassName}>
              <Story />
            </div>
          </LogContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

/* -------------------------------------------------------------------------- */
/* Post-upvote share prompt harness                                            */
/* -------------------------------------------------------------------------- */

export const upvotedPost = {
  id: 'post-1',
  title: 'The pragmatic guide to shipping fast without breaking prod',
  permalink: 'https://api.daily.dev/r/post-1',
  commentsPermalink: 'https://daily.dev/posts/post-1',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/placeholder',
  createdAt: '2024-01-15T10:30:00.000Z',
  numUpvotes: 42,
  numComments: 12,
  type: PostType.Article,
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine',
    active: true,
  },
  userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
} as unknown as Post;

// Same id/permalink (so the seeded query keys still match), longer headline —
// the title is what gets pre-filled as the share text on every network.
export const longTitlePost = {
  ...upvotedPost,
  title:
    'Why your incremental static regeneration strategy is quietly costing you six figures a year, and the four-line config change that fixes it for good',
} as unknown as Post;

export const SHORT_LINK = 'https://dly.to/abc123';

// `SocialShareList` renders the "Share via…" chip only when `navigator.share`
// is a function — i.e. mobile web and the mobile apps. Storybook runs in
// desktop Chrome, so the chip is invisible by default. A configurable getter
// lets a single story opt in: every story renders through `Harness`, which sets
// the flag during its own render pass, immediately before its subtree renders,
// so the value is always the one that story asked for.
let hasNativeShare = false;
const noopNativeShare = async () => undefined;

if (typeof globalThis?.navigator !== 'undefined') {
  Object.defineProperty(globalThis.navigator, 'share', {
    configurable: true,
    get: () => (hasNativeShare ? noopNativeShare : undefined),
  });
}

export interface HarnessProps {
  /** The prompt only mounts after an upvote; `false` seeds a non-upvoted post. */
  upvoted?: boolean;
  /**
   * `false` leaves the short-URL query unresolved (no authenticated user, so
   * the query never runs) — the component's own loading gate then renders null.
   */
  linkResolved?: boolean;
  /** Expose `navigator.share`, as on mobile web / the mobile apps. */
  nativeShare?: boolean;
  children: ReactNode;
}

export function PostSharePromptHarness({
  upvoted = true,
  linkResolved = true,
  nativeShare = false,
  children,
}: HarnessProps): ReactElement {
  hasNativeShare = nativeShare;

  // Built once per mount so an interaction (copy, dismiss) isn't wiped by a
  // re-render handing the tree a freshly-seeded client.
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    client.setQueryData(
      generateQueryKey(RequestKey.PostActions, { id: upvotedPost.id }),
      {
        interaction: upvoted ? 'upvote' : 'none',
        previousInteraction: 'none',
      },
    );

    if (linkResolved) {
      // Seed the resolved short URL so nothing hits the network.
      const { queryKey } = getShortLinkProps(
        upvotedPost.commentsPermalink,
        ReferralCampaignKey.SharePost,
        mockUser,
      );
      client.setQueryData(queryKey, SHORT_LINK);

      // `SocialShareList` runs the link through `getShortUrl` again on click.
      // Seed that lookup too, otherwise every social button waits on a real
      // API call that Storybook can't make.
      const { queryKey: reshortenKey } = getShortLinkProps(
        SHORT_LINK,
        undefined,
        mockUser,
      );
      client.setQueryData(reshortenKey, SHORT_LINK);
    }

    return client;
  });

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={
          {
            user: linkResolved ? mockUser : null,
            isLoggedIn: linkResolved,
            isAuthReady: true,
            tokenRefreshed: true,
            shouldShowLogin: false,
            showLogin: fn(),
            closeLogin: fn(),
            logout: fn(),
            updateUser: fn(),
            getRedirectUri: fn(),
            loadingUser: false,
            loadedUserFromCache: true,
            refetchBoot: fn(),
            squads: [],
            isAndroidApp: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <LogContext.Provider
          value={{
            logEvent: fn(),
            logEventStart: fn(),
            logEventEnd: fn(),
            sendBeacon: () => false,
          }}
        >
          {children}
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

