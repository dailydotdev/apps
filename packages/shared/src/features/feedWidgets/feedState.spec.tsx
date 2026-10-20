import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../__tests__/helpers/media';
import FeedContext from '../../contexts/FeedContext';
import type { SettingsFlags } from '../../graphql/settings';
import {
  emptyFeedWidgetFeedState,
  useFeedWidgetFeedState,
  writeCachedFeedWidgetFeedState,
} from './feedState';

const renderFeedState = ({
  enabled = true,
  feedWidgets,
  columns = 4,
}: { enabled?: boolean; feedWidgets?: unknown; columns?: number } = {}) =>
  renderHook(() => useFeedWidgetFeedState({ enabled }), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={new QueryClient()}
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
  // The slot only sits on the rail from the tablet breakpoint up.
  mockDesktop();
});

describe('useFeedWidgetFeedState', () => {
  it('knows the default rail before anything of the rail loads', () => {
    const { result } = renderFeedState();

    // A first visit: no lead post from a last load, so none is held back.
    expect(result.current).toEqual({
      excludedPostIds: [],
      hasHappeningNow: false,
      hasTopStory: true,
      isAdVisible: true,
    });
  });

  it('keeps out the lead post the last load settled on, from the start', () => {
    writeCachedFeedWidgetFeedState(undefined, {
      ...emptyFeedWidgetFeedState,
      excludedPostIds: ['last-lead'],
    });

    const { result } = renderFeedState();

    expect(result.current.excludedPostIds).toEqual(['last-lead']);
  });

  it('follows the stored rail, and drops the lead post with the top story', () => {
    writeCachedFeedWidgetFeedState(undefined, {
      ...emptyFeedWidgetFeedState,
      excludedPostIds: ['last-lead'],
    });

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

  it('leaves the ad to the grid when the slot would be off the first screen', () => {
    const { result } = renderFeedState({ columns: 2 });

    expect(result.current.isAdVisible).toBe(false);
  });

  it('holds back nothing while the rail is off', () => {
    writeCachedFeedWidgetFeedState(undefined, {
      ...emptyFeedWidgetFeedState,
      excludedPostIds: ['last-lead'],
    });

    const { result } = renderFeedState({ enabled: false });

    expect(result.current).toEqual(emptyFeedWidgetFeedState);
  });
});
