import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { AuthContextData } from './AuthContext';
import AuthContext from './AuthContext';
import { SettingsContextProvider, useSettingsContext } from './SettingsContext';
import type { RemoteSettings } from '../graphql/settings';
import { UPDATE_USER_SETTINGS_MUTATION } from '../graphql/settings';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import loggedUser from '../../__tests__/fixture/loggedUser';

const SidebarState = () => {
  const { sidebarExpanded, setSidebarForceCollapsed, toggleSidebarExpanded } =
    useSettingsContext();

  return (
    <>
      <span>{sidebarExpanded ? 'expanded' : 'collapsed'}</span>
      <button type="button" onClick={() => setSidebarForceCollapsed(true)}>
        force
      </button>
      <button type="button" onClick={toggleSidebarExpanded}>
        toggle
      </button>
    </>
  );
};

it('should collapse the sidebar for the page without writing the stored preference', async () => {
  const updateSettings = jest.fn();
  render(
    <QueryClientProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
    >
      <AuthContext.Provider value={{} as AuthContextData}>
        <SettingsContextProvider
          settings={
            { theme: 'darcula', sidebarExpanded: true } as RemoteSettings
          }
          updateSettings={updateSettings}
          loadedSettings
          isRemoteSettingsLoaded
        >
          <SidebarState />
        </SettingsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByText('force'));
  expect(screen.getByText('collapsed')).toBeInTheDocument();

  await act(async () => fireEvent.click(screen.getByText('toggle')));
  expect(screen.getByText('expanded')).toBeInTheDocument();
  expect(updateSettings).not.toHaveBeenCalled();
});

const StreakFreezeToggle = () => {
  const { toggleOptOutStreakFreeze } = useSettingsContext();

  return (
    <button type="button" onClick={toggleOptOutStreakFreeze}>
      freeze
    </button>
  );
};

it('should only send the settings that changed', async () => {
  // A tab holding older settings (gamification still on) must not write them
  // back when the user changes something unrelated.
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_SETTINGS_MUTATION,
      variables: { data: { optOutStreakFreeze: true } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
    },
  });

  render(
    <QueryClientProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
    >
      <AuthContext.Provider value={{ user: loggedUser } as AuthContextData}>
        <SettingsContextProvider
          settings={
            {
              theme: 'darcula',
              optOutReadingStreak: false,
              optOutLevelSystem: false,
              optOutQuestSystem: false,
              optOutAchievements: false,
              optOutStreakFreeze: false,
              customLinks: ['https://daily.dev'],
              flags: { sidebarCompact: true },
            } as RemoteSettings
          }
          updateSettings={jest.fn()}
          loadedSettings
          isRemoteSettingsLoaded
        >
          <StreakFreezeToggle />
        </SettingsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  await act(async () => fireEvent.click(screen.getByText('freeze')));
  await waitFor(() => expect(mutationCalled).toBe(true));
});

const StreakGoalButtons = () => {
  const { updateStreakGoal } = useSettingsContext();

  return (
    <>
      <button type="button" onClick={() => updateStreakGoal(14)}>
        set goal
      </button>
      <button type="button" onClick={() => updateStreakGoal(null)}>
        clear goal
      </button>
    </>
  );
};

it('should save and clear the streak goal', async () => {
  const sent: unknown[] = [];
  const mockGoalMutation = (streakGoal: number | null) =>
    mockGraphQL({
      request: {
        query: UPDATE_USER_SETTINGS_MUTATION,
        variables: { data: { streakGoal } },
      },
      result: () => {
        sent.push(streakGoal);
        return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
      },
    });
  const updateSettings = jest.fn();
  const renderGoal = (streakGoal: RemoteSettings['streakGoal']) =>
    render(
      <QueryClientProvider
        client={new QueryClient(defaultQueryClientTestingConfig)}
      >
        <AuthContext.Provider value={{ user: loggedUser } as AuthContextData}>
          <SettingsContextProvider
            settings={{ theme: 'darcula', streakGoal } as RemoteSettings}
            updateSettings={updateSettings}
            loadedSettings
            isRemoteSettingsLoaded
          >
            <StreakGoalButtons />
          </SettingsContextProvider>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );

  mockGoalMutation(14);
  const { unmount } = renderGoal(null);
  await act(async () => fireEvent.click(screen.getByText('set goal')));
  await waitFor(() => expect(sent).toEqual([14]));
  expect(updateSettings).toHaveBeenCalledWith(
    expect.objectContaining({ streakGoal: 14 }),
  );
  unmount();

  mockGoalMutation(null);
  renderGoal(14);
  await act(async () => fireEvent.click(screen.getByText('clear goal')));
  await waitFor(() => expect(sent).toEqual([14, null]));
});
