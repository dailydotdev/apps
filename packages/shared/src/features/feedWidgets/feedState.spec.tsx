import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop, mockMatchMedia } from '../../../__tests__/helpers/media';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import basePost from '../../../__tests__/fixture/post';
import FeedContext from '../../contexts/FeedContext';
import type { SettingsFlags } from '../../graphql/settings';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../graphql/feed';
import { clearShownFeedHeroLeads } from '../../components/feeds/hero/useFeedHeroData';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SharedFeedPage } from '../../components/utilities/common';
import { OtherFeedPage } from '../../lib/query';
import {
  emptyFeedWidgetFeedState,
  useFeedWidgetFeedState,
  useFeedWidgetRailState,
  useFeedWidgetShortcuts,
  useFeedWidgetsOptOut,
} from './feedState';

jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: jest.fn(),
}));

const mockHero = (id: string) =>
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: { loggedIn: false, supportedTypes: baseFeedSupportedTypes },
    },
    result: {
      data: { feedHero: { posts: [{ ...basePost, id }], highlights: [] } },
    },
  });

const renderFeedState = ({
  enabled = true,
  feedWidgets,
  columns = 4,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
}: {
  enabled?: boolean;
  feedWidgets?: unknown;
  columns?: number;
  client?: QueryClient;
} = {}) =>
  renderHook(() => useFeedWidgetFeedState({ enabled }), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={client}
        settings={{ flags: { feedWidgets } as unknown as SettingsFlags }}
      >
        <FeedContext.Provider
          value={{
            pageSize: 13,
            numCards: { eco: columns, roomy: columns, cozy: columns },
          }}
        >
          {children}
        </FeedContext.Provider>
      </TestBootProvider>
    ),
  });

beforeEach(() => {
  nock.cleanAll();
  clearShownFeedHeroLeads();
  mockDesktop();
});

describe('useFeedWidgetFeedState', () => {
  it('seats nothing for a reader who never placed a widget', () => {
    const { result } = renderFeedState();

    expect(result.current).toEqual(emptyFeedWidgetFeedState);
  });

  it('keeps out the lead the top story shows', async () => {
    mockHero('lead');

    const { result } = renderFeedState({
      feedWidgets: {
        version: 1,
        widgets: [{ id: 'top', kind: 'topStory', size: 'tall', slot: 3 }],
      },
    });

    await waitFor(() =>
      expect(result.current.excludedPostIds).toEqual(['lead']),
    );
  });

  it('seats the placed widgets by slot, leaving out the old rail’s', () => {
    const now = { id: 'now', kind: 'happeningNow', size: 'tall', slot: 5 };
    const streak = { id: 'streak', kind: 'streak', size: 'small', slot: 1 };
    const { result } = renderFeedState({
      feedWidgets: {
        version: 1,
        widgets: [
          now,
          { id: 'rail', kind: 'notifications', size: 'small' },
          streak,
        ],
      },
    });

    expect(result.current).toEqual({
      widgets: [streak, now],
      excludedPostIds: [],
      hasHappeningNow: true,
      hasTopStoryFirst: false,
    });
  });

  it('seats no cell for a kind this build cannot render', () => {
    const streak = { id: 'streak', kind: 'streak', size: 'tall', slot: 1 };
    const { result } = renderFeedState({
      feedWidgets: {
        version: 1,
        widgets: [
          { id: 'new', kind: 'fromANewerBuild', size: 'tall', slot: 0 },
          streak,
        ],
      },
    });

    expect(result.current.widgets).toEqual([streak]);
  });

  it('holds back nothing while the widgets are off', () => {
    const { result } = renderFeedState({
      enabled: false,
      feedWidgets: {
        version: 1,
        widgets: [{ id: 'now', kind: 'happeningNow', size: 'tall', slot: 0 }],
      },
    });

    expect(result.current).toEqual(emptyFeedWidgetFeedState);
  });
});

const shortcutsRail = {
  version: 1,
  widgets: [{ id: 'links', kind: 'shortcuts', size: 'small', slot: 0 }],
};

const renderShortcuts = ({
  feedName = SharedFeedPage.MyFeed,
  feedWidgets,
  isFlagOn = true,
  loadedSettings = true,
}: {
  feedName?: string;
  feedWidgets?: unknown;
  isFlagOn?: boolean;
  loadedSettings?: boolean;
} = {}) =>
  renderHook(() => useFeedWidgetShortcuts(feedName), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={new QueryClient()}
        gb={
          new GrowthBook({
            features: { feed_widgets_v4: { defaultValue: isFlagOn } },
          })
        }
        settings={{
          loadedSettings,
          flags: { feedWidgets } as unknown as SettingsFlags,
        }}
      >
        {children}
      </TestBootProvider>
    ),
  });

describe('useFeedWidgetShortcuts', () => {
  it('keeps the row unless the Shortcuts widget is in the first row', () => {
    expect(
      renderShortcuts({
        feedWidgets: {
          version: 1,
          widgets: [{ id: 'links', kind: 'shortcuts', size: 'tall', slot: 30 }],
        },
      }).result.current.hasShortcutsWidget,
    ).toBe(false);
  });

  it('hands shortcuts to the feed only when the Shortcuts widget is in it', () => {
    expect(
      renderShortcuts({ feedWidgets: shortcutsRail }).result.current,
    ).toEqual({ hasRail: true, hasShortcutsWidget: true, isPending: false });
    expect(renderShortcuts().result.current).toEqual({
      hasRail: true,
      hasShortcutsWidget: false,
      isPending: false,
    });
    expect(
      renderShortcuts({
        feedWidgets: {
          version: 1,
          widgets: [{ id: 'now', kind: 'happeningNow', size: 'tall' }],
        },
      }).result.current.hasShortcutsWidget,
    ).toBe(false);
  });

  it('leaves them to the row where the rail does not render', () => {
    expect(
      renderShortcuts({ feedWidgets: shortcutsRail, isFlagOn: false }).result
        .current.hasRail,
    ).toBe(false);
    expect(
      renderShortcuts({
        feedWidgets: shortcutsRail,
        feedName: SharedFeedPage.Custom,
      }).result.current,
    ).toEqual({ hasRail: false, hasShortcutsWidget: false, isPending: false });
  });

  it('is pending on a rail feed until the settings that hold the rail load', () => {
    expect(
      renderShortcuts({ loadedSettings: false }).result.current.isPending,
    ).toBe(true);
    expect(
      renderShortcuts({
        loadedSettings: false,
        feedName: SharedFeedPage.Custom,
      }).result.current.isPending,
    ).toBe(false);
  });
});

describe('useFeedWidgetsOptOut', () => {
  const displayToast = jest.fn();
  const setSettings = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
  });

  it('hides on the stored widgets, and undoes into the latest flags', async () => {
    const placed = { id: 'a', kind: 'streak', size: 'tall', slot: 2 };
    let flags = {
      feedWidgets: { version: 1, widgets: [placed] },
    } as unknown as SettingsFlags;
    const { result, rerender } = renderHook(() => useFeedWidgetsOptOut(), {
      wrapper: ({ children }: { children: ReactNode }): ReactElement => (
        <TestBootProvider
          client={new QueryClient()}
          settings={{ flags, setSettings }}
        >
          {children}
        </TestBootProvider>
      ),
    });

    result.current.hide();
    expect(setSettings).toHaveBeenLastCalledWith({
      flags: { feedWidgets: { version: 1, widgets: [placed], hidden: true } },
    });

    // The hide landed and another flag changed before Undo.
    flags = {
      feedWidgets: { version: 1, widgets: [placed], hidden: true },
      sidebarResourcesExpanded: true,
    } as unknown as SettingsFlags;
    rerender();
    expect(result.current.isOptedOut).toBe(true);
    await displayToast.mock.calls[0][1].action.onClick();

    expect(setSettings).toHaveBeenLastCalledWith({
      flags: {
        feedWidgets: { version: 1, widgets: [placed], hidden: false },
        sidebarResourcesExpanded: true,
      },
    });
  });

  it('starts fresh from the rail’s opt-out', () => {
    const { result } = renderHook(() => useFeedWidgetsOptOut(), {
      wrapper: ({ children }: { children: ReactNode }): ReactElement => (
        <TestBootProvider
          client={new QueryClient()}
          settings={{
            flags: { feedWidgetsOptOut: true } as SettingsFlags,
            setSettings,
          }}
        >
          {children}
        </TestBootProvider>
      ),
    });

    expect(result.current.isOptedOut).toBe(false);
  });
});

const renderRailState = (
  feedName: string,
  gb = new GrowthBook({
    features: { feed_widgets_v4: { defaultValue: true } },
  }),
  { insaneMode = false } = {},
) =>
  renderHook(() => useFeedWidgetRailState(feedName), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={new QueryClient()}
        gb={gb}
        settings={{ insaneMode }}
      >
        {children}
      </TestBootProvider>
    ),
  });

describe('useFeedWidgetRailState', () => {
  it('takes widgets on For you and Popular from the laptop up', () => {
    expect(
      renderRailState(SharedFeedPage.MyFeed).result.current.isEnabled,
    ).toBe(true);
    expect(
      renderRailState(SharedFeedPage.Popular).result.current.isEnabled,
    ).toBe(true);
  });

  it('keeps phones and tablets on the plain feed, never enrolled in the flag', async () => {
    // No width breakpoint matches: a phone.
    mockMatchMedia(() => false);
    const gb = new GrowthBook({
      features: { feed_widgets_v4: { defaultValue: true } },
    });
    const evaluate = jest.spyOn(gb, 'getFeatureValue');
    const feeds = [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      OtherFeedPage.Following,
      SharedFeedPage.Custom,
    ].map((feedName) => renderRailState(feedName, gb).result);

    // Past the mount, where the phone check lands.
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });

    feeds.forEach((result) => expect(result.current.isEnabled).toBe(false));
    expect(evaluate).not.toHaveBeenCalledWith(
      'feed_widgets_v4',
      expect.anything(),
    );
  });

  it('never enrolls a laptop reader whose feed is a list', () => {
    const gb = new GrowthBook({
      features: { feed_widgets_v4: { defaultValue: true } },
    });
    const evaluate = jest.spyOn(gb, 'getFeatureValue');

    const { result } = renderRailState(SharedFeedPage.MyFeed, gb, {
      insaneMode: true,
    });

    expect(result.current.isEnabled).toBe(false);
    expect(evaluate).not.toHaveBeenCalledWith(
      'feed_widgets_v4',
      expect.anything(),
    );
  });

  it('leaves Following and the custom feeds alone', () => {
    expect(
      renderRailState(OtherFeedPage.Following).result.current.isEnabled,
    ).toBe(false);
    expect(
      renderRailState(SharedFeedPage.Custom).result.current.isEnabled,
    ).toBe(false);
  });
});
