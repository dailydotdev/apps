import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileCompletion } from '@dailydotdev/shared/src/components/profile/ProfileWidgets/ProfileCompletion';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import type { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from '../../../mock/next-router';
import { useToastNotification } from '../../../mock/hooks/useToastNotification';
import { useActions } from '../../../mock/hooks/useActions';
import { fn } from 'storybook/test';

const mockUser: PublicProfile = {
  id: 'user-123',
  name: 'John Doe',
  username: 'johndoe',
  premium: false,
  reputation: 1250,
  image: 'https://via.placeholder.com/40',
  bio: 'Full-stack developer passionate about React and TypeScript',
  createdAt: '2023-01-15T10:30:00Z',
  permalink: 'https://app.daily.dev/johndoe',
  twitter: 'johndoe',
  github: 'johndoe',
  hashnode: 'johndoe',
  portfolio: 'https://johndoe.dev',
  roadmap: 'johndoe',
  threads: 'johndoe',
  codepen: 'johndoe',
  reddit: 'johndoe',
  stackoverflow: '123456/johndoe',
  youtube: 'johndoe',
  linkedin: 'johndoe',
  mastodon: 'https://mastodon.social/@johndoe',
  bluesky: 'johndoe.bsky.social',
};

const meta: Meta<typeof ProfileCompletion> = {
  title: 'Profile/ProfileCompletion',
  component: ProfileCompletion,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <AuthContextProvider
            user={mockUser}
            updateUser={fn()}
            tokenRefreshed={true}
            getRedirectUri={fn()}
            loadingUser={false}
            loadedUserFromCache={true}
            refetchBoot={fn()}
            squads={[]}
            isAndroidApp={false}
          >
            <div className="max-w-[352px]">
              <Story />
            </div>
          </AuthContextProvider>
        </QueryClientProvider>
      );
    },
  ],
  beforeEach: () => {
    useRouter.mockReturnValue({
      push: fn((url) => console.log('Navigating to:', url)),
      replace: fn(),
      pathname: '/johndoe',
      query: {},
    });

    useToastNotification.mockReturnValue({
      displayToast: fn((message: string) => {
        console.log('Toast:', message);
      }),
      dismissToast: fn(),
    });

    useActions.mockReturnValue({
      completeAction: fn((type: string) => {
        console.log('Action completed:', type);
        return Promise.resolve();
      }),
      checkHasCompleted: fn(() => false),
      actions: [],
      isActionsFetched: true,
    });
  },
};

export default meta;
type Story = StoryObj<typeof ProfileCompletion>;

// Base user with all fields complete
const completeUser: PublicProfile = {
  id: 'user-123',
  name: 'John Doe',
  username: 'johndoe',
  premium: false,
  reputation: 1250,
  image: 'https://via.placeholder.com/40',
  bio: 'Full-stack developer passionate about React and TypeScript',
  createdAt: '2023-01-15T10:30:00Z',
  permalink: 'https://app.daily.dev/johndoe',
  twitter: 'johndoe',
  github: 'johndoe',
  hashnode: 'johndoe',
  portfolio: 'https://johndoe.dev',
  roadmap: 'johndoe',
  threads: 'johndoe',
  codepen: 'johndoe',
  reddit: 'johndoe',
  stackoverflow: '123456/johndoe',
  youtube: 'johndoe',
  linkedin: 'johndoe',
  mastodon: 'https://mastodon.social/@johndoe',
  bluesky: 'johndoe.bsky.social',
  experienceLevel: 'MORE_THAN_4_YEARS' as keyof typeof UserExperienceLevel,
  companies: [
    {
      id: 'company-1',
      name: 'Tech Corp',
      image: 'https://via.placeholder.com/24',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ],
};

/**
 * When all profile completion items are missing.
 * Shows 0% completion with all items listed.
 */
export const CompletelyEmpty: Story = {
  args: {
    user: {
      ...completeUser,
      image: '',
      bio: '',
      experienceLevel: undefined,
      companies: undefined,
    },
  },
};

