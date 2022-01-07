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
import FeaturesContext, { FeaturesData } from '../../contexts/FeaturesContext';

let features: FeaturesData;
let client: QueryClient;
const updateAlerts = jest.fn();
const toggleSidebarExpanded = jest.fn();

const defaultFeatures: FeaturesData = {
  flags: {
    my_feed_on: {
      enabled: true,
    },
  },
};

beforeEach(() => {
  nock.cleanAll();
  features = { flags: {} };
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
  alertsData = defaultAlerts,
  mocks: MockedGraphQLResponse[] = [createMockFeedSettings()],
  user: LoggedUser = defaultUser,
  sidebarExpanded = true,
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
      <FeaturesContext.Provider value={features}>
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
      </FeaturesContext.Provider>
    </QueryClientProvider>,
  );
};

it('should not render create my feed button once user has filters', async () => {
  features = defaultFeatures;
  renderComponent({ filter: false });
  await waitFor(() => {
    const data = client.getQueryData(getFeedSettingsQueryKey(defaultUser));
    expect(data).toBeTruthy();
  });

  const createMyFeed = screen.queryByText('Create my feed');
  expect(createMyFeed).not.toBeInTheDocument();
});

it('should remove filter alert if the user has filters and opened feed filters', async () => {
  features = defaultFeatures;
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
  renderComponent({ filter: true });

  await act(async () => {
    const feedFilters = await screen.findByTestId('myFeedFilter');
    feedFilters.click();
  });

  await waitFor(() => {
    const data = client.getQueryData(getFeedSettingsQueryKey(defaultUser));
    expect(data).toBeTruthy();
  });

  expect(updateAlerts).toBeCalledWith({ filter: false });
  expect(mutationCalled).toBeTruthy();
});

it('should remove the my feed alert if the user clicks the cross', async () => {
  features = defaultFeatures;
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: { myFeed: null } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { _: true } };
    },
  });
  renderComponent({ filter: false, myFeed: 'created' });

  const closeButton = await screen.findByTestId('alert-close');
  closeButton.click();

  await waitFor(() => {
    expect(updateAlerts).toBeCalledWith({ filter: false, myFeed: null });
    expect(mutationCalled).toBeTruthy();
  });
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
  renderComponent(defaultAlerts, [], null, false);
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

it('should render the mobile sidebar version on small screens', async () => {
  await resizeWindow(1019, 768);
  renderComponent();

  const sidebar = await screen.findByTestId('sidebar-aside');
  expect(sidebar).toHaveClass('-translate-x-70');
});

it('should show the my feed items if the user has filters', async () => {
  features = defaultFeatures;
  renderComponent({ filter: false });
  const section = await screen.findByText('My feed');
  expect(section).toBeInTheDocument();
});

it('should show the migrated message if the user has existing filters', async () => {
  features = defaultFeatures;
  renderComponent({ filter: false, myFeed: 'migrated' });
  const section = await screen.findByText(
    `Psst, your feed has a new name! We've already applied your content filters to it.`,
  );
  expect(section).toBeInTheDocument();
});

it('should show the created message if the user added filters', async () => {
  features = defaultFeatures;
  renderComponent({ filter: false, myFeed: 'created' });
  const section = await screen.findByText(
    `🎉 Your feed is ready! Click here to manage your feed's settings`,
  );
  expect(section).toBeInTheDocument();
});

it('should not show the my feed alert if the user removed it', async () => {
  features = defaultFeatures;
  renderComponent({ filter: false, myFeed: null });
  await waitFor(() =>
    expect(
      screen.queryByText(
        `🎉 Your feed is ready! Click here to manage your feed's settings`,
      ),
    ).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(
      screen.queryByText(
        `Psst, your feed has a new name! We've already applied your content filters to it.`,
      ),
    ).not.toBeInTheDocument(),
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
