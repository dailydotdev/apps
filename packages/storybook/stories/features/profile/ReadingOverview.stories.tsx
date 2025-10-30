import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingOverview } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ReadingOverview';
import type { UserReadHistory, UserStreak, MostReadTag } from '@dailydotdev/shared/src/graphql/users';
import { addDays, subDays, subMonths } from 'date-fns';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from 'storybook/test';

const meta: Meta<typeof ReadingOverview> = {
  title: 'Features/Profile/ReadingOverview',
  component: ReadingOverview,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      
      const mockUser = {
        id: 'storybook-user',
        name: 'Storybook User',
        username: 'storybook',
        premium: false,
        reputation: 100,
        image: 'https://via.placeholder.com/40',
        bio: 'Storybook test user',
        createdAt: '2023-01-01T00:00:00Z',
      };

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
            <Story />
          </AuthContextProvider>
        </QueryClientProvider>
      );
    },
  ],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Whether the component is in loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReadingOverview>;

// Sample data
const generateReadHistory = (days: number): UserReadHistory[] => {
  const history: UserReadHistory[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const reads = Math.floor(Math.random() * 10) + 1;
    history.push({
      date: date.toISOString().split('T')[0],
      reads,
    });
  }
  
  return history.reverse();
};

const defaultReadHistory = generateReadHistory(150);
const defaultBefore = new Date();
const defaultAfter = subMonths(defaultBefore, 5);

const defaultStreak: UserStreak = {
  max: 15,
  total: 45,
  current: 8,
  weekStart: 1,
  lastViewAt: new Date(),
};

const defaultMostReadTags: MostReadTag[] = [
  { value: 'javascript', count: 25, percentage: 0.4, total: 62 },
  { value: 'react', count: 18, percentage: 0.29, total: 62 },
  { value: 'typescript', count: 12, percentage: 0.19, total: 62 },
  { value: 'nodejs', count: 7, percentage: 0.11, total: 62 },
];

export const Default: Story = {
  args: {
    readHistory: defaultReadHistory,
    before: defaultBefore,
    after: defaultAfter,
    streak: defaultStreak,
    mostReadTags: defaultMostReadTags,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    readHistory: [],
    before: defaultBefore,
    after: defaultAfter,
    streak: defaultStreak,
    mostReadTags: [],
    isLoading: true,
  },
};

export const NoStreaks: Story = {
  args: {
    readHistory: defaultReadHistory,
    before: defaultBefore,
    after: defaultAfter,
    streak: undefined,
    mostReadTags: defaultMostReadTags,
    isLoading: false,
  },
};

export const NoTags: Story = {
  args: {
    readHistory: defaultReadHistory,
    before: defaultBefore,
    after: defaultAfter,
    streak: defaultStreak,
    mostReadTags: [],
    isLoading: false,
  },
};