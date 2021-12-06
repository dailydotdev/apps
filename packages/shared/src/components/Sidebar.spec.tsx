import React from 'react';
import nock from 'nock';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { LoggedUser } from '../lib/user';
import Sidebar from './Sidebar';
import SettingsContext, {
  SettingsContextData,
} from '../contexts/SettingsContext';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../hooks/useMutateFilters';
import AlertContext, { AlertContextData } from '../contexts/AlertContext';
import OnboardingContext from '../contexts/OnboardingContext';
import { waitForNock } from '../../__tests__/helpers/utilities';

let client: QueryClient;
const updateAlerts = jest.fn();
const toggleOpenSidebar = jest.fn();
const incrementOnboardingStep = jest.fn();

beforeEach(() => {
  nock.cleanAll();
});

const createMockFeedSettings = () => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn: true } },
  result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
});

const defaultAlerts: AlertContextData = {
  alerts: { filter: true },
  updateAlerts,
};

const renderComponent = (
  mocks = [createMockFeedSettings()],
  user: LoggedUser = defaultUser,
  openSidebar = true,
  onboardingStep = -1,
  alertsData = defaultAlerts,
): RenderResult => {
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: 'dark',
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
    openSidebar,
    toggleOpenSidebar,
  };
  client = new QueryClient();
  mocks.forEach(mockGraphQL);

  return render(
    <QueryClientProvider client={client}>
      <AlertContext.Provider value={alertsData}>
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
          <SettingsContext.Provider value={settingsContext}>
            <OnboardingContext.Provider
              value={{
                onboardingStep,
                onboardingReady: true,
                incrementOnboardingStep,
              }}
            >
              <Sidebar />
            </OnboardingContext.Provider>
          </SettingsContext.Provider>
        </AuthContext.Provider>
      </AlertContext.Provider>
    </QueryClientProvider>,
  );
};

it('should remove red dot for filter alert when there is a pre-configured feedSettings', async () => {
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const trigger = await screen.findByText('Feed filters');
  // eslint-disable-next-line testing-library/no-node-access
  trigger.parentElement.click();
  expect(updateAlerts).toBeCalled();
  expect(incrementOnboardingStep).toBeCalledTimes(0);
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
  await waitFor(() => expect(toggleOpenSidebar).toBeCalled());
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
