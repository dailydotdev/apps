import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { AuthContextData } from './AuthContext';
import AuthContext from './AuthContext';
import { SettingsContextProvider, useSettingsContext } from './SettingsContext';
import type { RemoteSettings } from '../graphql/settings';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';

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
