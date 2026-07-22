import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  activeDiscussionCommentThreshold,
  EndOfConversationShareBand,
} from '@dailydotdev/shared/src/components/post/EndOfConversationShare';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { fn } from 'storybook/test';

const basePost = {
  id: 'p1',
  title: 'Why your CI is slow and what actually fixes it',
  permalink: 'https://daily.dev/posts/p1',
  commentsPermalink: 'https://app.daily.dev/posts/p1',
  numComments: 12,
} as unknown as Post;

const withPost = (numComments: number): Post =>
  ({ ...basePost, numComments } as Post);

const meta: Meta<typeof EndOfConversationShareBand> = {
  title: 'Components/Share/EndOfConversationShare',
  component: EndOfConversationShareBand,
  args: { post: basePost },
  parameters: {
    docs: {
      description: {
        component: `Share band rendered below the comment list. It only appears once a post
has an active discussion — more than ${activeDiscussionCommentThreshold} comments, read from
\`Post.numComments\`. In the app it is additionally gated by the \`sharing_visibility\`
kill-switch and the \`share_end_of_conversation\` experiment flag.`,
      },
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      // Mock the short-URL resolution so copy/social actions don't hit network.
      queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

      const LogContext = getLogContextStatic();

      const mockUser = {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
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
              <div className="flex min-h-40 w-full max-w-2xl flex-col justify-center">
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

type Story = StoryObj<typeof EndOfConversationShareBand>;

// Active discussion: the band renders below the comment list.
export const ActiveDiscussion: Story = {
  args: { post: withPost(12) },
};

// Exactly at the threshold — still hidden, the band needs MORE than 3 comments.
export const AtThreshold: Story = {
  args: { post: withPost(activeDiscussionCommentThreshold) },
};

// One comment past the threshold: the first state where the band shows.
export const JustAboveThreshold: Story = {
  args: { post: withPost(activeDiscussionCommentThreshold + 1) },
};

// Quiet post: nothing renders, so we never prompt on an empty discussion.
export const NoComments: Story = {
  args: { post: withPost(0) },
};

// Narrow the Storybook viewport to see the mobile layout: the band stacks and
// a single tap on the share button opens the native share sheet (falling back
// to copy when the device has no share target).
export const Mobile: Story = {
  args: { post: withPost(12) },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
