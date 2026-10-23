import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { LogEvent } from '../../lib/log';
import { ActionType } from '../../graphql/actions';
import {
  SIDEBAR_TOUR_EXISTING_USER_CUTOFF,
  useSidebarTourState,
} from './useSidebarTourState';

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: () => true,
}));

// The seen-flag is a user action now. Stateful, so `checkHasCompleted` answers
// the write the hook just made the way the real cache would.
const mockCompletedActions: ActionType[] = [];
let mockShouldFailAction = false;
const mockCompleteAction = jest.fn((type: ActionType) => {
  if (mockShouldFailAction) {
    return Promise.reject(new Error('actions unavailable'));
  }

  mockCompletedActions.push(type);
  return Promise.resolve();
});

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    actions: [],
    completeAction: mockCompleteAction,
    checkHasCompleted: (type: ActionType) =>
      mockCompletedActions.includes(type),
    isActionsFetched: true,
  }),
}));

// The hardcoded sidebar tour cutoff, and an account either side of it.
const dayFromCutoff = (days: number): string =>
  new Date(
    SIDEBAR_TOUR_EXISTING_USER_CUTOFF + days * 24 * 60 * 60 * 1000,
  ).toISOString();

const existingUser: LoggedUser = {
  ...defaultUser,
  createdAt: dayFromCutoff(-1),
};

const newUser: LoggedUser = {
  ...defaultUser,
  createdAt: dayFromCutoff(1),
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
}

const renderTour = ({ user = existingUser }: RenderOptions = {}) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider
      client={new QueryClient()}
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
    mockCompletedActions.length = 0;
    mockShouldFailAction = false;
    unmountRail = mountRail();
  });

  afterEach(() => {
    unmountRail();
  });

  it('offers the tour to an existing user who has not seen it', async () => {
    const { result } = await renderEnabledTour();

    expect(result.current.canAutoStart).toBe(true);
  });

  it('scopes what it remembers to the account that learned it', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.finish());

    await act(async () => undefined);

    // The tour's own flag is an action, so it is the account's without a key.
    expect(mockCompleteAction).toHaveBeenCalledWith(ActionType.SidebarTourSeen);
  });

  it('never starts the tour on its own for a user who joined after the rollout', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    expect(result.current.canAutoStart).toBe(false);
    expect(result.current.isNewUser).toBe(true);
  });

  it('still lets a new user open the tour from the support menu, in their own words', async () => {
    const { result } = await renderEnabledTour({ user: newUser });

    act(() => result.current.start('support_menu'));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isNewUser).toBe(true);
  });

  it('shows nothing to a logged out visitor', async () => {
    const { result } = renderTour({ user: null });

    await waitFor(() => expect(result.current.isEnabled).toBe(false));
    expect(result.current.canAutoStart).toBe(false);
  });

  it('runs every step whose target is on the rail', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));

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

    act(() => result.current.start('hover'));

    expect(result.current.stepCount).toBe(2);
    expect(result.current.step?.id).toBe('rail');

    act(() => result.current.next());
    expect(result.current.step?.id).toBe('dock');
  });

  it('persists the seen flag when the tour is finished', async () => {
    const { result, rerender } = await renderEnabledTour();

    act(() => result.current.start('hover'));
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

    act(() => result.current.start('hover'));
    act(() => result.current.skip());

    await waitFor(() => expect(result.current.canAutoStart).toBe(false));

    rerender();

    expect(result.current.isRunning).toBe(false);
    expect(result.current.canAutoStart).toBe(false);
  });

  it('leaves the seen flag alone when something else takes the screen', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.interrupt('modal'));

    expect(result.current.isRunning).toBe(false);
    expect(mockCompleteAction).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.EndSidebarTour,
        extra: JSON.stringify({ step: 'rail', reason: 'modal' }),
      }),
    );
    expect(eventsNamed(LogEvent.SkipSidebarTour)).toHaveLength(0);
    expect(eventsNamed(LogEvent.CompleteSidebarTour)).toHaveLength(0);
  });

  it('remembers the tour as seen from the first Next', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.next());
    act(() => result.current.interrupt('navigation'));

    await act(async () => undefined);

    expect(mockCompleteAction).toHaveBeenCalledWith(ActionType.SidebarTourSeen);

    const { result: reloaded } = await renderEnabledTour();

    expect(reloaded.current.canAutoStart).toBe(false);
  });

  it('keeps the hover start down for the rest of an interrupted session', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.interrupt('navigation'));

    expect(result.current.canAutoStart).toBe(false);
  });

  it('offers the tour again on a later load after an interruption', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.interrupt('modal'));

    const { result: reloaded } = await renderEnabledTour();

    await waitFor(() => expect(reloaded.current.canAutoStart).toBe(true));
  });

  it('moves on to the next step when one loses its target', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.dropStep());

    expect(result.current.step?.id).toBe('dock');
    expect(eventsNamed(LogEvent.EndSidebarTour)).toHaveLength(0);
  });

  it('retires the tour on a lost last step without claiming it was completed', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.step?.id).toBe('gameCenter');

    act(() => result.current.dropStep());

    await waitFor(() => expect(result.current.canAutoStart).toBe(false));
    expect(result.current.isRunning).toBe(false);
    expect(mockCompleteAction).toHaveBeenCalledWith(ActionType.SidebarTourSeen);
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

    act(() => result.current.start('hover'));
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

  it('restarts from the first step when start is called while the tour runs', async () => {
    const { result } = await renderEnabledTour();

    act(() => result.current.start('hover'));
    act(() => result.current.next());
    expect(result.current.step?.id).toBe('dock');

    act(() => result.current.start('support_menu'));

    expect(result.current.step?.id).toBe('rail');
    expect(eventsNamed(LogEvent.StartSidebarTour)).toHaveLength(2);
  });

  it('drops a parked run when the user stops being eligible mid-tour', async () => {
    let user: LoggedUser | null = existingUser;
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestBootProvider
        client={client}
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

    act(() => result.current.start('hover'));
    expect(result.current.isRunning).toBe(true);

    user = null;
    rerender();

    await waitFor(() => expect(result.current.stepCount).toBe(0));
    expect(result.current.isRunning).toBe(false);
    // The user never acted on the tour, so nothing about it was learned.
    expect(mockCompleteAction).not.toHaveBeenCalled();
  });

  it('stays gone for the session when the seen flag fails to persist', async () => {
    const { result } = await renderEnabledTour();
    mockShouldFailAction = true;

    act(() => result.current.start('hover'));
    act(() => result.current.skip());

    await act(async () => undefined);

    expect(result.current.isRunning).toBe(false);
    expect(result.current.canAutoStart).toBe(false);
  });
});
