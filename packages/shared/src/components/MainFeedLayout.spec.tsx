import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { FeedProps } from './Feed';
import MainFeedLayout from './MainFeedLayout';
import { SharedFeedPage } from './utilities';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { useConditionalFeature } from '../hooks/useConditionalFeature';
import { featureFeedHero, featureFeedWidgets } from '../lib/featureManagement';
import { SearchProvider } from '../contexts/search/SearchContext';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockFeedProps = jest.fn();
jest.mock('./Feed', () => ({
  __esModule: true,
  default: (props: FeedProps<unknown>) => {
    mockFeedProps(props);
    return <div data-testid="feed" />;
  },
}));

jest.mock('../features/feedWidgets/FeedWidgetRail', () => ({
  FeedWidgetRail: () => null,
}));

jest.mock('../features/feedWidgets/HomeFeedTabs', () => ({
  HomeFeedTabs: () => <nav data-testid="home-feed-tabs" />,
}));

jest.mock('./feeds/hero/FeedHero', () => ({
  FeedHero: () => null,
}));

jest.mock('../features/shortcuts/components/WebappShortcutsRow', () => ({
  WebappShortcutsRow: () => null,
}));

const mockFlags = ({
  widgets = false,
  hero = false,
}: {
  widgets?: boolean;
  hero?: boolean;
}) =>
  jest.mocked(useConditionalFeature).mockImplementation(({ feature }) => {
    if (feature.id === featureFeedWidgets.id) {
      return { value: widgets, isLoading: false };
    }
    if (feature.id === featureFeedHero.id) {
      return { value: hero, isLoading: false };
    }
    return { value: feature.defaultValue, isLoading: false } as ReturnType<
      typeof useConditionalFeature
    >;
  });

const renderLayout = () =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <SearchProvider>
        <MainFeedLayout feedName={SharedFeedPage.MyFeed} isSearchOn={false} />
      </SearchProvider>
    </TestBootProvider>,
  );

const lastFeedProps = (): FeedProps<unknown> =>
  mockFeedProps.mock.calls[mockFeedProps.mock.calls.length - 1][0];

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

it('keeps the reading reminder under the widget rail', async () => {
  mockFlags({ widgets: true });

  renderLayout();

  await screen.findByTestId('feed');
  expect(lastFeedProps()).toEqual(
    expect.objectContaining({ disableTopHero: false, keepTopHero: true }),
  );
});

it('lets the feed hero take the reading reminder’s place', async () => {
  mockFlags({ hero: true });

  renderLayout();

  await screen.findByTestId('feed');
  expect(lastFeedProps()).toEqual(
    expect.objectContaining({ disableTopHero: true, keepTopHero: false }),
  );
});

it('moves the feed’s tabs and actions under the widget rail', async () => {
  mockFlags({ widgets: true });

  renderLayout();

  await screen.findByTestId('feed');
  const { actionButtons, topContent } = lastFeedProps();
  expect(actionButtons).toBeFalsy();
  render(<>{topContent}</>);
  expect(screen.getByTestId('home-feed-tabs')).toBeInTheDocument();
});

it('keeps the feed’s actions and top slot without the rail', async () => {
  mockFlags({});

  renderLayout();

  await screen.findByTestId('feed');
  const { actionButtons, topContent } = lastFeedProps();
  expect(actionButtons).toBeTruthy();
  expect(topContent).toBeUndefined();
  expect(screen.queryByTestId('home-feed-tabs')).not.toBeInTheDocument();
});
