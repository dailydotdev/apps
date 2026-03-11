import React, { act } from 'react';
import { screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import MainLayoutHeader from './MainLayoutHeader';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActiveFeedNameContext } from '../../contexts';
import { useViewSize } from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeedName } from '../../hooks/feed/useFeedName';
import useActiveNav from '../../hooks/useActiveNav';

jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent() {
    return <div data-testid="dynamic-component" />;
  };
});

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedNameContext: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ViewSize: {
    Laptop: 'laptop',
  },
  useViewSize: jest.fn(),
}));

jest.mock('../../hooks/streaks', () => ({
  useReadingStreak: jest.fn(),
}));

jest.mock('../../hooks/utils/useFeatureTheme', () => ({
  useFeatureTheme: jest.fn(),
}));

jest.mock('../../hooks/useScrollTopClassName', () => ({
  useScrollTopClassName: jest.fn(),
}));

jest.mock('../../hooks/feed/useFeedName', () => ({
  useFeedName: jest.fn(),
}));

jest.mock('../../hooks/useActiveNav', () => jest.fn());

jest.mock('../header/MobileExploreHeader', () => ({
  MobileExploreHeader: ({ path }: { path: string }) => (
    <div data-testid="mobile-explore-header">{path}</div>
  ),
}));

const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseActiveFeedNameContext = useActiveFeedNameContext as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeatureTheme = useFeatureTheme as jest.Mock;
const mockUseScrollTopClassName = useScrollTopClassName as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseActiveNav = useActiveNav as jest.Mock;

describe('MainLayoutHeader', () => {
  beforeEach(() => {
    mockUseActiveFeedNameContext.mockReturnValue({ feedName: 'posts' });
    mockUseViewSize.mockReturnValue(false);
    mockUseReadingStreak.mockReturnValue({
      streak: null,
      isStreaksEnabled: false,
    });
    mockUseFeatureTheme.mockReturnValue(null);
    mockUseScrollTopClassName.mockReturnValue('');
    mockUseFeedName.mockReturnValue({
      isAnyExplore: true,
      isSearch: false,
    });
    mockUseActiveNav.mockReturnValue({ profile: false });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps the same banner element during mobile explore hydration', async () => {
    mockUseSettingsContext.mockReturnValue({ loadedSettings: false });

    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = renderToString(<MainLayoutHeader />);

    const initialHeader = screen.getByRole('banner');

    expect(initialHeader).toBeInTheDocument();
    expect(initialHeader).toHaveClass('fixed');

    mockUseSettingsContext.mockReturnValue({ loadedSettings: true });

    const recoverableErrors: unknown[] = [];
    let root: Root;

    await act(async () => {
      root = hydrateRoot(container, <MainLayoutHeader />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    const hydratedHeader = screen.getByRole('banner');

    expect(hydratedHeader).toBe(initialHeader);
    expect(hydratedHeader).toHaveClass('sticky', 'top-0');
    expect(screen.getByTestId('mobile-explore-header')).toHaveTextContent(
      'posts',
    );
    expect(recoverableErrors).toHaveLength(0);

    await act(async () => {
      root.unmount();
    });
  });
});
