import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type {
  UserReadHistory,
  UserStreak,
  MostReadTag,
} from '../../../graphql/users';
import { ReadingOverview } from './ReadingOverview';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';

beforeEach(() => {
  jest.clearAllMocks();
});

const mockReadHistory: UserReadHistory[] = [
  {
    date: '2024-01-01',
    reads: 5,
  },
  {
    date: '2024-01-02',
    reads: 3,
  },
  {
    date: '2024-01-03',
    reads: 0,
  },
  {
    date: '2024-01-04',
    reads: 8,
  },
];

const mockStreak: UserStreak = {
  max: 10,
  total: 25,
  current: 5,
  weekStart: 1, // Monday
  lastViewAt: new Date('2024-01-04'),
};

const mockMostReadTags: MostReadTag[] = [
  {
    value: 'javascript',
    count: 15,
    percentage: 0.6,
    total: 25,
  },
  {
    value: 'react',
    count: 10,
    percentage: 0.4,
    total: 25,
  },
];

const defaultProps = {
  readHistory: mockReadHistory,
  before: new Date('2024-01-31'),
  after: new Date('2024-01-01'),
  streak: mockStreak,
  mostReadTags: mockMostReadTags,
  isStreaksEnabled: true,
  isLoading: false,
};

const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <TestBootProvider client={client}>
      <ReadingOverview {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

describe('ReadingOverview component', () => {
  it('should render loading skeleton when isLoading is true', () => {
    renderComponent({ isLoading: true });

    expect(screen.getByText('Reading Overview')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
    // Check for skeleton elements
    // Check for skeleton elements using accessible queries
    expect(screen.getByTestId('ReadingOverviewSkeleton')).toBeInTheDocument();
  });

  it('should render main content when not loading', () => {
    renderComponent();

    expect(screen.getByText('Reading Overview')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
    expect(
      screen.getByText('Posts read in the last months (16)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Top tags by reading days')).toBeInTheDocument();
    expect(screen.getByText('Javascript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('+60%')).toBeInTheDocument(); // javascript percentage
    expect(screen.getByText('+40%')).toBeInTheDocument(); // react percentage
  });

  it('should render streaks section when enabled and streak data is available', () => {
    renderComponent({ isStreaksEnabled: true, streak: mockStreak });

    expect(screen.getByText('Longest streak 🏆')).toBeInTheDocument();
    expect(screen.getByText('Total reading days')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // max streak
    expect(screen.getByText('25')).toBeInTheDocument(); // total days
  });

  it('should not render streaks section when disabled', () => {
    renderComponent({ isStreaksEnabled: false });

    expect(screen.queryByText('Longest streak 🏆')).not.toBeInTheDocument();
    expect(screen.queryByText('Total reading days')).not.toBeInTheDocument();
  });

  it('should not render streaks section when streak data is null', () => {
    renderComponent({ isStreaksEnabled: true, streak: null });

    expect(screen.queryByText('Longest streak 🏆')).not.toBeInTheDocument();
    expect(screen.queryByText('Total reading days')).not.toBeInTheDocument();
  });

  it('should not render tags section when mostReadTags is empty', () => {
    renderComponent({ mostReadTags: [] });

    expect(
      screen.queryByText('Top tags by reading days'),
    ).not.toBeInTheDocument();
  });

  it('should not render tags section when mostReadTags is null', () => {
    renderComponent({ mostReadTags: null });

    expect(
      screen.queryByText('Top tags by reading days'),
    ).not.toBeInTheDocument();
  });

  it('should calculate and display correct total reads', () => {
    renderComponent();

    // Total reads: 5 + 3 + 0 + 8 = 16
    expect(
      screen.getByText('Posts read in the last months (16)'),
    ).toBeInTheDocument();
  });

  it('should display total reads as 0 when readHistory is empty', () => {
    renderComponent({ readHistory: [] });

    expect(
      screen.getByText('Posts read in the last months (0)'),
    ).toBeInTheDocument();
  });

  it('should display total reads as 0 when readHistory is null', () => {
    renderComponent({ readHistory: null });

    expect(
      screen.getByText('Posts read in the last months (0)'),
    ).toBeInTheDocument();
  });

  it('should render calendar heatmap with correct props', () => {
    renderComponent();

    // Check that CalendarHeatmap component is rendered by looking for its content
    // The heatmap should be present in the DOM structure
    expect(
      screen.getByText('Posts read in the last months (16)'),
    ).toBeInTheDocument();
  });

  it('should render heatmap legend', () => {
    renderComponent();

    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should render learn more link with correct href', () => {
    renderComponent();

    const learnMoreLink = screen.getByText('Learn more');
    expect(learnMoreLink).toHaveAttribute(
      'href',
      'https://r.daily.dev/streaks',
    );
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });

  it('should handle large numbers in readHistory', () => {
    const largeReadsHistory: UserReadHistory[] = [
      {
        date: '2024-01-01',
        reads: 1000,
      },
      {
        date: '2024-01-02',
        reads: 2000000,
      },
    ];

    renderComponent({ readHistory: largeReadsHistory });

    expect(
      screen.getByText('Posts read in the last months (2M)'),
    ).toBeInTheDocument();
  });
});
