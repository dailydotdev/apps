import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop, mockMatchMedia } from '../../../__tests__/helpers/media';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { SharedFeedPage } from '../../components/utilities/common';
import { HomeFeedTabs } from './HomeFeedTabs';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../components/buttons/ToggleClickbaitShield', () => ({
  ToggleClickbaitShield: () => (
    <button type="button" aria-label="Clickbait Shield" />
  ),
}));

jest.mock('../../components/filters/AchievementTrackerButton', () => ({
  AchievementTrackerButton: () => null,
}));

jest.mock('../../components/filters/LuckyButton', () => ({
  LuckyButton: () => null,
}));

jest.mock('../../components/notifications/NotificationsBell', () => ({
  __esModule: true,
  default: () => null,
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

const renderTabs = ({ sortingEnabled = true } = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      settings={{ sortingEnabled }}
    >
      <HomeFeedTabs
        feedName={SharedFeedPage.MyFeed}
        heading="For you"
        hasChips
        categories={[]}
        isChipsPending={false}
      />
    </TestBootProvider>,
  );

const openMenu = (name: string | RegExp) =>
  fireEvent.pointerDown(screen.getByRole('button', { name }), {
    button: 0,
    pointerType: 'mouse',
  });

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
  });
});
