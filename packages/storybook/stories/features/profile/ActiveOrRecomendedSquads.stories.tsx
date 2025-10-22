import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { ActiveOrRecomendedSquads } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ActiveOrRecomendedSquads';
import { ActiveOrRecomendedSquadsSkeleton } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ActiveOrRecomendedSquadsComponents';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { cloudinarySquadsImageFallback } from '@dailydotdev/shared/src/lib/image';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';

const LogContext = getLogContextStatic();

const meta: Meta<typeof ActiveOrRecomendedSquads> = {
  title: 'Features/Profile/ActiveOrRecomendedSquads',
  component: ActiveOrRecomendedSquads,
  tags: ['autodocs'],
  argTypes: {
    userId: {
      control: 'text',
      description: 'User ID',
    },
    squads: {
      control: 'object',
      description: 'Array of squads',
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

      const mockUser: LoggedUser = {
        id: 'user1',
        name: 'John Doe',
        username: 'johndoe',
        image: 'https://daily.dev/user.png',
        permalink: 'https://daily.dev/johndoe',
        providers: ['google'],
        premium: false,
        reputation: 100,
        createdAt: '2023-01-01',
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
              isLoggedIn: true,
              isAuthReady: true,
              closeLogin: fn(),
              getRedirectUri: fn(),
              squads: [],
            }}
          >
            <LogContext.Provider
              value={{
                logEvent: fn(),
                logEventStart: fn(),
                logEventEnd: fn(),
                sendBeacon: fn(),
              }}
            >
              <div className="p-4">
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

type Story = StoryObj<typeof ActiveOrRecomendedSquads>;

const createSquad = (
  id: string,
  name: string,
  handle: string,
  membersCount: number,
): Squad => ({
  id,
  name,
  handle,
  membersCount,
  image: cloudinarySquadsImageFallback,
  permalink: `https://daily.dev/squads/${handle}`,
  type: SourceType.Squad,
  active: true,
  public: true,
  description: `${name} Squad`,
  memberPostingRole: null,
  memberInviteRole: null,
  privilegedMembers: [],
  currentMember: null,
  moderationRequired: false,
  flags: {},
});

const mockSquads: Squad[] = [
  createSquad('1', 'JavaScript Developers', 'js-devs', 1234),
  createSquad('2', 'React Enthusiasts', 'react', 567),
  createSquad('3', 'TypeScript Masters', 'typescript', 890),
  createSquad('4', 'Web3 Builders', 'web3', 345),
  createSquad('5', 'DevOps Engineers', 'devops', 678),
];

export const Default: Story = {
  args: {
    userId: 'user1',
    squads: [
      ...mockSquads,
      createSquad('6', 'Python Programmers', 'python', 456),
      createSquad('7', 'Go Developers', 'golang', 234),
      createSquad('8', 'Rust Hackers', 'rust', 567),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'When more than 5 squads are present, a "Show all Squads" button appears to expand the list.',
      },
    },
  },
};

export const RecommendedSquads: Story = {
  args: {
    userId: 'user1', // Same as logged-in user
    squads: [], // No squads joined yet
  },
  parameters: {
    docs: {
      description: {
        story:
          'When a user has no squads and is viewing their own profile, recommended squads are shown with Join buttons and a "View all" link to discover more squads.',
      },
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

      const mockUser: LoggedUser = {
        id: 'user1',
        name: 'John Doe',
        username: 'johndoe',
        image: 'https://daily.dev/user.png',
        permalink: 'https://daily.dev/johndoe',
        providers: ['google'],
        premium: false,
        reputation: 100,
        createdAt: '2023-01-01',
      };

      // Mock recommended squads data
      const recommendedSquads = [
        createSquad('rec1', 'JavaScript Developers', 'js-devs', 12450),
        createSquad('rec2', 'React Enthusiasts', 'react-fans', 8760),
        createSquad('rec3', 'TypeScript Masters', 'ts-masters', 5430),
        createSquad('rec4', 'Web3 Builders', 'web3-build', 3210),
        createSquad('rec5', 'DevOps Community', 'devops-comm', 6780),
      ];

      // Mock the useSources hook response with correct query key
      const queryKey = generateQueryKey(
        RequestKey.Sources,
        null,
        undefined, // featured
        true, // isPublic
        undefined, // categoryId
        5, // first (MAX_SQUAD_COUNT)
      );

      queryClient.setQueryData(queryKey, {
        pages: [
          {
            sources: {
              edges: recommendedSquads.map((squad) => ({ node: squad })),
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        ],
        pageParams: [''],
      });

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
              isLoggedIn: true,
              isAuthReady: true,
              closeLogin: fn(),
              getRedirectUri: fn(),
              squads: [], // User hasn't joined any squads
            }}
          >
            <LogContext.Provider
              value={{
                logEvent: fn(),
                logEventStart: fn(),
                logEventEnd: fn(),
                sendBeacon: fn(),
              }}
            >
              <div className="p-4">
                <Story />
              </div>
            </LogContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export const OtherUserProfile: Story = {
  args: {
    userId: 'differentUser',
    squads: mockSquads.slice(0, 3),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When viewing another user\'s profile (userId doesn\'t match logged-in user), their squads are shown without join buttons.',
      },
    },
  },
};

export const OtherUserNoSquads: Story = {
  args: {
    userId: 'differentUser', // Different from logged-in user
    squads: [], // This user hasn't joined any squads
  },
  parameters: {
    docs: {
      description: {
        story:
          'When viewing another user\'s profile who hasn\'t joined any squads, nothing is shown. No recommendations appear since it\'s not your own profile.',
      },
    },
  },
};

export const Loading: StoryObj<typeof ActiveOrRecomendedSquadsSkeleton> = {
  render: () => <ActiveOrRecomendedSquadsSkeleton />,
  parameters: {
    docs: {
      description: {
        story:
          'Loading skeleton state shown while fetching squad data. Displays animated placeholders for squad list items.',
      },
    },
  },
};
