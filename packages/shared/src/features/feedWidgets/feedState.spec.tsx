import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../__tests__/helpers/media';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import basePost from '../../../__tests__/fixture/post';
import FeedContext from '../../contexts/FeedContext';
import type { SettingsFlags } from '../../graphql/settings';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../graphql/feed';
import { fetchAdByPlacement } from '../../lib/ads';
import { clearShownFeedHeroLeads } from '../../components/feeds/hero/useFeedHeroData';
import { useToastNotification } from '../../hooks/useToastNotification';
import {
  emptyFeedWidgetFeedState,
  useFeedWidgetFeedState,
  useFeedWidgetsOptOut,
} from './feedState';

jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: jest.fn(),
}));

jest.mock('../../lib/ads', () => ({
  ...jest.requireActual('../../lib/ads'),
  fetchAdByPlacement: jest.fn(),
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
}: { enabled?: boolean; feedWidgets?: unknown; columns?: number } = {}) =>
  renderHook(() => useFeedWidgetFeedState({ enabled }), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
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
  // The slot only sits on the rail from the tablet breakpoint up.
  mockDesktop();
  // Pending: the slot keeps the grid's first ad until the rail's answers.
  jest.mocked(fetchAdByPlacement).mockReturnValue(new Promise(() => {}));
});

describe('useFeedWidgetFeedState', () => {
  it('knows the default rail before anything of the rail loads', () => {
    const { result } = renderFeedState();

    expect(result.current).toEqual({
      excludedPostIds: [],
      hasHappeningNow: false,
      hasTopStory: true,
      isAdVisible: true,
    });
  });

  it('keeps out the lead the top story shows', async () => {
    mockHero('lead');

    const { result } = renderFeedState();

    await waitFor(() =>
      expect(result.current.excludedPostIds).toEqual(['lead']),
    );
  });

  it('follows the stored rail, and drops the lead post with the top story', () => {
    const { result } = renderFeedState({
      feedWidgets: {
        version: 1,
        widgets: [{ id: 'now', kind: 'happeningNow', size: 'tall' }],
      },
    });

    expect(result.current).toEqual({
      excludedPostIds: [],
      hasHappeningNow: true,
      hasTopStory: false,
      isAdVisible: true,
    });
  });

  it('hands the first ad back to the grid once the slot comes back empty', async () => {
    jest.mocked(fetchAdByPlacement).mockResolvedValue(null);

    const { result } = renderFeedState();

    await waitFor(() => expect(result.current.isAdVisible).toBe(false));
  });

  it('leaves the ad to the grid when the slot would be off the first screen', () => {
    const { result } = renderFeedState({ columns: 2 });

    expect(result.current.isAdVisible).toBe(false);
  });

  it('holds back nothing while the rail is off', () => {
    const { result } = renderFeedState({ enabled: false });

    expect(result.current).toEqual(emptyFeedWidgetFeedState);
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

  it('undoes into the latest flags, not the ones the rail hid from', async () => {
    let flags = { feedWidgetsOptOut: false } as SettingsFlags;
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
      flags: { feedWidgetsOptOut: true },
    });

    // The hide landed and another flag changed before Undo.
    flags = {
      feedWidgetsOptOut: true,
      sidebarResourcesExpanded: true,
    } as SettingsFlags;
    rerender();
    await displayToast.mock.calls[0][1].action.onClick();

    expect(setSettings).toHaveBeenLastCalledWith({
      flags: { feedWidgetsOptOut: false, sidebarResourcesExpanded: true },
    });
  });
});
