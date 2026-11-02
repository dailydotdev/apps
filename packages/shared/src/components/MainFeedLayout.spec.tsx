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
import { FeedTopicMode, FeedTuneTab } from '../features/feedExplain/types';

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
  const renderDebugging = (
    isOn = true,
    seed?: (client: QueryClient) => void,
  ) => {
    const client = new QueryClient();
    client.setQueryData([QueryStateKeys.FeedExplain], isOn);
    seed?.(client);
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

  it('keeps the regular For You query with the flag off', async () => {
    mockFlags({ explain: false, version: 116 });

    renderDebugging();

    await screen.findByTestId('feed');
    expect(lastFeedProps().query).toBe(FEED_V2_QUERY);
    expect(lastFeedProps().variables).not.toHaveProperty('explain');
    expect(lastFeedProps().canExplainPosts).toBe(false);
  });

  it.each([116, 15])(
    'asks for an explanation per card in Debug on feed version %i',
    async (version) => {
      mockFlags({ explain: true, version });

      renderDebugging();

      await screen.findByTestId('feed');
      const { query, variables, isExplaining, canExplainPosts } =
        lastFeedProps();
      expect(query).toBe(FEED_V2_EXPLAIN_QUERY);
      expect(variables).toEqual(expect.objectContaining({ explain: true }));
      expect(isExplaining).toBe(true);
      expect(canExplainPosts).toBe(true);
    },
  );

  it('leaves explanations to the post menu with Debug off', async () => {
    mockFlags({ explain: true, version: 116 });

    renderDebugging(false);

    await screen.findByTestId('feed');
    const { query, variables, isExplaining, canExplainPosts } = lastFeedProps();
    expect(query).toBe(FEED_V2_QUERY);
    expect(variables).not.toHaveProperty('explain');
    expect(isExplaining).toBe(false);
    expect(canExplainPosts).toBe(true);
  });

  it('keeps the cards on screen while Debug or Tune loads the same feed', async () => {
    mockFlags({ explain: true, version: 116 });

    renderDebugging();

    await screen.findByTestId('feed');
    const { feedQueryKey, options } = lastFeedProps();
    const keepPrevious = options?.placeholderData as unknown as (
      data: unknown,
      query?: { queryKey: unknown[] },
    ) => unknown;
    const cards = { pages: [] };
    const plainKey = (feedQueryKey as unknown[]).slice(0, -1);

    expect(keepPrevious(cards, { queryKey: plainKey })).toBe(cards);
    expect(
      keepPrevious(cards, { queryKey: [...feedQueryKey, { topics: [] }] }),
    ).toBe(cards);
    expect(
      keepPrevious(cards, { queryKey: ['popular', defaultUser.id] }),
    ).toBeUndefined();
    expect(keepPrevious(cards, undefined)).toBeUndefined();
  });

  it('offers Tune and Feed settings on a floating bar in Debug mode', async () => {
    mockFlags({ explain: true, version: 116 });

    renderDebugging();

    expect(await screen.findByRole('button', { name: 'Done' })).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Tune your feed' }),
    ).not.toBeInTheDocument();
  });

  it("ranks the feed with Tune's last preview, with the panel beside it", async () => {
    mockFlags({ explain: true, version: 116 });
    const demoteRust = {
      kind: 'topic',
      keyword: 'rust',
      value: { mode: FeedTopicMode.Demote },
    };

    renderDebugging(true, (client) => {
      client.setQueryData([QueryStateKeys.FeedTune], FeedTuneTab.Topics);
      client.setQueryData(
        [QueryStateKeys.FeedTuneChanges],
        [demoteRust, { kind: 'learning', enabled: false }],
      );
      client.setQueryData([QueryStateKeys.FeedTunePreviewed], [demoteRust]);
    });

    await screen.findByTestId('feed');
    expect(lastFeedProps().variables).toEqual(
      expect.objectContaining({
        explain: true,
        draft: { topics: [{ keyword: 'rust', mode: FeedTopicMode.Demote }] },
      }),
    );
    expect(
      screen.getByRole('region', { name: 'Tune your feed' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Done' }),
    ).not.toBeInTheDocument();
  });
});
