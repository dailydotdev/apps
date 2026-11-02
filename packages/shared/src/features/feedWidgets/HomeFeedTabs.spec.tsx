import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop, mockMatchMedia } from '../../../__tests__/helpers/media';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { SharedFeedPage } from '../../components/utilities/common';
import { HomeFeedTabs } from './HomeFeedTabs';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../components/buttons/ToggleClickbaitShield', () => ({
  ToggleClickbaitShield: ({
    buttonProps,
  }: {
    buttonProps: { size: string; variant: string };
  }) => (
    <button
      type="button"
      aria-label="Clickbait Shield"
      data-size={buttonProps.size}
      data-variant={buttonProps.variant}
    />
  ),
}));

jest.mock('../../components/filters/AchievementTrackerButton', () => ({
  AchievementTrackerButton: ({ quiet }: { quiet?: boolean }) =>
    quiet ? <button type="button" aria-label="Track an achievement" /> : null,
}));

jest.mock('../../components/filters/LuckyButton', () => ({
  LuckyButton: () => null,
}));

jest.mock('../feedExplain/useFeedExplainMode', () => ({
  useFeedExplainMode: () => ({
    isAvailable: true,
    isOffered: true,
    isExplaining: false,
    version: 116,
    setIsExplaining: jest.fn(),
  }),
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

const renderTabs = ({
  sortingEnabled = true,
  feedName = SharedFeedPage.MyFeed,
  heading = 'For you',
  user = loggedUser,
}: {
  sortingEnabled?: boolean;
  feedName?: SharedFeedPage;
  heading?: string;
  user?: LoggedUser;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user }}
      settings={{ sortingEnabled }}
    >
      <HomeFeedTabs
        feedName={feedName}
        heading={heading}
        hasChips
        categories={[]}
        isChipsPending={false}
      />
    </TestBootProvider>,
  );

const mockTablet = () =>
  mockMatchMedia((query) => {
    const [, min] = /min-width:\s*(\d+)px/.exec(query) ?? [];

    return !!min && Number(min) <= 768;
  });

const mockPath = (pathname: string) =>
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname,
        asPath: pathname,
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        events: { on: jest.fn(), off: jest.fn() },
      } as unknown as NextRouter),
  );

const openMenu = (name: string | RegExp) =>
  fireEvent.pointerDown(screen.getByRole('button', { name }), {
    button: 0,
    pointerType: 'mouse',
  });

const expectQuietActionsInOrder = () => {
  const achievements = screen.getByRole('button', {
    name: 'Track an achievement',
  });
  const shield = screen.getByRole('button', { name: 'Clickbait Shield' });
  const debug = screen.getByRole('button', { name: 'Debug' });
  const feedSettings = screen.getByRole('button', { name: 'Feed settings' });
  const actions = Array.from(
    (feedSettings.closest('.shrink-0') as HTMLElement).querySelectorAll(
      'button',
    ),
  );

  expect(actions).toEqual([achievements, shield, debug, feedSettings]);
  expect(shield).toHaveAttribute('data-size', 'small');
  expect(shield).toHaveAttribute('data-variant', 'tertiary');
  expect(debug).toHaveClass('btn-tertiary-cabbage', 'h-8');
  expect(feedSettings).toHaveClass('btn-tertiary', 'h-8');
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
        asPath: '/',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        events: { on: jest.fn(), off: jest.fn() },
      } as unknown as NextRouter),
  );
});

describe('HomeFeedTabs', () => {
  describe('from laptop up', () => {
    beforeEach(() => mockDesktop());

    it('opens the sort from the lit For you tab and shows a non-default one on it', async () => {
      renderTabs();

      openMenu(/^For you/);
      expect(
        await screen.findByRole('menuitemradio', { name: 'Recommended' }),
      ).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(screen.getByRole('menuitemradio', { name: 'By date' }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /^For you/ }),
        ).toHaveTextContent('For you· By date'),
      );
    });

    it('keeps For you a link for readers who have sorting off', () => {
      renderTabs({ sortingEnabled: false });

      expect(screen.getByRole('link', { name: 'For you' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('labels Feed settings beside the shield', () => {
      renderTabs();

      expect(
        screen.getByRole('button', { name: 'Clickbait Shield' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Feed settings' }),
      ).toHaveTextContent('Feed settings');
    });

    it('orders achievements, the shield, Debug, then Feed settings, all Tertiary Small', () => {
      renderTabs();

      expectQuietActionsInOrder();
      expect(screen.getByRole('button', { name: 'Debug' })).toHaveTextContent(
        'Debug',
      );
    });
  });

  describe('on tablets', () => {
    beforeEach(() => mockTablet());

    it('orders achievements, the shield, an icon-only Debug, then an icon-only Feed settings, all Tertiary Small', () => {
      renderTabs();

      expectQuietActionsInOrder();
      expect(
        screen.getByRole('button', { name: 'Debug' }),
      ).not.toHaveTextContent('Debug');
      expect(
        screen.getByRole('button', { name: 'Feed settings' }),
      ).not.toHaveTextContent('Feed settings');
    });

    it('keeps the sort on Popular, where no chip is lit', async () => {
      mockPath('/popular');
      renderTabs({ feedName: SharedFeedPage.Popular, heading: 'Popular' });

      openMenu('Sort');

      expect(
        await screen.findByRole('menuitemradio', { name: 'Recommended' }),
      ).toHaveAttribute('aria-checked', 'true');
      expect(
        screen.getByRole('menuitemradio', { name: 'By date' }),
      ).toBeInTheDocument();
    });
  });

  describe('on phones', () => {
    beforeEach(() => mockMatchMedia());

    it('opens a sheet with the sort and Feed settings from For you', async () => {
      renderTabs();

      fireEvent.click(
        await screen.findByRole('button', {
          name: 'For you, sort and feed settings',
        }),
      );

      expect(await screen.findByText('Sort')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Recommended' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: 'By date' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Feed settings/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Clickbait Shield' }),
      ).not.toBeInTheDocument();
    });

    it('keeps the sort on Popular, where no segment is lit', async () => {
      mockPath('/popular');
      renderTabs({ feedName: SharedFeedPage.Popular, heading: 'Popular' });

      fireEvent.click(
        screen.getByRole('button', { name: 'Sort and feed settings' }),
      );

      expect(
        await screen.findByRole('button', { name: 'By date' }),
      ).toBeInTheDocument();
    });

    it('keeps For you a link and Feed settings in the bar on a custom default feed', () => {
      renderTabs({
        feedName: SharedFeedPage.Custom,
        heading: 'Mine',
        user: { ...loggedUser, defaultFeedId: 'f1' },
      });

      expect(screen.getByRole('link', { name: 'For you' })).toHaveAttribute(
        'href',
        expect.stringMatching(/\/my-feed$/),
      );
      expect(
        screen.queryByRole('button', { name: /sort and feed settings/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Feed settings' }),
      ).toBeInTheDocument();
    });

    it('takes the collapsed row out of reach while its copy is docked', () => {
      const observers = new Map<Element, IntersectionObserverCallback>();
      const Observer = jest.mocked(IntersectionObserver);
      const original = Observer.getMockImplementation();
      Observer.mockImplementation(
        (callback) =>
          ({
            observe: (element: Element) => observers.set(element, callback),
            unobserve: jest.fn(),
            disconnect: jest.fn(),
          } as unknown as IntersectionObserver),
      );

      try {
        renderTabs();
        const row = screen.getByTestId('home-feed-tabs-row');
        const passed = (isIntersecting: boolean) =>
          act(() =>
            observers.get(row)?.(
              [
                {
                  isIntersecting,
                  boundingClientRect: { top: isIntersecting ? 10 : -10 },
                } as IntersectionObserverEntry,
              ],
              {} as IntersectionObserver,
            ),
          );

        expect(row.inert).toBe(false);
        passed(true);
        expect(row.inert).toBe(false);
        passed(false);
        expect(row.inert).toBe(true);
        passed(true);
        expect(row.inert).toBe(false);
      } finally {
        Observer.mockImplementation(original);
      }
    });
  });
});
