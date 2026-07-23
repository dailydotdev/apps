import React from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
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
