import React from 'react';
import { render, screen } from '@testing-library/react';
import { AchievementTrackerButton } from './AchievementTrackerButton';
import type { UserAchievement } from '../../graphql/user/achievements';
import { AchievementType } from '../../graphql/user/achievements';

const mockUseAuthContext = jest.fn();
const mockUseConditionalFeature = jest.fn();
const mockUseProfileAchievements = jest.fn();
const mockUseTrackedAchievement = jest.fn();
const mockUseViewSize = jest.fn();
const mockUseLazyModal = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../hooks/profile/useProfileAchievements', () => ({
  useProfileAchievements: () => mockUseProfileAchievements(),
}));

jest.mock('../../hooks/profile/useTrackedAchievement', () => ({
  useTrackedAchievement: () => mockUseTrackedAchievement(),
}));

jest.mock('../../hooks', () => ({
  useViewSize: (...args: unknown[]) => mockUseViewSize(...args),
  ViewSize: { Laptop: 'laptop' },
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => mockUseLazyModal(),
}));

jest.mock('../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ isCompanion: false }),
}));

jest.mock('../AlertDot', () => ({
  AlertDot: ({ className }: { className?: string }) => (
    <div data-testid="alert-dot" className={className} />
  ),
  AlertColor: { Bun: 'bg-accent-bun-default' },
}));

jest.mock('../cards/common/HoverCard', () => ({
  __esModule: true,
  default: ({
    trigger,
    children,
  }: {
    trigger: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div data-testid="hover-card">
      {trigger}
      {children}
    </div>
  ),
}));

jest.mock(
  '../../features/profile/components/achievements/AchievementCard',
  () => ({
    AchievementCard: () => <div data-testid="achievement-card" />,
  }),
);

const mockTrackedAchievement: UserAchievement = {
  achievement: {
    id: 'ach1',
    name: 'First Steps',
    description: 'Complete your first action',
    image: 'https://daily.dev/ach1.png',
    type: AchievementType.Milestone,
    criteria: { targetCount: 5 },
    points: 10,
    rarity: null,
    unit: 'steps',
  },
  progress: 3,
  unlockedAt: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const defaultTrackedAchievementHook = {
  trackedAchievement: null,
  isPending: false,
  isError: false,
  trackAchievement: jest.fn(),
  untrackAchievement: jest.fn(),
  isTrackPending: false,
  isUntrackPending: false,
};

const defaultProfileAchievementsHook = {
  achievements: [mockTrackedAchievement],
  unlockedCount: 0,
  totalCount: 1,
  totalPoints: 0,
  isPending: false,
  isError: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuthContext.mockReturnValue({ user: { id: 'u1' } });
  mockUseConditionalFeature.mockReturnValue({ value: true, isLoading: false });
  mockUseProfileAchievements.mockReturnValue(defaultProfileAchievementsHook);
  mockUseTrackedAchievement.mockReturnValue(defaultTrackedAchievementHook);
  mockUseViewSize.mockReturnValue(false);
  mockUseLazyModal.mockReturnValue({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  });
});

const renderComponent = () => render(<AchievementTrackerButton />);

it('returns null when user is not logged in', () => {
  mockUseAuthContext.mockReturnValue({ user: null });
  const { container } = renderComponent();
  expect(container).toBeEmptyDOMElement();
});

it('returns null when the feature flag is loading', () => {
  mockUseConditionalFeature.mockReturnValue({ value: false, isLoading: true });
  const { container } = renderComponent();
  expect(container).toBeEmptyDOMElement();
});

it('returns null when the feature flag is disabled', () => {
  mockUseConditionalFeature.mockReturnValue({ value: false, isLoading: false });
  const { container } = renderComponent();
  expect(container).toBeEmptyDOMElement();
});

it('renders skeleton placeholder while achievements list is loading', () => {
  mockUseProfileAchievements.mockReturnValue({
    ...defaultProfileAchievementsHook,
    isPending: true,
  });
  renderComponent();
  const skeleton = screen.getByTestId('achievement-tracker-skeleton');
  expect(skeleton).toHaveClass('animate-pulse', 'h-10', 'w-10');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('renders skeleton placeholder while tracked achievement query is pending', () => {
  mockUseTrackedAchievement.mockReturnValue({
    ...defaultTrackedAchievementHook,
    isPending: true,
  });
  renderComponent();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  const skeleton = screen.getByTestId('achievement-tracker-skeleton');
  expect(skeleton).toHaveClass('animate-pulse', 'h-10', 'w-10');
});

it('renders icon-only button with no text label when not tracking', () => {
  renderComponent();
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  // Button should not contain "Track achievement" as visible text
  expect(button).not.toHaveTextContent('Track achievement');
});

it('wraps the non-tracking button with a tooltip labeled "Track achievement"', () => {
  renderComponent();
  // Radix Tooltip sets aria-label on the Trigger with asChild, which forwards to the wrapper div
  expect(screen.getByLabelText('Track achievement')).toBeInTheDocument();
});

it('shows attention dot on the button when no achievement is tracked', () => {
  renderComponent();
  expect(screen.getByTestId('alert-dot')).toBeInTheDocument();
});

it('does not show skeleton once the tracked achievement query resolves', () => {
  renderComponent();
  expect(
    screen.queryByTestId('achievement-tracker-skeleton'),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('renders HoverCard and not Tooltip when tracking an achievement', () => {
  mockUseTrackedAchievement.mockReturnValue({
    ...defaultTrackedAchievementHook,
    trackedAchievement: mockTrackedAchievement,
  });
  renderComponent();
  expect(screen.getByTestId('hover-card')).toBeInTheDocument();
  expect(screen.queryByLabelText('Track achievement')).not.toBeInTheDocument();
});

it('renders AchievementCard inside HoverCard when tracking', () => {
  mockUseTrackedAchievement.mockReturnValue({
    ...defaultTrackedAchievementHook,
    trackedAchievement: mockTrackedAchievement,
  });
  renderComponent();
  expect(screen.getByTestId('achievement-card')).toBeInTheDocument();
});

it('renders achievement image in the button when tracking', () => {
  mockUseTrackedAchievement.mockReturnValue({
    ...defaultTrackedAchievementHook,
    trackedAchievement: mockTrackedAchievement,
  });
  renderComponent();
  expect(screen.getByAltText('First Steps')).toBeInTheDocument();
});
