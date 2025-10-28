import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveOrRecomendedSquads } from './ActiveOrRecomendedSquads';
import type { Squad } from '../../../../graphql/sources';
import { SourceType } from '../../../../graphql/sources';
import AuthContext from '../../../../contexts/AuthContext';
import type { LoggedUser } from '../../../../lib/user';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { labels } from '../../../../lib';
import { getLogContextStatic } from '../../../../contexts/LogContext';

const LogContext = getLogContextStatic();

const mockSquad1: Squad = {
  id: 's1',
  name: 'JavaScript Squad',
  handle: 'javascript',
  image: 'https://daily.dev/squad1.png',
  permalink: 'https://daily.dev/squads/javascript',
  type: SourceType.Squad,
  membersCount: 1250,
  active: true,
  public: true,
  description: 'JavaScript enthusiasts',
};

const mockSquad2: Squad = {
  id: 's2',
  name: 'React Developers',
  handle: 'react-dev',
  image: 'https://daily.dev/squad2.png',
  permalink: 'https://daily.dev/squads/react-dev',
  type: SourceType.Squad,
  membersCount: 850,
  active: true,
  public: true,
  description: 'React developers community',
};

const mockSquad3: Squad = {
  id: 's3',
  name: 'TypeScript Squad',
  handle: 'typescript',
  image: 'https://daily.dev/squad3.png',
  permalink: 'https://daily.dev/squads/typescript',
  type: SourceType.Squad,
  membersCount: 2100,
  active: true,
  public: true,
  description: 'TypeScript lovers',
};

const mockSquad4: Squad = {
  id: 's4',
  name: 'Vue.js Community',
  handle: 'vuejs',
  image: 'https://daily.dev/squad4.png',
  permalink: 'https://daily.dev/squads/vuejs',
  type: SourceType.Squad,
  membersCount: 630,
  active: true,
  public: true,
  description: 'Vue.js developers',
};

const mockSquad5: Squad = {
  id: 's5',
  name: 'Node.js Squad',
  handle: 'nodejs',
  image: 'https://daily.dev/squad5.png',
  permalink: 'https://daily.dev/squads/nodejs',
  type: SourceType.Squad,
  membersCount: 1750,
  active: true,
  public: true,
  description: 'Node.js backend developers',
};

const mockSquad6: Squad = {
  id: 's6',
  name: 'Python Squad',
  handle: 'python',
  image: 'https://daily.dev/squad6.png',
  permalink: 'https://daily.dev/squads/python',
  type: SourceType.Squad,
  membersCount: 980,
  active: true,
  public: true,
  description: 'Python enthusiasts',
};

const createMockSquads = (count: number): Squad[] => {
  const allSquads = [
    mockSquad1,
    mockSquad2,
    mockSquad3,
    mockSquad4,
    mockSquad5,
    mockSquad6,
  ];
  return allSquads.slice(0, count);
};

const logEvent = jest.fn();

const renderComponent = (
  squads: Squad[],
  userId: string,
  options: {
    currentUserId?: string;
    isAuthReady?: boolean;
    recommendedSquads?: Squad[];
    userSquads?: Squad[];
  } = {},
) => {
  const {
    currentUserId = 'current-user',
    isAuthReady = true,
    recommendedSquads = [],
    userSquads = [],
  } = options;

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Mock recommended squads data for useSources hook
  // The query key structure matches useSources hook: RequestKey.Sources, null, featured, isPublic, categoryId, first
  if (recommendedSquads.length > 0) {
    const sourcesKey = generateQueryKey(
      RequestKey.Sources,
      null,
      undefined, // featured
      true, // isPublic
      undefined, // categoryId
      5, // first
    );
    client.setQueryData(sourcesKey, {
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
  }

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: { id: currentUserId, name: 'Test User' } as LoggedUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          isLoggedIn: true,
          isAuthReady,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
          squads: userSquads,
        }}
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <ActiveOrRecomendedSquads squads={squads} userId={userId} />
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('ActiveOrRecomendedSquads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render skeleton when auth is not ready', () => {
      renderComponent([mockSquad1], 'user-id', { isAuthReady: false });

      // Skeleton should be present (no heading text)
      expect(
        screen.queryByText(labels.profile.sources.heading.activeIn),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('JavaScript Squad')).not.toBeInTheDocument();
    });
  });

  describe('User viewing their own profile with squads', () => {
    it('should render squads list with correct heading', async () => {
      const squads = createMockSquads(3);
      renderComponent(squads, 'current-user', {
        currentUserId: 'current-user',
      });

      await waitFor(() => {
        expect(
          screen.getByText(labels.profile.sources.heading.activeIn),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      expect(screen.getByText('@javascript')).toBeInTheDocument();
      expect(screen.getByText(/1\.3K members?/)).toBeInTheDocument();

      expect(screen.getByText('React Developers')).toBeInTheDocument();
      expect(screen.getByText('@react-dev')).toBeInTheDocument();
      expect(screen.getByText(/850 members?/)).toBeInTheDocument();
    });

    it('should not render join buttons when viewing own squads', async () => {
      const squads = [mockSquad1];
      renderComponent(squads, 'current-user', {
        currentUserId: 'current-user',
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /join/i }),
      ).not.toBeInTheDocument();
    });

    it('should render show all button when more than 5 squads', async () => {
      const squads = createMockSquads(6);
      renderComponent(squads, 'current-user', {
        currentUserId: 'current-user',
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      const showAllButton = screen.getByRole('button', {
        name: /show all squads/i,
      });
      expect(showAllButton).toBeInTheDocument();

      // Should only show first 5 squads initially
      expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      expect(screen.getByText('Node.js Squad')).toBeInTheDocument();
      expect(screen.queryByText('Python Squad')).not.toBeInTheDocument();
    });

    it('should toggle show all squads when button is clicked', async () => {
      const squads = createMockSquads(6);
      renderComponent(squads, 'current-user', {
        currentUserId: 'current-user',
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      const showAllButton = screen.getByRole('button', {
        name: /show all squads/i,
      });

      // Click to show all
      fireEvent.click(showAllButton);

      await waitFor(() => {
        expect(screen.getByText('Python Squad')).toBeInTheDocument();
      });

      // Button text should change
      expect(
        screen.getByRole('button', { name: /show less/i }),
      ).toBeInTheDocument();

      // Click to show less
      const showLessButton = screen.getByRole('button', { name: /show less/i });
      fireEvent.click(showLessButton);

      await waitFor(() => {
        expect(screen.queryByText('Python Squad')).not.toBeInTheDocument();
      });
    });
  });

  describe('User viewing another user profile with squads', () => {
    it('should render squads list without join buttons', async () => {
      const squads = [mockSquad1, mockSquad2];
      renderComponent(squads, 'other-user', { currentUserId: 'current-user' });

      await waitFor(() => {
        expect(
          screen.getByText(labels.profile.sources.heading.activeIn),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      expect(screen.getByText('React Developers')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /join/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('User viewing their own profile without squads (recommended squads)', () => {
    it('should render recommended squads heading', async () => {
      const recommendedSquads = createMockSquads(3);
      renderComponent([], 'current-user', {
        currentUserId: 'current-user',
        recommendedSquads,
      });

      await waitFor(() => {
        expect(
          screen.getByText(labels.profile.sources.heading.empty),
        ).toBeInTheDocument();
      });
    });

    it('should render join buttons for recommended squads', async () => {
      const recommendedSquads = [mockSquad1];
      renderComponent([], 'current-user', {
        currentUserId: 'current-user',
        recommendedSquads,
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
    });

    it('should not show join button if user already joined the squad', async () => {
      const recommendedSquads = [mockSquad1];
      renderComponent([], 'current-user', {
        currentUserId: 'current-user',
        recommendedSquads,
        userSquads: [mockSquad1],
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /join/i }),
      ).not.toBeInTheDocument();
    });

    it('should render explore all squads button for recommended squads', async () => {
      const recommendedSquads = createMockSquads(3);
      renderComponent([], 'current-user', {
        currentUserId: 'current-user',
        recommendedSquads,
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      const exploreButton = screen.getByRole('link', {
        name: labels.profile.sources.viewAll,
      });
      expect(exploreButton).toBeInTheDocument();
      expect(exploreButton).toHaveAttribute(
        'href',
        expect.stringContaining('squads/discover'),
      );
    });

    it('should limit recommended squads to 5', async () => {
      const recommendedSquads = createMockSquads(6);
      renderComponent([], 'current-user', {
        currentUserId: 'current-user',
        recommendedSquads,
      });

      await waitFor(() => {
        expect(screen.getByText('JavaScript Squad')).toBeInTheDocument();
      });

      expect(screen.getByText('Node.js Squad')).toBeInTheDocument();
      expect(screen.queryByText('Python Squad')).not.toBeInTheDocument();
    });
  });

  describe('User viewing another user profile without squads', () => {
    it('should not render anything', () => {
      renderComponent([], 'other-user', {
        currentUserId: 'current-user',
      });

      expect(
        screen.queryByText(labels.profile.sources.heading.activeIn),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(labels.profile.sources.heading.empty),
      ).not.toBeInTheDocument();
    });
  });
});
