import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../__tests__/fixture/post';
import ad from '../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { mockDesktop } from '../../../__tests__/helpers/media';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../graphql/feed';
import type { SettingsFlags } from '../../graphql/settings';
import { FeedWidgetRail } from './FeedWidgetRail';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import { useFeedWidgetAd } from './widgets/FeedWidgetAdSlot';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./widgets/FeedWidgetAdSlot', () => ({
  ...jest.requireActual('./widgets/FeedWidgetAdSlot'),
  useFeedWidgetAd: jest.fn(),
}));

// jsdom has no PointerEvent, and without one fireEvent drops the button and
// the pointer type Radix and the trigger read.
class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
Object.assign(window, { PointerEvent: TestPointerEvent });

const posts = ['First hero post', 'Second hero post'].map((title, index) => ({
  ...basePost,
  id: `hero-post-${index}`,
  title,
}));

const highlights = ['First headline', 'Second headline'].map(
  (headline, index) => ({
    id: `hero-highlight-${index}`,
    channel: 'agents',
    headline,
    highlightedAt: '2026-04-05T09:00:00.000Z',
    post: {
      id: `hero-post-${index}`,
      commentsPermalink: `/posts/hero-post-${index}`,
    },
  }),
);

const mockHero = (data = { posts, highlights }) =>
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: { loggedIn: false, supportedTypes: baseFeedSupportedTypes },
    },
    result: { data: { feedHero: data } },
  });

const setSettings = jest.fn();
const onFeedStateChange = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  // The slot only sits on the rail from the tablet breakpoint up.
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
  jest.mocked(useFeedWidgetAd).mockReturnValue({ ad, isEnabled: true });
});

const renderRail = (flags: Partial<SettingsFlags> = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ flags: flags as SettingsFlags, setSettings }}
    >
      <FeedWidgetRail
        feedName="popular"
        onFeedStateChange={onFeedStateChange}
      />
    </TestBootProvider>,
  );

const widgetKinds = () =>
  screen
    .getAllByTestId('feedWidget')
    .map((element) => element.getAttribute('data-kind'));

describe('FeedWidgetRail', () => {
  it('renders the default rail from one query and pins the ad', async () => {
    mockHero();

    renderRail();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Second headline')).toBeInTheDocument();
    expect(widgetKinds()).toEqual([
      FeedWidgetKind.TopStory,
      FeedWidgetKind.HappeningNow,
    ]);
    const slot = screen.getByTestId('feedWidgetAdSlot');
    expect(slot).toBeInTheDocument();
    // The Large story takes columns one and two, so the ad is third.
    expect(slot.parentElement).toHaveStyle({ gridColumn: '3 / span 1' });
    expect(nock.isDone()).toBe(true);
  });

  it('tells the feed what it shows so the grid does not repeat it', async () => {
    mockHero();

    renderRail();

    await waitFor(() =>
      expect(onFeedStateChange).toHaveBeenLastCalledWith({
        excludedPostIds: ['hero-post-0', 'hero-post-1'],
        hasHappeningNow: true,
        hasTopStory: true,
        isAdVisible: true,
      }),
    );
  });

  it('renders the stored rail, dropping a kind this build does not have', async () => {
    mockHero();

    renderRail({
      feedWidgets: [
        {
          id: 'now',
          kind: FeedWidgetKind.HappeningNow,
          size: FeedWidgetSize.Tall,
        },
        {
          id: 'streak',
          kind: FeedWidgetKind.Streak,
          size: FeedWidgetSize.Small,
        },
      ],
    });

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    expect(widgetKinds()).toEqual([FeedWidgetKind.HappeningNow]);
    expect(
      screen.queryByRole('heading', { name: 'First hero post' }),
    ).not.toBeInTheDocument();
    // One Tall does not reach the third column, so the slot closes up behind it.
    expect(screen.getByTestId('feedWidgetAdSlot').parentElement).toHaveStyle({
      gridColumn: '2 / span 1',
    });
    await waitFor(() =>
      expect(onFeedStateChange).toHaveBeenLastCalledWith({
        excludedPostIds: [],
        hasHappeningNow: true,
        hasTopStory: false,
        isAdVisible: true,
      }),
    );
  });

  it('removes a widget from the menu and writes the whole flags object', async () => {
    mockHero();

    renderRail({ clickbaitShieldEnabled: true });

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    expect(screen.getByText('Pinned by daily.dev')).toBeInTheDocument();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Happening Now options' }),
      { key: 'Enter' },
    );
    // Each option is a Radix item around its own button; the button is the row.
    const [remove] = screen
      .getAllByRole('menuitem', { name: 'Remove widget' })
      .filter((item) => item.tagName === 'BUTTON');
    fireEvent.click(remove);

    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        clickbaitShieldEnabled: true,
        feedWidgets: [
          {
            id: 'top-story',
            kind: FeedWidgetKind.TopStory,
            size: FeedWidgetSize.Large,
          },
        ],
      },
    });
  });

  it('leaves edit mode on Escape', async () => {
    mockHero();

    renderRail();

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.getByRole('button', { name: 'Customize' }),
    ).toBeInTheDocument();
  });
});
