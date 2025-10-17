import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { PublicProfile } from '../../../lib/user';
import { BadgesAndAwards } from './BadgesAndAwards';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { ProductType, PRODUCTS_SUMMARY_QUERY } from '../../../graphql/njord';
import { useTopReader } from '../../../hooks/useTopReader';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';

// Mock the hooks
jest.mock('../../../hooks/useTopReader', () => ({
  useTopReader: jest.fn(),
}));

jest.mock('../../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: jest.fn(),
}));

const mockUseTopReader = useTopReader as jest.Mock;
const mockUseHasAccessToCores = useHasAccessToCores as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHasAccessToCores.mockReturnValue(false);
});

const defaultUser: PublicProfile = {
  id: 'user-1',
  name: 'Test User',
  username: 'testuser',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/test.png',
  bio: 'Test bio',
  createdAt: '2020-01-01T00:00:00.000Z',
  twitter: 'testuser',
  github: 'testuser',
  hashnode: 'testuser',
  portfolio: 'https://test.com',
  permalink: 'https://daily.dev/testuser',
  roadmap: 'testuser',
  threads: 'testuser',
  codepen: 'testuser',
  reddit: 'testuser',
  stackoverflow: '123456/testuser',
  youtube: 'testuser',
  linkedin: 'testuser',
  mastodon: 'https://mastodon.social/@testuser',
  bluesky: 'testuser.bsky.social',
};

const mockTopReaders = [
  {
    id: 'badge-1',
    keyword: {
      value: 'javascript',
      flags: { title: 'JavaScript' },
    },
    issuedAt: '2024-01-01T00:00:00.000Z',
    total: 5,
  },
  {
    id: 'badge-2',
    keyword: {
      value: 'react',
      flags: { title: 'React' },
    },
    issuedAt: '2024-01-02T00:00:00.000Z',
    total: 3,
  },
];

const mockAwards = [
  {
    id: 'award-1',
    image: 'https://daily.dev/award1.png',
    count: 2,
  },
  {
    id: 'award-2',
    image: 'https://daily.dev/award2.png',
    count: 1,
  },
];

// Helper function to mock awards query
const mockAwardsQuery = (
  awards: typeof mockAwards = [],
  userId: string = defaultUser.id,
) => {
  mockGraphQL({
    request: {
      query: PRODUCTS_SUMMARY_QUERY,
      variables: {
        userId,
        type: ProductType.Award,
      },
    },
    result: {
      data: {
        userProductSummary: awards,
      },
    },
  });
};

const renderComponent = (user: PublicProfile = defaultUser) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <TestBootProvider client={client}>
      <BadgesAndAwards user={user} />
    </TestBootProvider>,
  );
};

describe('BadgesAndAwards component', () => {
  it('should render loading skeleton when top reader data is loading', () => {
    mockUseTopReader.mockReturnValue({
      data: null,
      isPending: true,
    });

    renderComponent();

    expect(screen.getByText('Badges & Awards')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
    // Check for skeleton elements
    expect(screen.getByTestId('BadgesAndAwardsSkeleton')).toBeInTheDocument();
  });

  it('should render loading skeleton when awards are loading', () => {
    mockUseTopReader.mockReturnValue({
      data: mockTopReaders,
      isPending: false,
    });
    mockUseHasAccessToCores.mockReturnValue(true);

    // Don't mock awards query - it will stay in loading state
    renderComponent();

    expect(screen.getByText('Badges & Awards')).toBeInTheDocument();
    expect(screen.getByTestId('BadgesAndAwardsSkeleton')).toBeInTheDocument();
  });

  it('should render with zero counts when no data is available', async () => {
    mockUseTopReader.mockReturnValue({
      data: [],
      isPending: false,
    });
    mockUseHasAccessToCores.mockReturnValue(true);
    mockAwardsQuery([]);

    renderComponent();

    // Wait for skeleton to disappear and data to load
    await waitFor(() => {
      expect(
        screen.queryByTestId('BadgesAndAwardsSkeleton'),
      ).not.toBeInTheDocument();
    });

    // Should show header and learn more link
    expect(screen.getByText('Badges & Awards')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();

    // Should show zero counts
    expect(screen.getAllByText('x0')).toHaveLength(2); // Both badges and awards are 0

    // Should not show any badge or award items
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should render top reader badges when available', async () => {
    mockUseTopReader.mockReturnValue({
      data: mockTopReaders,
      isPending: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Badges & Awards')).toBeInTheDocument();
      expect(screen.getByText('Learn more')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText('x8')).toBeInTheDocument(); // Total badges: 5 + 3
    expect(screen.getByText('Top reader badge')).toBeInTheDocument();

    // Check badge items
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should render awards when user has cores access', async () => {
    mockUseTopReader.mockReturnValue({
      data: mockTopReaders,
      isPending: false,
    });
    mockUseHasAccessToCores.mockReturnValue(true);

    // Mock awards query with data
    mockAwardsQuery(mockAwards);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('x3')).toBeInTheDocument(); // Total awards: 2 + 1
      expect(screen.getByText('Total Awards')).toBeInTheDocument();
    });

    // Check award images
    const awardImages = screen.getAllByAltText('Award');
    expect(awardImages).toHaveLength(2);
    expect(awardImages[0]).toHaveAttribute(
      'src',
      'https://daily.dev/award1.png',
    );
    expect(awardImages[1]).toHaveAttribute(
      'src',
      'https://daily.dev/award2.png',
    );

    // Check award counts
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.getByText('x1')).toBeInTheDocument();
  });

  it('should not render awards section when user does not have cores access', () => {
    mockUseTopReader.mockReturnValue({
      data: mockTopReaders,
      isPending: false,
    });
    mockUseHasAccessToCores.mockReturnValue(false);

    renderComponent();

    expect(screen.getByText('Badges & Awards')).toBeInTheDocument();
    expect(screen.getByText('x8')).toBeInTheDocument(); // Total badges
    expect(screen.getByText('x0')).toBeInTheDocument(); // No awards
    expect(screen.queryByAltText('Award')).not.toBeInTheDocument();
  });

  it('should render learn more link with correct href', () => {
    mockUseTopReader.mockReturnValue({
      data: mockTopReaders,
      isPending: false,
    });

    renderComponent();

    const learnMoreLink = screen.getByText('Learn more');
    expect(learnMoreLink).toHaveAttribute(
      'href',
      'https://r.daily.dev/top-reader-badge',
    );
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });
});
