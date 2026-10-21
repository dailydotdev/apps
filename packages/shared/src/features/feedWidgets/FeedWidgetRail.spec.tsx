import React from 'react';
import nock from 'nock';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
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
import FeedContext from '../../contexts/FeedContext';
import { FeedWidgetRail } from './FeedWidgetRail';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import { useFeedWidgetAd } from './feedState';
import { clearHeldFeedHeroLeads } from '../../components/feeds/hero/useFeedHeroData';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./feedState', () => ({
  ...jest.requireActual('./feedState'),
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

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  // The slot only sits on the rail from the tablet breakpoint up.
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
  jest
    .mocked(useFeedWidgetAd)
    .mockReturnValue({ ad, isEnabled: true, isNoFill: false });
  clearHeldFeedHeroLeads();
});

const renderRail = (flags: Partial<SettingsFlags> = {}, columns = 4) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ flags: flags as SettingsFlags, setSettings }}
    >
      {/* Four columns by default, so the pinned slot is on the first screen. */}
      <FeedContext.Provider
        value={{
          pageSize: 13,
          numCards: { eco: columns, roomy: columns, cozy: columns },
        }}
      >
        <FeedWidgetRail feedName="popular" />
      </FeedContext.Provider>
    </TestBootProvider>,
  );

// Widgets mount once their cell is on screen; jsdom has no layout, so say so.
const revealWidgets = async () => {
  await waitFor(() =>
    expect(screen.getAllByTestId('feedWidget').length).toBeGreaterThan(0),
  );
  act(() => mockAllIsIntersecting(true));
};

const widgetKinds = () =>
  screen
    .getAllByTestId('feedWidget')
    .map((element) => element.getAttribute('data-kind'));

describe('FeedWidgetRail', () => {
  it('renders the default rail from one query and pins the ad', async () => {
    mockHero();

    renderRail();
    await revealWidgets();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    // Happening Now stays in the feed until the reader adds it.
    expect(screen.queryByText('Second headline')).not.toBeInTheDocument();
    expect(widgetKinds()).toEqual([FeedWidgetKind.TopStory]);
    expect(
      screen.getByRole('button', { name: 'Add a widget' }),
    ).toBeInTheDocument();
    const slot = screen.getByTestId('feedWidgetAdSlot');
    expect(slot).toBeInTheDocument();
    // The Large story takes columns one and two, so the ad is third.
    expect(slot.parentElement).toHaveStyle({ gridColumn: '3 / span 1' });
    expect(nock.isDone()).toBe(true);
  });

  it('renders the stored rail, dropping a kind this build does not have', async () => {
    mockHero();

    renderRail({
      feedWidgets: {
        version: 1,
        widgets: [
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
      },
    });
    await revealWidgets();

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
  });

  it('removes a widget from the menu and writes the whole flags object', async () => {
    mockHero();

    renderRail({
      clickbaitShieldEnabled: true,
      feedWidgets: {
        version: 1,
        widgets: [
          {
            id: 'top-story',
            kind: FeedWidgetKind.TopStory,
            size: FeedWidgetSize.Large,
          },
          {
            id: 'now',
            kind: FeedWidgetKind.HappeningNow,
            size: FeedWidgetSize.Tall,
          },
        ],
      },
    });
    await revealWidgets();

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
        feedWidgets: {
          version: 1,
          widgets: [
            {
              id: 'top-story',
              kind: FeedWidgetKind.TopStory,
              size: FeedWidgetSize.Large,
            },
          ],
        },
      },
    });
  });

  const twoWidgets = [
    {
      id: 'top-story',
      kind: FeedWidgetKind.TopStory,
      size: FeedWidgetSize.Large,
    },
    { id: 'now', kind: FeedWidgetKind.HappeningNow, size: FeedWidgetSize.Tall },
  ];

  it('removes a widget from its badge in edit mode', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Top story' }));

    expect(setSettings).toHaveBeenCalledWith({
      flags: { feedWidgets: { version: 1, widgets: [twoWidgets[1]] } },
    });
  });

  it('moves a widget with the keyboard and writes once, on drop', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    const widget = screen.getByRole('button', {
      name: 'Happening Now, Tall, position 2',
    });
    fireEvent.keyDown(widget, { key: ' ' });
    fireEvent.keyDown(widget, { key: 'ArrowLeft' });
    expect(setSettings).not.toHaveBeenCalled();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Happening Now, Tall, position 1' }),
      { key: ' ' },
    );
    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        feedWidgets: {
          version: 1,
          widgets: [twoWidgets[1], twoWidgets[0]],
        },
      },
    });
  });

  it('drops a keyboard move on Escape without writing', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    const widget = screen.getByRole('button', {
      name: 'Happening Now, Tall, position 2',
    });
    fireEvent.keyDown(widget, { key: ' ' });
    fireEvent.keyDown(widget, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(setSettings).not.toHaveBeenCalled();
    expect(widgetKinds()).toEqual([
      FeedWidgetKind.TopStory,
      FeedWidgetKind.HappeningNow,
    ]);
    // Still editing: the Esc canceled the move, not the session.
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('places no slot when its column is off the first screen', async () => {
    mockHero();

    renderRail({}, 2);
    await revealWidgets();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('feedWidgetAdSlot')).not.toBeInTheDocument();
    expect(useFeedWidgetAd).toHaveBeenLastCalledWith({ enabled: false });
  });

  it('offers the empty slot for a widget once the ad comes back empty', async () => {
    jest
      .mocked(useFeedWidgetAd)
      .mockReturnValue({ ad: undefined, isEnabled: true, isNoFill: true });
    mockHero();

    renderRail();
    await revealWidgets();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('feedWidgetAdSlot')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add another widget' }),
    ).toBeInTheDocument();
  });

  it('leaves edit mode on Escape', async () => {
    mockHero();

    renderRail();
    await revealWidgets();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.getByRole('button', { name: 'Customize' }),
    ).toBeInTheDocument();
  });
});
