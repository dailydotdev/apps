import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook';
import { render, screen } from '@testing-library/react';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { useReadingStreak } from '../../hooks/streaks';
import { MobileFeedActions } from './MobileFeedActions';

const mockQuestButton = jest.fn(
  (): ReactElement => <div data-testid="quest-button">Quest button</div>,
);

jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent() {
    return null;
  };
});

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    asPath: '/',
    query: {},
  }),
}));

jest.mock('../../hooks/streaks', () => ({
  useReadingStreak: jest.fn(),
}));

jest.mock('../layout/HeaderLogo', () => ({
  __esModule: true,
  default: function HeaderLogoMock(): ReactElement {
    return <div data-testid="header-logo" />;
  },
}));

jest.mock('../profile/ProfilePictureWithIndicator', () => ({
  ProfilePictureWithIndicator:
    function ProfilePictureWithIndicatorMock(): ReactElement {
      return <div data-testid="profile-picture" />;
    },
}));

jest.mock('../streak/ReadingStreakButton', () => ({
  ReadingStreakButton: function ReadingStreakButtonMock(): ReactElement {
    return <div data-testid="streak-button">Streak button</div>;
  },
}));

jest.mock('../quest/QuestButton', () => ({
  QuestButton: (props: { compact?: boolean }): ReactElement =>
    mockQuestButton(props),
}));

const mockUseReadingStreak = useReadingStreak as jest.Mock;

const getGrowthBook = (isQuestsFeatureEnabled = true): GrowthBook => {
  const gb = new GrowthBook();

  gb.setFeatures({
    quests: {
      defaultValue: isQuestsFeatureEnabled,
    },
  });

  return gb;
};

const renderComponent = ({
  optOutQuestSystem = false,
  isQuestsFeatureEnabled = true,
}: {
  optOutQuestSystem?: boolean;
  isQuestsFeatureEnabled?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      settings={{ optOutQuestSystem }}
      gb={getGrowthBook(isQuestsFeatureEnabled)}
    >
      <MobileFeedActions />
    </TestBootProvider>,
  );

describe('MobileFeedActions', () => {
  beforeEach(() => {
    mockQuestButton.mockClear();
    mockUseReadingStreak.mockReturnValue({
      streak: { current: 2, lastViewAt: new Date().toISOString() },
      isLoading: false,
      isStreaksEnabled: true,
    });
  });

  it('should render the quest entry next to the streak button', () => {
    renderComponent({ optOutQuestSystem: false, isQuestsFeatureEnabled: true });

    const actionButtons = screen.getAllByTestId(/^(streak|quest)-button$/);

    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toHaveAttribute('data-testid', 'streak-button');
    expect(actionButtons[1]).toHaveAttribute('data-testid', 'quest-button');
    expect(mockQuestButton).toHaveBeenCalledWith(
      expect.objectContaining({ compact: true }),
    );
  });

  it('should hide the quest entry when opted out from quests', () => {
    renderComponent({ optOutQuestSystem: true, isQuestsFeatureEnabled: true });

    expect(screen.queryByTestId('quest-button')).not.toBeInTheDocument();
  });
});
