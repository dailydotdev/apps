import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import type { SettingsContextData } from '../../contexts/SettingsContext';
import SettingsContext, { ThemeMode } from '../../contexts/SettingsContext';
import type { MockedGraphQLResponse } from '../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../../graphql/feedSettings';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import type { Alerts } from '../../graphql/alerts';
import { SidebarDesktop } from './SidebarDesktop';

let client: QueryClient;
const updateAlerts = jest.fn();
const toggleSidebarExpanded = jest.fn();

beforeEach(() => {
  nock.cleanAll();
});

const createMockFeedSettings = () => ({
  request: { query: FEED_SETTINGS_QUERY },
  result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
});

const defaultAlerts: Alerts = { filter: true };

const renderComponent = (
  alertsData = defaultAlerts,
  mocks: MockedGraphQLResponse[] = [createMockFeedSettings()],
  user: LoggedUser = defaultUser,
  sidebarExpanded = true,
): RenderResult => {
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: ThemeMode.Dark,
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
    sidebarExpanded,
    toggleSidebarExpanded,
  };
  client = new QueryClient();
  mocks.forEach(mockGraphQL);

  return render(
    <QueryClientProvider client={client}>
      <AlertContextProvider
        alerts={alertsData}
        updateAlerts={updateAlerts}
        loadedAlerts
      >
        <AuthContext.Provider
          value={{
            user,
            isAuthReady: true,
            isFetched: true,
            isLoggedIn: !!user?.id,
            shouldShowLogin: false,
            showLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            closeLogin: jest.fn(),
          }}
        >
          <ProgressiveEnhancementContext.Provider
            value={{
              windowLoaded: true,
              nativeShareSupport: true,
              asyncImageSupport: true,
            }}
          >
            <SettingsContext.Provider value={settingsContext}>
              <SidebarDesktop
                sidebarRendered
                activePage="my-feed"
                onLogoClick={jest.fn()}
                onNavTabClick={jest.fn()}
                isNavButtons={false}
              />
            </SettingsContext.Provider>
          </ProgressiveEnhancementContext.Provider>
        </AuthContext.Provider>
      </AlertContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the sidebar as open by default', async () => {
  renderComponent();
  const section = await screen.findByText('Discover');
  expect(section).toBeInTheDocument();
  const sectionTwo = await screen.findByText('Resources');
  expect(sectionTwo).toBeInTheDocument();
});

it('should toggle the sidebar on button click', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Close sidebar');
  trigger.click();
  await waitFor(() => expect(toggleSidebarExpanded).toBeCalled());
});

it('should show the sidebar as closed if user has this set', async () => {
  renderComponent(defaultAlerts, [], null, false);
  const trigger = await screen.findByLabelText('Open sidebar');
  expect(trigger).toBeInTheDocument();

  const section = await screen.findByText('Discover');
  expect(section).toHaveClass('opacity-0');
});

it('should show the my feed items if the user has filters', async () => {
  renderComponent({ filter: false });
  const section = await screen.findByText('My feed');
  expect(section).toBeInTheDocument();
});

const sidebarItems = [
  ['Explore', '/posts'],
  ['Discussions', '/discussed'],
  ['Tags', '/tags'],
  ['Sources', '/sources'],
  ['Leaderboard', '/users'],
];

describe('sidebar items', () => {
  it.each(sidebarItems.map((item) => [item[0], item[1]]))(
    'it should expect %s to exist',
    async (name, href) => {
      renderComponent();
      waitForNock();
      const el = await screen.findByText(name);
      expect(el).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(el.closest('a')).toHaveAttribute('href', href);
    },
  );
});
