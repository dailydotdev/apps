import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestSettings } from '../../../__tests__/fixture/settings';
import AuthContext from '../../contexts/AuthContext';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import SettingsContext from '../../contexts/SettingsContext';
import type { MockedGraphQLResponse } from '../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../../graphql/feedSettings';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import type { Alerts } from '../../graphql/alerts';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { SidebarDesktop } from './SidebarDesktop';

let client: QueryClient;
const updateAlerts = jest.fn();
const toggleSidebarExpanded = jest.fn();
const showLogin = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  showLogin.mockReset();
});

const createMockFeedSettings = () => ({
  request: { query: FEED_SETTINGS_QUERY },
  result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
});

const defaultAlerts: Alerts = { filter: true };

const renderComponent = (
  alertsData = defaultAlerts,
  mocks: MockedGraphQLResponse[] = [createMockFeedSettings()],
  user: LoggedUser | null = defaultUser,
  sidebarExpanded = true,
): RenderResult => {
  const settingsContext = createTestSettings({
    sidebarExpanded,
    toggleSidebarExpanded,
  });
  const authUser = user ?? undefined;
  client = new QueryClient();
  client.setQueryData(TOAST_NOTIF_KEY, null);
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
            user: authUser,
            isAuthReady: true,
            isFetched: true,
            isLoggedIn: !!authUser?.id,
            shouldShowLogin: false,
            showLogin,
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
                activePage="my-feed"
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
  const sectionTwo = await screen.findByText('Squads');
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

it('should show the For You items if the user has filters', async () => {
  renderComponent({ filter: false });
  const section = await screen.findByText('For You');
  expect(section).toBeInTheDocument();
});

it('should render Highlights item linking to highlights page', async () => {
  renderComponent();
  const item = await screen.findByText('Happening Now');
  expect(item).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access
  expect(item.closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('/highlights'),
  );
});

it('should require login before opening following for anonymous users', async () => {
  renderComponent(defaultAlerts, [createMockFeedSettings()], null);
  const item = await screen.findByRole('link', { name: 'Following' });

  fireEvent.click(item);

  await waitFor(() =>
    expect(showLogin).toHaveBeenCalledWith({
      trigger: 'Following',
    }),
  );
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
