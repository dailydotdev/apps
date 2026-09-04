import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { featureSidebarTour } from '../../lib/featureManagement';
import { LogEvent } from '../../lib/log';
import {
  COACH_MAX_EXPOSURES,
  SIDEBAR_PIN_COACH_KEY,
  SIDEBAR_TOUR_SEEN_KEY,
  SIDEBAR_V2_ROLLOUT_DATE,
  useSidebarTourState,
} from './useSidebarTourState';

jest.mock('../../hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: () => ({ isV2: true, isLoading: false }),
}));

const mockStorageWrites: Array<[string, unknown]> = [];
let mockShouldFailWrites = false;

jest.mock('idb-keyval', () => {
  const actual = jest.requireActual('idb-keyval');

  return {
    ...actual,
    set: (key: string, value: unknown) => {
      mockStorageWrites.push([key, value]);

      if (mockShouldFailWrites) {
        return Promise.reject(new Error('storage unavailable'));
      }

      return actual.set(key, value);
    },
  };
});

const writesTo = (key: string): unknown[] =>
  mockStorageWrites
    .filter(([written]) => written === key)
    .map(([, value]) => value);

const existingUser: LoggedUser = {
  ...defaultUser,
  createdAt: new Date(
    SIDEBAR_V2_ROLLOUT_DATE.getTime() - 1000 * 60 * 60 * 24,
  ).toISOString(),
};

const newUser: LoggedUser = {
  ...defaultUser,
  createdAt: new Date(
    SIDEBAR_V2_ROLLOUT_DATE.getTime() + 1000 * 60 * 60 * 24,
  ).toISOString(),
};

const logEvent = jest.fn();

const eventsNamed = (name: LogEvent): unknown[] =>
  logEvent.mock.calls.filter(([event]) => event.event_name === name);

// The tour resolves its targets from the live rail, so the specs stand up the
// three nodes it looks for rather than faking coordinates.
const mountRail = () => {
  const rail = document.createElement('div');
  rail.innerHTML = `
    <div role="tablist" aria-label="Sidebar categories"></div>
    <button type="button" aria-label="Customize shortcuts"></button>
    <button type="button" id="sidebar-category-gameCenter"></button>
  `;
  document.body.appendChild(rail);
  return () => rail.remove();
};

interface RenderOptions {
  user?: LoggedUser | null;
  isFeatureEnabled?: boolean;
}

const renderTour = ({
  user = existingUser,
  isFeatureEnabled = true,
}: RenderOptions = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSidebarTour.id]: { defaultValue: isFeatureEnabled },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider
      client={new QueryClient()}
      gb={gb}
      log={{ logEvent }}
      auth={{ user: user ?? undefined, isLoggedIn: !!user }}
    >
      {children}
    </TestBootProvider>
  );

  return renderHook(() => useSidebarTourState(), { wrapper });
};

const renderEnabledTour = async (options: RenderOptions = {}) => {
  const view = renderTour(options);
  await waitFor(() => expect(view.result.current.isEnabled).toBe(true));
  return view;
};

describe('useSidebarTourState', () => {
  let unmountRail: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageWrites.length = 0;
    mockShouldFailWrites = false;
    unmountRail = mountRail();
  });

  afterEach(() => {
    unmountRail();
  });

  it('offers the tour to an existing user who has not seen it', async () => {
    const { result } = await renderEnabledTour();

    expect(result.current.canAutoStart).toBe(true);
  });

  it('does not offer the tour to a user who joined after the rollout', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    expect(result.current.canAutoStart).toBe(false);
  });

  it('shows nothing to a logged out visitor', async () => {
    const { result } = renderTour({ user: null });

    await waitFor(() => expect(result.current.isEnabled).toBe(false));
    expect(result.current.canAutoStart).toBe(false);
  });

  it('shows nothing while the feature flag is off', async () => {
    const { result } = renderTour({ isFeatureEnabled: false });

    await waitFor(() => expect(result.current.isEnabled).toBe(false));
    expect(result.current.canAutoStart).toBe(false);

    act(() => result.current.start('auto'));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.step).toBeNull();
  });

  it('runs every step whose target is on the rail', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));

    expect(result.current.stepCount).toBe(3);
    expect(result.current.step?.id).toBe('rail');

    act(() => result.current.next());
    expect(result.current.step?.id).toBe('dock');

    act(() => result.current.next());
    expect(result.current.step?.id).toBe('gameCenter');
  });

  it('skips a step whose target is missing', async () => {
    document.getElementById('sidebar-category-gameCenter')?.remove();
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));

    expect(result.current.stepCount).toBe(2);
    expect(result.current.step?.id).toBe('rail');

    act(() => result.current.next());
    expect(result.current.step?.id).toBe('dock');
  });

  it('persists the seen flag when the tour is finished', async () => {
    const { result, rerender } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());

    await waitFor(() => expect(result.current.canAutoStart).toBe(false));
    expect(result.current.isRunning).toBe(false);

    rerender();

    expect(result.current.canAutoStart).toBe(false);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.CompleteSidebarTour }),
    );
  });

  it('persists the seen flag when the tour is skipped', async () => {
    const { result, rerender } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.skip());

    await waitFor(() => expect(result.current.canAutoStart).toBe(false));

    rerender();

    expect(result.current.isRunning).toBe(false);
    expect(result.current.canAutoStart).toBe(false);
  });

  it('leaves the seen flag alone when something else takes the screen', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.interrupt('modal'));

    expect(result.current.isRunning).toBe(false);
    expect(writesTo(SIDEBAR_TOUR_SEEN_KEY)).toEqual([]);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.EndSidebarTour,
        extra: JSON.stringify({ step: 'rail', reason: 'modal' }),
      }),
    );
    expect(eventsNamed(LogEvent.SkipSidebarTour)).toHaveLength(0);
    expect(eventsNamed(LogEvent.CompleteSidebarTour)).toHaveLength(0);
  });

  it('keeps the auto-start timer down for the rest of an interrupted session', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.interrupt('navigation'));

    expect(result.current.canAutoStart).toBe(false);
  });

  it('offers the tour again on a later load after an interruption', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.interrupt('popup'));

    const { result: reloaded } = await renderEnabledTour();

    await waitFor(() => expect(reloaded.current.canAutoStart).toBe(true));
  });

  it('moves on to the next step when one loses its target', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.dropStep());

    expect(result.current.step?.id).toBe('dock');
    expect(eventsNamed(LogEvent.EndSidebarTour)).toHaveLength(0);
  });

  it('retires the tour on a lost last step without claiming it was completed', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.step?.id).toBe('gameCenter');

    act(() => result.current.dropStep());

    await waitFor(() => expect(result.current.canAutoStart).toBe(false));
    expect(result.current.isRunning).toBe(false);
    expect(writesTo(SIDEBAR_TOUR_SEEN_KEY)).toEqual([true]);
    expect(eventsNamed(LogEvent.CompleteSidebarTour)).toHaveLength(0);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.EndSidebarTour,
        extra: JSON.stringify({ step: 'gameCenter', reason: 'target_lost' }),
      }),
    );
  });

  it('restarts from the support menu after the tour was skipped', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.skip());
    await waitFor(() => expect(result.current.canAutoStart).toBe(false));

    act(() => result.current.start('support_menu'));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.step?.id).toBe('rail');
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.StartSidebarTour,
        extra: JSON.stringify({ trigger: 'support_menu' }),
      }),
    );
  });

  it('retires the pin coach after three exposures', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    expect(result.current.pinCoach.isActive).toBe(true);

    for (let index = 0; index < COACH_MAX_EXPOSURES; index += 1) {
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await act(async () => {
        result.current.pinCoach.onShown();
      });
    }

    await waitFor(() => expect(result.current.pinCoach.isActive).toBe(false));
  });

  it('reports the pin coach as shown only once an exposure is counted', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    expect(result.current.pinCoach.hasBeenShown).toBe(false);

    await act(async () => {
      result.current.pinCoach.onShown();
    });

    await waitFor(() =>
      expect(result.current.pinCoach.hasBeenShown).toBe(true),
    );
  });

  it('retires the pin coach on the first pin', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    await act(async () => {
      result.current.pinCoach.onSuccess('drag');
    });

    await waitFor(() => expect(result.current.pinCoach.isActive).toBe(false));
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SidebarPinCoachSuccess,
        extra: JSON.stringify({ method: 'drag' }),
      }),
    );
  });

  it('retires the ••• coach once the tray is opened', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    expect(result.current.dotsCoach.isActive).toBe(true);

    await act(async () => {
      result.current.dotsCoach.onRetire();
    });

    await waitFor(() => expect(result.current.dotsCoach.isActive).toBe(false));
  });

  it('restarts from the first step when start is called while the tour runs', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));
    act(() => result.current.next());
    expect(result.current.step?.id).toBe('dock');

    act(() => result.current.start('support_menu'));

    expect(result.current.step?.id).toBe('rail');
    expect(eventsNamed(LogEvent.StartSidebarTour)).toHaveLength(2);
  });

  it('drops a parked run when the user stops being eligible mid-tour', async () => {
    let user: LoggedUser | null = existingUser;
    const gb = new GrowthBook();
    gb.setFeatures({ [featureSidebarTour.id]: { defaultValue: true } });
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestBootProvider
        client={client}
        gb={gb}
        log={{ logEvent }}
        auth={{ user: user ?? undefined, isLoggedIn: !!user }}
      >
        {children}
      </TestBootProvider>
    );

    const { result, rerender } = renderHook(() => useSidebarTourState(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isEnabled).toBe(true));

    act(() => result.current.start('auto'));
    expect(result.current.isRunning).toBe(true);

    user = null;
    rerender();

    await waitFor(() => expect(result.current.stepCount).toBe(0));
    expect(result.current.isRunning).toBe(false);
    // The user never acted on the tour, so nothing about it was learned.
    expect(writesTo(SIDEBAR_TOUR_SEEN_KEY)).toEqual([]);
  });

  it('stays gone for the session when the seen flag fails to persist', async () => {
    const { result } = await renderEnabledTour();
    mockShouldFailWrites = true;

    act(() => result.current.start('auto'));
    act(() => result.current.skip());

    await act(async () => undefined);

    expect(result.current.isRunning).toBe(false);
    expect(result.current.canAutoStart).toBe(false);
  });

  it('counts both exposures when they land before storage answers', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    await act(async () => {
      result.current.pinCoach.onShown();
      result.current.pinCoach.onShown();
    });

    expect(writesTo(SIDEBAR_PIN_COACH_KEY)).toEqual([1, 2]);
  });

  it('keeps the ambient coaches away from users who get the tour', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('auto'));

    expect(result.current.pinCoach.isActive).toBe(false);
    expect(result.current.dotsCoach.isActive).toBe(false);
  });
});
