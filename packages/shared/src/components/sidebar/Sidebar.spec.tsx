import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestSettings } from '../../../__tests__/fixture/settings';
import AuthContext from '../../contexts/AuthContext';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import SettingsContext, {
  type SettingsContextData,
} from '../../contexts/SettingsContext';
import type { MockedGraphQLResponse } from '../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../../graphql/feedSettings';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import type { Alerts } from '../../graphql/alerts';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { SidebarDesktop } from './SidebarDesktop';
import type { Feed } from '../../graphql/feed';
import { FeedType } from '../../graphql/feed';
import type { SettingsFlags } from '../../graphql/settings';

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

type RenderComponentOptions = {
  feeds?: Feed[];
  settings?: Partial<SettingsContextData>;
};

const createCustomFeed = (): Feed => ({
  id: 'cf1',
  userId: 'u1',
  flags: {
    name: 'Cool feed',
  },
  slug: 'cool-feed-cf1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  type: FeedType.Custom,
});

const createSidebarFlags = (
  flags: Partial<SettingsFlags> = {},
): SettingsFlags => ({
  sidebarSquadExpanded: true,
  sidebarCustomFeedsExpanded: true,
  sidebarOtherExpanded: true,
  sidebarResourcesExpanded: true,
  sidebarBookmarksExpanded: true,
  clickbaitShieldEnabled: true,
  ...flags,
});

const renderComponent = (
  alertsData = defaultAlerts,
  mocks: MockedGraphQLResponse[] = [createMockFeedSettings()],
  user: LoggedUser | null | undefined = defaultUser,
  sidebarExpanded = true,
  options: RenderComponentOptions = {},
): RenderResult => {
  const resolvedUser = user === null ? undefined : user;
  const settingsContext = createTestSettings({
    sidebarExpanded,
    toggleSidebarExpanded,
    ...options.settings,
  });
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
            user: resolvedUser,
            isAuthReady: true,
            isFetched: true,
            isLoggedIn: !!resolvedUser?.id,
            shouldShowLogin: false,
            showLogin,
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            closeLogin: jest.fn(),
            feeds: options.feeds,
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

it('should not render a collapsed divider for empty custom feeds', async () => {
  renderComponent(defaultAlerts, [], null, false);

  await screen.findByLabelText('Find Squads');

  expect(screen.getAllByRole('separator')).toHaveLength(3);
});

it('should render a collapsed divider for custom feeds with items', async () => {
  renderComponent(defaultAlerts, [], null, false, {
    feeds: [createCustomFeed()],
  });

  await screen.findByLabelText('Cool feed');

  expect(screen.getAllByRole('separator')).toHaveLength(4);
});

it('should keep the expanded empty custom feeds header add affordance', async () => {
  renderComponent();

  const section = await screen.findByText('Feeds');
  expect(section).toBeInTheDocument();
  expect(screen.getByLabelText('Add to Feeds')).toBeInTheDocument();
});

it('should not render a collapsed divider for a flag-collapsed section', async () => {
  renderComponent(defaultAlerts, [], null, false, {
    feeds: [createCustomFeed()],
    settings: {
      flags: createSidebarFlags({ sidebarCustomFeedsExpanded: false }),
    },
  });

  await screen.findByLabelText('Find Squads');

  expect(screen.getAllByRole('separator')).toHaveLength(3);
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
