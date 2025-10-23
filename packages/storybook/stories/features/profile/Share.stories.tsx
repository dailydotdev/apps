import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Share } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/Share';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from 'storybook/test';

const meta: Meta<typeof Share> = {
  title: 'Features/Profile/Share',
  component: Share,
  argTypes: {
    username: {
      control: 'text',
      description: 'Username for the profile URL',
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
          },
        },
      });

      // Mock the short URL query
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
      };

      return (
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider
            value={{
              user: mockUser,
              shouldShowLogin: false,
              showLogin: fn(),
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
                logEvent: () => {},
                logEventStart: () => {},
                logEventEnd: () => {},
                sendBeacon: () => false,
              }}
            >
              <div className="max-w-[400px]">
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

type Story = StoryObj<typeof Share>;

export const Default: Story = {
  args: {
    username: 'thecoverliker',
  },
};
