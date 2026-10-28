import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { LogEvent } from '../../lib/log';
import { SpotlightProvider } from '../../components/spotlight/SpotlightContext';
import { SidebarDesktopV2 } from '../../components/sidebar/SidebarDesktopV2';
import { MODAL_KEY } from '../../hooks/useLazyModal';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LazyModal } from '../../components/modals/common/types';

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: () => true,
}));

const existingUser: LoggedUser = {
  ...defaultUser,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const updateFlag = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
// The rail navigates while the tour runs, so the tour has to hear the route
// change; the global router mock carries no event emitter.
const routeHandlers = new Map<
  string,
  (url?: string, shallow?: boolean) => void
>();
// The tour starts on a hover-intent timer, so every assertion about it needs
// more than the default 1s waitFor budget.
const TOUR_TIMEOUT = 4000;

const queryTourCard = () =>
  screen.queryByRole('dialog', { name: 'Sidebar tour' });

// The tour starts once the pointer rests on the rail. Re-entered until it
// starts, because the seen flag may still be loading on the first entry.
const startTourByHover = async () => {
  const aside = await screen.findByTestId('sidebar-aside');

  for (let attempt = 0; attempt < 10 && !queryTourCard(); attempt += 1) {
    fireEvent.mouseEnter(aside);
    // eslint-disable-next-line no-await-in-loop
    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 400);
        }),
    );
  }

  expect(queryTourCard()).toBeInTheDocument();
};

const waitForTourToEnd = () =>
  waitFor(() => expect(queryTourCard()).not.toBeInTheDocument());

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });

let client: QueryClient;

// Any modal the user could already have open when they land, other than the
// composer the rail itself opens.
const openModal = () =>
  act(() => {
    client.setQueryData(MODAL_KEY, { type: LazyModal.ReportPost });
  });

const renderRail = (isModalOpen = false): RenderResult => {
  client = new QueryClient();
  // The tour waits for the seen-flag to have loaded, and that now rides
  // `useActions`. Seeded rather than mocked so the real hook is exercised.
  client.setQueryData(generateQueryKey(RequestKey.Actions, existingUser), {
    actions: [],
    serverLoaded: true,
  });

  if (isModalOpen) {
    client.setQueryData(MODAL_KEY, { type: LazyModal.ReportPost });
  }

  return render(
    <TestBootProvider
      client={client}
      auth={{ user: existingUser, isLoggedIn: true }}
      settings={{ updateFlag }}
      log={{ logEvent }}
    >
      <SpotlightProvider>
        <SidebarDesktopV2 activePage="/" />
      </SpotlightProvider>
    </TestBootProvider>,
  );
};

describe('sidebar tour wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routeHandlers.clear();
    jest.mocked(useRouter).mockReturnValue({
      query: {},
      pathname: '/',
      asPath: '/',
      push: jest.fn(),
      events: {
        on: (
          event: string,
          handler: (url?: string, options?: { shallow?: boolean }) => void,
        ) =>
          routeHandlers.set(event, (url?: string, shallow?: boolean) =>
            handler(url, { shallow }),
          ),
        off: (event: string) => routeHandlers.delete(event),
        emit: jest.fn(),
      },
    } as unknown as NextRouter);
  });

  describe('when the user is eligible for the tour', () => {
    it('spotlights the rail and teaches compact mode on step one', async () => {
      renderRail();

      await startTourByHover();
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();

      // The rail ships compact, so the first press is the one that widens it.
      expect(screen.getByRole('checkbox')).toBeChecked();

      fireEvent.click(screen.getByText('Compact mode'));

      expect(updateFlag).toHaveBeenCalledWith('sidebarCompact', false);
    });

    it('waits for the pointer to rest on the rail before starting', async () => {
      renderRail();

      await settle();
      expect(queryTourCard()).not.toBeInTheDocument();

      // A pointer sweeping past the screen edge is not looking at the rail.
      const aside = screen.getByTestId('sidebar-aside');
      fireEvent.mouseEnter(aside);
      fireEvent.mouseLeave(aside);
      await settle();
      expect(queryTourCard()).not.toBeInTheDocument();

      await startTourByHover();
    });

    it('leaves the page around the card usable', async () => {
      renderRail();

      await startTourByHover();

      const card = screen.getByRole('dialog', { name: 'Sidebar tour' });
      expect(card).not.toHaveAttribute('aria-modal');
      expect(card).toHaveAttribute('aria-live', 'polite');
      // Started by a hover, so it must not pull focus away from the page.
      expect(screen.getByText('Next').closest('button')).not.toHaveFocus();
    });

    it('ends the tour on skip and does not bring it back', async () => {
      renderRail();

      await startTourByHover();

      fireEvent.click(screen.getByText('Skip tour'));

      await waitForTourToEnd();

      const aside = screen.getByTestId('sidebar-aside');
      fireEvent.mouseLeave(aside);
      fireEvent.mouseEnter(aside);
      await settle();

      expect(queryTourCard()).not.toBeInTheDocument();
    });

    it('ends the tour on Escape and logs the step it left from', async () => {
      renderRail();

      await startTourByHover();

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitForTourToEnd();
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.SkipSidebarTour,
          extra: JSON.stringify({ step: 'rail' }),
        }),
      );
    });

    it('swallows a compact write that the settings mutation rejects', async () => {
      updateFlag.mockRejectedValueOnce(new Error('settings unavailable'));
      renderRail();

      await startTourByHover();

      fireEvent.click(screen.getByText('Compact mode'));
      await act(async () => undefined);

      expect(queryTourCard()).toBeInTheDocument();
    });

    it('drops a step whose target stops existing rather than stranding the card', async () => {
      renderRail();

      await startTourByHover();

      // A narrower window refolds the rail and the tablist the step points at
      // is no longer resolvable, so the card has nothing to hang off.
      act(() => {
        document
          .querySelector('[role="tablist"][aria-label="Sidebar categories"]')
          ?.setAttribute('aria-label', 'folded away');
        window.dispatchEvent(new Event('resize'));
      });

      await screen.findByText(
        'Drag anything from the sidebar into the dock, or add one from the 3-dot menu.',
        undefined,
        { timeout: TOUR_TIMEOUT },
      );
    });

    it('leaves the tour alone when a modal already consumed Escape', async () => {
      renderRail();

      await startTourByHover();

      const consumed = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      consumed.preventDefault();
      act(() => {
        window.dispatchEvent(consumed);
      });

      expect(queryTourCard()).toBeInTheDocument();
    });

    it('ends the tour when the rail navigates out from under it', async () => {
      renderRail();

      await startTourByHover();

      act(() => routeHandlers.get('routeChangeStart')?.());

      await waitForTourToEnd();
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.EndSidebarTour,
          extra: JSON.stringify({ step: 'rail', reason: 'navigation' }),
        }),
      );
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.SkipSidebarTour }),
      );
    });

    it('ignores a rewrite of the URL the user is already on', async () => {
      renderRail();

      await startTourByHover();

      // useNotificationParams replaces the URL on mount to strip its params,
      // useSquadNavigation strips its own query, and the feed's post modal
      // pushes shallow. None of them is the user reaching past the tour.
      act(() => routeHandlers.get('routeChangeStart')?.('/?notify=welcome'));
      act(() => routeHandlers.get('routeChangeStart')?.('/other', true));

      expect(queryTourCard()).toBeInTheDocument();
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.EndSidebarTour }),
      );
    });

    it('never starts on top of a modal that already owns the screen', async () => {
      renderRail(true);

      fireEvent.mouseEnter(await screen.findByTestId('sidebar-aside'));
      await settle();

      expect(queryTourCard()).not.toBeInTheDocument();
    });

    it('steps aside when a modal opens over a running tour', async () => {
      renderRail();

      await startTourByHover();

      openModal();

      await waitForTourToEnd();
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.EndSidebarTour,
          extra: JSON.stringify({ step: 'rail', reason: 'modal' }),
        }),
      );
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.SkipSidebarTour }),
      );
    });

    it('drops the compact switch once the tour leaves the rail step', async () => {
      renderRail();

      await startTourByHover();
      expect(screen.getByText('Compact mode')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));

      await waitFor(() =>
        expect(screen.queryByText('Compact mode')).not.toBeInTheDocument(),
      );
      expect(queryTourCard()).toBeInTheDocument();
    });

    it('finishes on the last step behind a "Got it" button', async () => {
      renderRail();

      await startTourByHover();

      fireEvent.click(screen.getByText('Next'));
      await screen.findByText('Next');
      fireEvent.click(screen.getByText('Next'));

      fireEvent.click(await screen.findByText('Got it'));

      await waitForTourToEnd();
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.CompleteSidebarTour }),
      );
    });

    it('makes the rail inert so nothing opens or navigates under the card', async () => {
      renderRail();

      await startTourByHover();

      // Hover would open a panel over the card and a click would navigate out
      // from under the tour; both are the user's own pointer, not a dismissal.
      const aside = screen.getByTestId('sidebar-aside');
      expect(aside).toHaveClass('pointer-events-none');
      // And the keyboard half: `inert` also takes the rail out of the tab
      // order, so tabbing off the card cannot land on a control the pointer
      // can no longer reach.
      expect(aside.inert).toBe(true);

      fireEvent.click(screen.getByText('Skip tour'));
      await waitForTourToEnd();
      expect(aside.inert).toBe(false);
    });

    it('renames the support entry and files it under Changelog', async () => {
      renderRail();

      await startTourByHover();
      fireEvent.click(screen.getByText('Skip tour'));
      await waitForTourToEnd();

      fireEvent.click(screen.getByLabelText('Support'));

      const entries = await screen.findAllByText(
        /Changelog|Sidebar tutorial|Docs/,
      );
      expect(entries.map((entry) => entry.textContent)).toEqual([
        'Changelog',
        'Sidebar tutorial',
        'Docs',
      ]);
    });

    it('shows the drag demo on the dock step only', async () => {
      renderRail();

      await startTourByHover();
      // The rail step is a sentence about layout, not a gesture.
      expect(queryTourCard()?.querySelector('video')).toBeFalsy();

      fireEvent.click(screen.getByText('Next'));
      await screen.findByText(/add one from the/);

      const demo = queryTourCard()?.querySelector('video');
      expect(demo).toBeInTheDocument();
      expect(demo).toHaveAttribute('src', expect.stringContaining('720_'));
    });

    it('starts fetching the drag demo before the dock step', async () => {
      renderRail();

      await startTourByHover();

      const warmup = document.querySelector('video.hidden');
      expect(warmup).toHaveAttribute('preload', 'auto');
      expect(warmup).toHaveAttribute('src', expect.stringContaining('720_'));

      fireEvent.click(screen.getByText('Next'));
      await screen.findByText(/add one from the/);

      expect(document.querySelector('video.hidden')).not.toBeInTheDocument();
    });

    it('starts on a pointer already resting on the rail once a modal closes', async () => {
      renderRail(true);

      const aside = await screen.findByTestId('sidebar-aside');
      fireEvent.mouseEnter(aside);
      await settle();
      expect(queryTourCard()).not.toBeInTheDocument();

      act(() => {
        client.setQueryData(MODAL_KEY, null);
      });
      for (let attempt = 0; attempt < 10 && !queryTourCard(); attempt += 1) {
        fireEvent.mouseMove(aside);
        // eslint-disable-next-line no-await-in-loop
        await act(
          () =>
            new Promise((resolve) => {
              setTimeout(resolve, 400);
            }),
        );
      }

      expect(queryTourCard()).toBeInTheDocument();
    }, 10000);

    it('ignores Escape pressed in a field on the page', async () => {
      renderRail();

      await startTourByHover();

      const input = document.createElement('input');
      document.body.appendChild(input);
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(queryTourCard()).toBeInTheDocument();
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.SkipSidebarTour }),
      );
      input.remove();
    });

    it('teaches the dock gesture rather than inviting it mid-run', async () => {
      renderRail();

      await startTourByHover();
      fireEvent.click(screen.getByText('Next'));
      await screen.findByText(/add one from the/);

      // The step is teach-only, and this is why: the tray's trigger lives
      // inside the rail, which is inert for the whole run, so no browser lets
      // it be clicked or tabbed to. jsdom enforces neither `inert` nor
      // `pointer-events`, so a `fireEvent.click` here would pass while proving
      // nothing — the containment is what is worth asserting.
      const aside = screen.getByTestId('sidebar-aside');
      expect(aside.inert).toBe(true);
      expect(aside).toContainElement(
        screen.getByLabelText('Customize shortcuts'),
      );

      fireEvent.click(screen.getByText('Next'));
      expect(await screen.findByText('Got it')).toBeInTheDocument();
    });

    it('offers the tour again from the support menu', async () => {
      renderRail();

      await startTourByHover();
      fireEvent.click(screen.getByText('Skip tour'));
      await waitForTourToEnd();

      fireEvent.click(screen.getByLabelText('Support'));
      fireEvent.click(screen.getByText('Sidebar tutorial'));

      await screen.findByRole('dialog', { name: 'Sidebar tour' });
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();
      // The menu row that started it is gone and the rail is inert, so the
      // card's primary action takes focus for a keyboard user.
      await waitFor(() =>
        expect(screen.getByText('Next').closest('button')).toHaveFocus(),
      );
    });
  });
});
