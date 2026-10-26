import React from 'react';
import nock from 'nock';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
import { feedWidgetTips } from './tips';
import { feedRailFingerprint } from './storedRail';
import { clearShownFeedHeroLeads } from '../../components/feeds/hero/useFeedHeroData';

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
const onHide = jest.fn();

// jsdom lays nothing out, so it has no element scrolling.
Element.prototype.scrollTo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  // The slot only sits on the rail from the tablet breakpoint up.
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(
      () => ({ pathname: '/', push: jest.fn() } as unknown as NextRouter),
    );
  jest
    .mocked(useFeedWidgetAd)
    .mockReturnValue({ ad, isEnabled: true, isNoFill: false });
  clearShownFeedHeroLeads();
  // The top story draws its lead; these cases read the first post there.
  jest.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  jest.mocked(Math.random).mockRestore();
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
        <FeedWidgetRail feedName="popular" onHide={onHide} />
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
            id: 'unknown',
            kind: 'notBuiltYet' as FeedWidgetKind,
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

  it('offers no Customize on a rail a newer build saved', async () => {
    mockHero();

    renderRail({
      feedWidgets: {
        version: 2,
        widgets: [
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
    expect(
      screen.queryByRole('button', { name: 'Customize' }),
    ).not.toBeInTheDocument();
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

  it('offers the add tile on a customized rail only in edit mode', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();

    expect(
      screen.queryByRole('button', { name: 'Add a widget' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    // The header's button and the tile, which Customize scrolls into view.
    expect(
      screen.getAllByRole('button', { name: 'Add a widget' }),
    ).toHaveLength(2);
    expect(Element.prototype.scrollTo).toHaveBeenCalled();
  });

  it('hides the whole rail from edit mode', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide widgets' }));

    expect(onHide).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Hide widgets' }),
    ).not.toBeInTheDocument();
  });

  it('takes widget content out of reach in edit mode', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();

    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    const content = screen
      .getByText('First headline')
      .closest<HTMLElement>('.rounded-16');
    expect(content?.inert).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    expect(content?.inert).toBe(true);
    // The menu stays usable: it sits outside the content.
    expect(
      screen
        .getByRole('button', { name: 'Remove Top story' })
        .closest('[inert]'),
    ).toBeNull();
  });

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
    // The tips ride on the slot, so they go with it.
    expect(screen.queryByTestId('feedWidgetTip')).not.toBeInTheDocument();
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
    // The tip stays on top; the rest of the column is the add tile.
    expect(
      screen.getByRole('button', { name: 'Add another widget' }).parentElement,
    ).toBe(screen.getByTestId('feedWidgetTip').parentElement);
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

  it('lets a link through once a hold-to-edit session is over', async () => {
    mockHero();

    renderRail();
    await revealWidgets();
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    const [widget] = screen.getAllByTestId('feedWidget');

    jest.useFakeTimers();
    fireEvent.pointerDown(widget, { pointerType: 'touch', button: 0 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    jest.useRealTimers();
    // A long press ends without a click, so nothing clears the hold there.
    fireEvent.pointerUp(widget, { pointerType: 'touch' });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    const [link] = within(widget).getAllByRole('link');
    // The widget's capture handler stops a swallowed click before it reaches
    // the link itself.
    const onLinkClick = jest.fn();
    link.addEventListener('click', onLinkClick);
    fireEvent.click(link);
    expect(onLinkClick).toHaveBeenCalled();
  });

  it('applies a corner resize released away from the grip', async () => {
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
        ],
      },
    });
    await revealWidgets();
    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    // jsdom has no layout: give every element a Tall widget's box.
    const width = jest
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockReturnValue(300);
    const height = jest
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(406);

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    const [widget] = screen.getAllByTestId('feedWidget');
    const [grip] = widget.querySelectorAll('span[data-widget-control]');
    fireEvent.pointerDown(grip, { button: 0, clientX: 300, clientY: 406 });
    fireEvent.pointerMove(grip, { clientX: 700, clientY: 406 });
    // The release lands elsewhere: the grip never hears its own pointerup.
    fireEvent.pointerUp(window);

    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        feedWidgets: {
          version: 1,
          widgets: [
            {
              id: 'now',
              kind: FeedWidgetKind.HappeningNow,
              size: FeedWidgetSize.Large,
            },
          ],
        },
      },
    });
    width.mockRestore();
    height.mockRestore();
  });

  it('puts a daily.dev tip over the ad, sharing its column', async () => {
    mockHero();

    renderRail();
    await revealWidgets();

    const tip = screen.getByTestId('feedWidgetTip');
    const slot = screen.getByTestId('feedWidgetAdSlot');
    expect(tip.parentElement).toBe(slot.parentElement);
    expect(tip.parentElement).toHaveStyle({ gridColumn: '3 / span 1' });
    const shown = feedWidgetTips.find(
      ({ id }) => id === tip.getAttribute('data-tip-id'),
    );
    expect(
      within(tip).getByRole('link', { name: `daily.dev tip: ${shown?.title}` }),
    ).toHaveAttribute('href', shown?.href);
    expect(within(tip).getByRole('link', { name: 'All tips' })).toHaveAttribute(
      'href',
      '/tips',
    );
    // The ad shrinks to what the tip leaves of the column.
    expect(within(slot).getByTestId('adItem')).toHaveClass('group/ad');
  });

  it('removes the tips from their badge in edit mode', async () => {
    mockHero();

    renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
    await revealWidgets();
    await waitFor(() =>
      expect(screen.getByText('First headline')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: 'Remove daily.dev tips' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove daily.dev tips' }),
    );

    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        feedWidgets: { version: 1, tipsHidden: true, widgets: twoWidgets },
      },
    });
  });

  it('keeps the pinned label off the tip in edit mode', async () => {
    mockHero();

    const { unmount } = renderRail({
      feedWidgets: { version: 1, widgets: twoWidgets },
    });
    await revealWidgets();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    // Inside the ad, below the strip, rather than on the slot's corner.
    expect(screen.getByText('Pinned by daily.dev')).toHaveClass('top-2');
    unmount();

    renderRail({
      feedWidgets: { version: 1, tipsHidden: true, widgets: twoWidgets },
    });
    await revealWidgets();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    expect(screen.getByText('Pinned by daily.dev')).toHaveClass('-top-2');
  });

  describe('bringing the tips back from the gallery', () => {
    const defaultWidgets = [
      {
        id: 'top-story',
        kind: FeedWidgetKind.TopStory,
        size: FeedWidgetSize.Large,
      },
    ];

    const openGallery = async () => {
      await revealWidgets();
      fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
      // The header's, which edit mode adds whether or not the tile shows.
      fireEvent.click(
        screen.getAllByRole('button', { name: 'Add a widget' })[0],
      );
      // The gallery's code loads on demand.
      await screen.findByRole('dialog');
    };

    it('offers them while hidden and stores nothing for a rail on the default', async () => {
      mockHero();
      renderRail({
        feedWidgets: {
          version: 1,
          tipsHidden: true,
          widgets: defaultWidgets,
          fromDefault: feedRailFingerprint(defaultWidgets),
        },
      });
      await openGallery();

      fireEvent.click(
        screen.getByRole('button', { name: 'Add daily.dev tips' }),
      );

      expect(setSettings).toHaveBeenCalledWith({
        flags: { feedWidgets: null },
      });
    });

    it('clears the field on a customized rail, keeping its widgets', async () => {
      mockHero();
      renderRail({
        feedWidgets: { version: 1, tipsHidden: true, widgets: twoWidgets },
      });
      await openGallery();

      fireEvent.click(
        screen.getByRole('button', { name: 'Add daily.dev tips' }),
      );

      expect(setSettings).toHaveBeenCalledWith({
        flags: { feedWidgets: { version: 1, widgets: twoWidgets } },
      });
    });

    it('does not offer them while they show', async () => {
      mockHero();
      renderRail({ feedWidgets: { version: 1, widgets: twoWidgets } });
      await openGallery();

      expect(
        screen.queryByRole('button', { name: 'Add daily.dev tips' }),
      ).not.toBeInTheDocument();
    });
  });

  it('gives the ad its whole column once the tips are removed', async () => {
    mockHero();

    renderRail({
      feedWidgets: { version: 1, tipsHidden: true, widgets: twoWidgets },
    });
    await revealWidgets();

    expect(screen.queryByTestId('feedWidgetTip')).not.toBeInTheDocument();
    const slot = screen.getByTestId('feedWidgetAdSlot');
    expect(within(slot).getByTestId('adItem')).not.toHaveClass('group/ad');
  });
});
