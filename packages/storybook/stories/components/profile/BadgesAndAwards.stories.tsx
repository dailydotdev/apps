import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BadgesAndAwards } from '@dailydotdev/shared/src/components/profile/ProfileWidgets/BadgesAndAwards';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import type { TopReader } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import { ProductType } from '@dailydotdev/shared/src/graphql/njord';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { BadgesAndAwardsSkeleton } from '@dailydotdev/shared/src/components/profile/ProfileWidgets/BadgesAndAwardsComponents';
import React from 'react';
import { fn } from 'storybook/test';

const meta: Meta<typeof BadgesAndAwards> = {
  title: 'Profile/BadgesAndAwards',
  component: BadgesAndAwards,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof BadgesAndAwards>;

// Sample user data
const defaultUser: PublicProfile = {
  id: 'user-123',
  name: 'John Doe',
  username: 'johndoe',
  premium: false,
  reputation: 1250,
  image: 'https://via.placeholder.com/40',
  bio: 'Full-stack developer passionate about React and TypeScript',
  createdAt: '2023-01-15T10:30:00Z',
  permalink: 'https://app.daily.dev/johndoe',
};

// Sample badges data
const sampleBadges: TopReader[] = [
  {
    id: 'badge-1',
    user: {
      name: 'John Doe',
      image: 'https://via.placeholder.com/40',
      username: 'johndoe',
    },
    keyword: {
      value: 'javascript',
      flags: { title: 'JavaScript Expert' },
    },
    total: 15,
    issuedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'badge-2',
    user: {
      name: 'John Doe',
      image: 'https://via.placeholder.com/40',
      username: 'johndoe',
    },
    keyword: {
      value: 'react',
      flags: { title: 'React Master' },
    },
    total: 12,
    issuedAt: '2024-01-10T09:30:00Z',
  },
  {
    id: 'badge-3',
    user: {
      name: 'John Doe',
      image: 'https://via.placeholder.com/40',
      username: 'johndoe',
    },
    keyword: {
      value: 'typescript',
      flags: { title: 'TypeScript Pro' },
    },
    total: 8,
    issuedAt: '2024-01-05T16:45:00Z',
  },
];

// Sample awards data with real daily.dev images
const sampleAwards = [
  {
    id: 'award-1',
    name: 'Smiley Face',
    image: 'https://media.daily.dev/image/upload/s--Ft4p9rjO--/f_auto/v1743664345/public/happy',
    count: 3,
  },
  {
    id: 'award-2',
    name: 'Heart',
    image: 'https://media.daily.dev/image/upload/s--IPWhKcis--/f_auto/v1743664345/public/Love',
    count: 1,
  },
  {
    id: 'award-3',
    name: 'Coffee Mug',
    image: 'https://media.daily.dev/image/upload/s--aenMzSPZ--/f_auto/v1743664347/public/Coffee',
    count: 2,
  },
  {
    id: 'award-4',
    name: 'Star',
    image: 'https://media.daily.dev/image/upload/s--PdFJ22B8--/f_auto/v1743664345/public/Star',
    count: 1,
  },
  {
    id: 'award-5',
    name: 'Terminal',
    image: 'https://media.daily.dev/image/upload/s--KBzEqo01--/f_auto/v1743664345/public/Terminal',
    count: 1,
  },
  {
    id: 'award-6',
    name: 'Keyboard',
    image: 'https://media.daily.dev/image/upload/s--Q65Srvfv--/f_auto/v1743664345/public/Keyboard',
    count: 1,
  },
];

// Helper to create a story with mocked data
const createStory = (
  user: PublicProfile,
  topReaders?: TopReader[],
  awards?: typeof sampleAwards,
  coresRole: number = 1,
) => {
  return {
    render: () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            gcTime: Infinity,
          },
        },
      });

      const mockUser = {
        ...user,
        coresRole,
        providers: [],
        balance: {
          amount: 0,
        },
      };

      // Pre-populate the query cache before rendering
      if (topReaders !== undefined) {
        const topReaderKey = ['top_reader_badge', user.id, 'latest:5'];
        queryClient.setQueryData(topReaderKey, topReaders);
        queryClient.setQueryDefaults(topReaderKey, {
          queryFn: () => Promise.resolve(topReaders),
        });
      }

      if (awards !== undefined) {
        const awardsKey = ['products', 'anonymous', 'summary', { userId: user.id, limit: undefined, type: ProductType.Award }];
        queryClient.setQueryData(awardsKey, awards);
        queryClient.setQueryDefaults(awardsKey, {
          queryFn: () => Promise.resolve(awards),
        });
      }

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
            <BadgesAndAwards user={user} />
          </AuthContextProvider>
        </QueryClientProvider>
      );
    },
  };
};

export const Default: Story = createStory(defaultUser, sampleBadges, sampleAwards);

export const NoBadges: Story = createStory(defaultUser, [], sampleAwards);

export const NoAwards: Story = createStory(defaultUser, sampleBadges, []);

export const EmptyState: Story = createStory(defaultUser, [], []);

export const NoCoresAccess: Story = createStory(defaultUser, sampleBadges, sampleAwards, 0);

export const Loading: Story = {
  render: () => {
    return <BadgesAndAwardsSkeleton />;
  },
};
