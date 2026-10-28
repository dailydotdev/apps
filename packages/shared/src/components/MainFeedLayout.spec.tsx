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
import {
  feature as flags,
  featureFeedExplain,
  featureFeedHero,
  featureFeedWidgets,
} from '../lib/featureManagement';
import { SearchProvider } from '../contexts/search/SearchContext';
import { QueryStateKeys } from '../hooks/utils/useQueryState';
import { ActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { FEED_V2_EXPLAIN_QUERY, FEED_V2_QUERY } from '../graphql/feed';

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
  explain = false,
  version = flags.feedVersion.defaultValue,
}: {
  widgets?: boolean;
  hero?: boolean;
  explain?: boolean;
  version?: number;
}) =>
  jest.mocked(useConditionalFeature).mockImplementation(({ feature }) => {
    if (feature.id === featureFeedWidgets.id) {
      return { value: widgets, isLoading: false };
    }
    if (feature.id === featureFeedHero.id) {
      return { value: hero, isLoading: false };
    }
    if (feature.id === featureFeedExplain.id) {
      return { value: explain, isLoading: false };
    }
    if (feature.id === flags.feedVersion.id) {
      return { value: version, isLoading: false } as ReturnType<
        typeof useConditionalFeature
      >;
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

describe('Debug mode', () => {
  // The reader turned the switch on earlier in the session, on For You.
  const renderDebugging = () => {
    const client = new QueryClient();
    client.setQueryData([QueryStateKeys.FeedExplain], true);
    return render(
      <TestBootProvider client={client} auth={{ user: defaultUser }}>
        <ActiveFeedNameContext.Provider
          value={{ feedName: SharedFeedPage.MyFeed }}
        >
          <SearchProvider>
            <MainFeedLayout
              feedName={SharedFeedPage.MyFeed}
              isSearchOn={false}
            />
          </SearchProvider>
        </ActiveFeedNameContext.Provider>
      </TestBootProvider>,
    );
  };

  it.each([
    ['the flag off', { explain: false, version: 116 }],
    ['a feed version that does not explain', { explain: true, version: 15 }],
  ])('keeps the regular For You query with %s', async (_, flagValues) => {
    mockFlags(flagValues);

    renderDebugging();

    await screen.findByTestId('feed');
    expect(lastFeedProps().query).toBe(FEED_V2_QUERY);
    expect(lastFeedProps().variables).not.toHaveProperty('explain');
  });

  it('asks the challenger version for explanations', async () => {
    mockFlags({ explain: true, version: 116 });

    renderDebugging();

    await screen.findByTestId('feed');
    const { query, variables } = lastFeedProps();
    expect(query).toBe(FEED_V2_EXPLAIN_QUERY);
    expect(variables).toEqual(expect.objectContaining({ explain: true }));
  });
});
