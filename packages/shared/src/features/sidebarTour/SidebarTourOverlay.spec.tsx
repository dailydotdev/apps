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
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { featureSidebarTour } from '../../lib/featureManagement';
import { LogEvent } from '../../lib/log';
import { SpotlightProvider } from '../../components/spotlight/SpotlightContext';
import { SidebarDesktopV2 } from '../../components/sidebar/SidebarDesktopV2';
import { MODAL_KEY } from '../../hooks/useLazyModal';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LazyModal } from '../../components/modals/common/types';

jest.mock('../../hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: () => ({ isV2: true, isLoading: false }),
}));

const existingUser: LoggedUser = {
  ...defaultUser,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const updateFlag = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
// The rail navigates from above the scrim, so the tour has to hear the route
// change; the global router mock carries no event emitter.
const routeHandlers = new Map<
  string,
  (url?: string, shallow?: boolean) => void
>();
// The one class the tour adds to the rail itself, lifting it over the scrim.
const RAIL_TOUR_LIFT_CLASS = 'laptop:!z-tooltip';
// The tour auto-starts on a grace timer, so every assertion about it needs more
// than the default 1s waitFor budget.
const TOUR_TIMEOUT = 4000;

let client: QueryClient;

// Any modal the user could already have open when they land, other than the
// composer the rail itself opens.
const openModal = () =>
  act(() => {
    client.setQueryData(MODAL_KEY, { type: LazyModal.ReportPost });
  });

const renderRail = (
  isFeatureEnabled: boolean,
  isModalOpen = false,
): RenderResult => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSidebarTour.id]: { defaultValue: isFeatureEnabled },
  });
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
      gb={gb}
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

  describe('with the feature flag off', () => {
    it('leaves the rail exactly as it is today', async () => {
      renderRail(false);

      const aside = await screen.findByTestId('sidebar-aside');
      expect(aside).not.toHaveClass(RAIL_TOUR_LIFT_CLASS);

      // Give the auto-start timer more than its grace period to misfire.
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      expect(
        screen.queryByTestId('sidebar-tour-scrim'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Skip tour')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Support'));

      expect(screen.queryByText('Sidebar tutorial')).not.toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });
  });

  describe('with the feature flag on', () => {
    it('spotlights the rail and teaches compact mode on step one', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();

      const aside = screen.getByTestId('sidebar-aside');
      expect(aside).toHaveClass(RAIL_TOUR_LIFT_CLASS);

      // The rail ships compact, so the first press is the one that widens it.
      expect(screen.getByRole('checkbox')).toBeChecked();

      fireEvent.click(screen.getByText('Compact mode'));

      expect(updateFlag).toHaveBeenCalledWith('sidebarCompact', false);
    });

    it('ends the tour on skip and does not bring it back', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      fireEvent.click(screen.getByText('Skip tour'));

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      expect(
        screen.queryByTestId('sidebar-tour-scrim'),
      ).not.toBeInTheDocument();
    });

    it('ends the tour on Escape and logs the step it left from', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.SkipSidebarTour,
          extra: JSON.stringify({ step: 'rail' }),
        }),
      );
    });

    it('swallows a compact write that the settings mutation rejects', async () => {
      updateFlag.mockRejectedValueOnce(new Error('settings unavailable'));
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      fireEvent.click(screen.getByText('Compact mode'));
      await act(async () => undefined);

      expect(screen.getByTestId('sidebar-tour-scrim')).toBeInTheDocument();
    });

    it('drops a step whose target stops existing rather than stranding the scrim', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

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
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      const consumed = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      consumed.preventDefault();
      act(() => {
        window.dispatchEvent(consumed);
      });

      expect(screen.getByTestId('sidebar-tour-scrim')).toBeInTheDocument();
    });

    it('ends the tour when the rail navigates out from under it', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      act(() => routeHandlers.get('routeChangeStart')?.());

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );
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
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      // useNotificationParams replaces the URL on mount to strip its params,
      // useSquadNavigation strips its own query, and the feed's post modal
      // pushes shallow. None of them is the user reaching past the tour.
      act(() => routeHandlers.get('routeChangeStart')?.('/?notify=welcome'));
      act(() => routeHandlers.get('routeChangeStart')?.('/other', true));

      expect(screen.getByTestId('sidebar-tour-scrim')).toBeInTheDocument();
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.EndSidebarTour }),
      );
    });

    it('never starts on top of a modal that already owns the screen', async () => {
      renderRail(true, true);

      await screen.findByTestId('sidebar-aside');
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      expect(
        screen.queryByTestId('sidebar-tour-scrim'),
      ).not.toBeInTheDocument();
    });

    it('steps aside when a modal opens over a running tour', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      openModal();

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );
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

    it('announces the card as a labelled dialog and lands focus on the primary action', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      const card = screen.getByRole('dialog', { name: 'Sidebar tour' });
      expect(card).toHaveAttribute('aria-live', 'polite');
      await waitFor(() =>
        expect(screen.getByText('Next').closest('button')).toHaveFocus(),
      );
    });

    it('drops the compact switch once the tour leaves the rail step', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      expect(screen.getByText('Compact mode')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));

      await waitFor(() =>
        expect(screen.queryByText('Compact mode')).not.toBeInTheDocument(),
      );
      expect(screen.getByTestId('sidebar-tour-scrim')).toBeInTheDocument();
    });

    it('finishes on the last step behind a "Got it" button', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      fireEvent.click(screen.getByText('Next'));
      await screen.findByText('Next');
      fireEvent.click(screen.getByText('Next'));

      fireEvent.click(await screen.findByText('Got it'));

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.CompleteSidebarTour }),
      );
    });

    it('makes the rail inert so nothing opens or navigates under the card', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      // Hover would open a panel over the card and a click would navigate out
      // from under the tour; both are the user's own pointer, not a dismissal.
      const aside = screen.getByTestId('sidebar-aside');
      expect(aside).toHaveClass('pointer-events-none');
      // And the keyboard half: `inert` also takes the rail out of the tab
      // order, so tabbing off the card cannot land on a control the pointer
      // can no longer reach.
      expect(aside.inert).toBe(true);

      fireEvent.click(screen.getByText('Skip tour'));
      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );
      expect(aside.inert).toBe(false);
    });

    it('keeps focus inside the card when Tab reaches its last control', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      const card = screen.getByRole('dialog', { name: 'Sidebar tour' });
      const next = screen.getByText('Next').closest('button');
      next?.focus();

      // Tab off the card's last control wraps to its first rather than landing
      // on the page behind the scrim, which is what `aria-modal` promises.
      fireEvent.keyDown(window, { key: 'Tab' });

      expect(next).not.toHaveFocus();
      expect(card.contains(document.activeElement)).toBe(true);

      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

      expect(next).toHaveFocus();
    });

    it('renames the support entry and files it under Changelog', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      fireEvent.click(screen.getByText('Skip tour'));
      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );

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
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      // The rail step is a sentence about layout, not a gesture.
      expect(document.querySelector('video')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));
      await screen.findByText(/add one from the/);

      const demo = document.querySelector('video');
      expect(demo).toBeInTheDocument();
      expect(demo).toHaveAttribute('src', expect.stringContaining('720_'));
    });

    it('teaches the dock gesture rather than inviting it mid-run', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
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
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      fireEvent.click(screen.getByText('Skip tour'));
      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );

      fireEvent.click(screen.getByLabelText('Support'));
      fireEvent.click(screen.getByText('Sidebar tutorial'));

      await screen.findByTestId('sidebar-tour-scrim');
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();
    });
  });
});
