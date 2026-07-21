import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { fn } from 'storybook/test';

const meta: Meta<typeof ShareActions> = {
  title: 'Components/Share/ShareActions',
  component: ShareActions,
  args: {
    link: 'https://daily.dev/posts/how-to-ship-fast',
    text: 'Check out this post on daily.dev',
    onShare: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['icon', 'inline'],
      description:
        'icon = copy-icon trigger with a popover (desktop) / native share (mobile); inline = the social row rendered directly',
    },
    openOnHover: {
      control: 'boolean',
      description: 'Desktop only: reveal the popover on hover as well as click',
    },
    label: { control: 'text' },
    link: { control: 'text' },
    text: { control: 'text' },
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
              <div className="flex min-h-40 items-center justify-center">
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

type Story = StoryObj<typeof ShareActions>;

// Icon trigger — click to open the share popover on desktop; a single tap opens
// the native share sheet on mobile.
export const Icon: Story = {
  args: { variant: 'icon' },
};

// Popover also opens on hover (desktop) for the feed-card share-out pattern.
export const IconOpenOnHover: Story = {
  args: { variant: 'icon', openOnHover: true },
};

// The full social row, for headers / share strips / drawers.
export const Inline: Story = {
  args: { variant: 'inline' },
};
