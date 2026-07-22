import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ShareStreakButton,
  getStreakShareText,
} from '@dailydotdev/shared/src/components/streak/popup/ShareStreakButton';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { fn } from 'storybook/test';

const permalink = 'https://app.daily.dev/idoshamun';

const meta: Meta<typeof ShareStreakButton> = {
  title: 'Components/Share/ShareStreakButton',
  component: ShareStreakButton,
  args: {
    currentStreak: 12,
    link: permalink,
  },
  argTypes: {
    currentStreak: { control: 'number' },
    showLabel: {
      control: 'boolean',
      description: 'Mobile: the action row shows the label next to the icon',
    },
    imageUrl: {
      control: 'text',
      description:
        'Generated streak image. When set and the platform supports `navigator.canShare({ files })`, the native sheet carries the image instead of just the link.',
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      const LogContext = getLogContextStatic();

      const mockUser = {
        id: '1',
        name: 'Ido Shamun',
        username: 'idoshamun',
        email: 'ido@daily.dev',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
        providers: ['google'],
        createdAt: '2024-01-01T00:00:00.000Z',
        permalink,
      } as unknown as LoggedUser;

      return (
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider
            value={
              {
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
              } as never
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
              <div className="flex min-h-40 flex-col items-center justify-center gap-2">
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

type Story = StoryObj<typeof ShareStreakButton>;

// Early streak — the copy stays matter-of-fact.
export const ShortStreak: Story = {
  args: { currentStreak: 5 },
  parameters: { docs: { description: { story: getStreakShareText(5) } } },
};

// The habit stuck: copy switches at 30 days.
export const LongStreak: Story = {
  args: { currentStreak: 45 },
  parameters: { docs: { description: { story: getStreakShareText(45) } } },
};

// Milestone territory: copy switches again at 100 days.
export const MilestoneStreak: Story = {
  args: { currentStreak: 180 },
  parameters: { docs: { description: { story: getStreakShareText(180) } } },
};

// Mobile action row: icon + label, full width next to Settings.
export const WithLabel: Story = {
  args: { currentStreak: 45, showLabel: true, className: 'w-full' },
};

// With a generated image available, the native sheet carries the picture
// (mobile + `navigator.canShare({ files })` only) and otherwise degrades to
// the link + text share.
export const WithStreakImage: Story = {
  args: {
    currentStreak: 45,
    imageUrl: 'https://media.daily.dev/image/upload/streak-placeholder.png',
  },
};
