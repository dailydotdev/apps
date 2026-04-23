import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  gameCenterMilestoneSectionId,
  webappUrl,
} from '../../../lib/constants';
import { questsFeature } from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../../hooks';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import { useQuestDashboard } from '../../../hooks/useQuestDashboard';
import { MainSection } from './MainSection';

jest.mock('../Section', () => ({
  Section: ({ items }: { items: { title: string; path?: string }[] }) => (
    <div>
      {items.map((item) => (
        <a key={item.title} href={item.path}>
          {item.title}
        </a>
      ))}
    </div>
  ),
}));

jest.mock('../../../contexts/AuthContext', () => {
  const actual = jest.requireActual('../../../contexts/AuthContext');

  return {
    ...actual,
    useAuthContext: jest.fn(),
  };
});

jest.mock('../../../hooks', () => {
  const actual = jest.requireActual('../../../hooks');

  return {
    ...actual,
    useConditionalFeature: jest.fn(),
  };
});

jest.mock('../../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseCustomDefaultFeed = useCustomDefaultFeed as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;

describe('MainSection', () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        isPlus: false,
      },
      isLoggedIn: true,
    });
    mockUseConditionalFeature.mockImplementation(({ feature }) => ({
      value: feature === questsFeature,
      isLoading: false,
    }));
    mockUseCustomDefaultFeed.mockReturnValue({
      isCustomDefaultFeed: false,
    });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        milestone: [],
      },
    });
  });

  it('should keep the game center link on the main page when no milestone quests are claimable', () => {
    render(
      <MainSection
        isItemsButton={false}
        sidebarExpanded
        shouldShowLabel
        activePage="/"
      />,
    );

    expect(screen.getByRole('link', { name: 'Game Center' })).toHaveAttribute(
      'href',
      `${webappUrl}game-center`,
    );
  });

  it('should link directly to milestone quests when claimable milestone quests exist', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        milestone: [{ claimable: true }, { claimable: false }],
      },
    });

    render(
      <MainSection
        isItemsButton={false}
        sidebarExpanded
        shouldShowLabel
        activePage="/"
      />,
    );

    expect(screen.getByRole('link', { name: 'Game Center' })).toHaveAttribute(
      'href',
      `${webappUrl}game-center#${gameCenterMilestoneSectionId}`,
    );
  });
});
