import React from 'react';
import nock from 'nock';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { act } from '@testing-library/react-hooks';
import AuthContext from '../../contexts/AuthContext';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { LoggedUser } from '../../lib/user';
import Sidebar from './Sidebar';
import SettingsContext, {
  SettingsContextData,
  ThemeMode,
} from '../../contexts/SettingsContext';
import {
  mockGraphQL,
  MockedGraphQLResponse,
} from '../../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../../hooks/useFeedSettings';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import { Alerts, UPDATE_ALERTS } from '../../graphql/alerts';

let client: QueryClient;
const updateAlerts = jest.fn();
const toggleSidebarExpanded = jest.fn();

beforeEach(() => {
  nock.cleanAll();
});

const createMockFeedSettings = () => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn: true } },
  result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
});

const defaultAlerts: Alerts = { filter: true };

const resizeWindow = (x, y) => {
  window.resizeTo(x, y);
  window.dispatchEvent(new Event('resize'));
};

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createMockFeedSettings()],
  user: LoggedUser = defaultUser,
  sidebarExpanded = true,
  alertsData = defaultAlerts,
): RenderResult => {
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: ThemeMode.Dark,
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
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
              <Sidebar sidebarRendered />
            </SettingsContext.Provider>
          </ProgressiveEnhancementContext.Provider>
        </AuthContext.Provider>
      </AlertContextProvider>
    </QueryClientProvider>,
  );
};

it('should remove alert dot for filter alert when there is a pre-configured feedSettings', async () => {
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: { filter: false } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { _: true } };
    },
  });
  renderComponent();
  await act(async () => {
    const trigger = await screen.findByText('Feed filters');
    // eslint-disable-next-line testing-library/no-node-access
    trigger.parentElement.click();
  });
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });

  expect(updateAlerts).toBeCalled();
  expect(mutationCalled).toBeTruthy();
});

it('should render the sidebar as open by default', async () => {
  renderComponent();
  const section = await screen.findByText('Discover');
  expect(section).toBeInTheDocument();
  const sectionTwo = await screen.findByText('Manage');
  expect(sectionTwo).toBeInTheDocument();
});

it('should toggle the sidebar on button click', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Close sidebar');
  trigger.click();
  await waitFor(() => expect(toggleSidebarExpanded).toBeCalled());
});

it('should show the sidebar as closed if user has this set', async () => {
  renderComponent([], null, false);
  const trigger = await screen.findByLabelText('Open sidebar');
  expect(trigger).toBeInTheDocument();

  const section = await screen.findByText('Discover');
  expect(section).toHaveClass('opacity-0');
});

it('should invoke the feed customization modal', async () => {
  renderComponent();
  const el = await screen.findByText('Customize');
  el.click();
  await waitFor(async () =>
    expect(await screen.findByText('Hide read posts')).toBeInTheDocument(),
  );
});

it('should set all navigation urls', async () => {
  renderComponent();
  waitForNock();

  const linkableElements = [
    { text: 'Popular', path: '/popular' },
    { text: 'Most upvoted', path: '/upvoted' },
    { text: 'Best discussions', path: '/discussed' },
    { text: 'Search', path: '/search' },
    { text: 'Bookmarks', path: '/bookmarks' },
    { text: 'Reading history', path: '/history' },
  ];

  linkableElements.forEach(async (element) => {
    expect(await screen.findByText(element.text)).toHaveAttribute(
      'href',
      element.path,
    );
  });
});

it('should render the mobile sidebar version on small screens', async () => {
  await resizeWindow(1019, 768);
  renderComponent();

  const sidebar = await screen.findByTestId('sidebar-aside');
  expect(sidebar).toHaveClass('-translate-x-70');
});
