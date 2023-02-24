import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import Post from '../../../__tests__/fixture/post';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { Alerts } from '../../graphql/alerts';
import { SidebarBottomSectionSection } from './SidebarBottomSection';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { FEED_SETTINGS_QUERY } from '../../graphql/feedSettings';

describe('SidebarBottomSection component', () => {
  const noop = jest.fn();
  const defaultPost = Post;
  const client = new QueryClient();
  const updateAlerts = jest.fn();
  const defaultAlerts: Alerts = {
    lastChangelog: new Date(defaultPost.createdAt).toISOString(),
  };

  beforeEach(async () => {
    nock.cleanAll();
    jest.clearAllMocks();
    client.clear();

    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('1020'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    mockGraphQL({
      request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn: false } },
      result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
    });
  });

  const renderComponent = (): RenderResult => {
    return render(
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={null}
          squads={[]}
          getRedirectUri={noop}
          updateUser={noop}
          tokenRefreshed={false}
        >
          <AlertContextProvider
            alerts={defaultAlerts}
            updateAlerts={updateAlerts}
            loadedAlerts
          >
            <SidebarBottomSectionSection
              optOutWeeklyGoal
              showSettings={false}
              sidebarExpanded={false}
              sidebarRendered
              activePage="/"
              shouldShowLabel
            />
          </AlertContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>,
    );
  };

  it('should render changelog and badge if available', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() - 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    renderComponent();
    const changelog = await screen.findByTestId('changelog');

    const changelogBadge = screen.getByTestId('changelogBadge');
    expect(changelogBadge).toBeInTheDocument();

    expect(changelog).toBeInTheDocument();
  });

  it('should NOT render changelog and badge if changelog NOT available', () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    renderComponent();

    const changelogBadge = screen.queryByTestId('changelogBadge');
    expect(changelogBadge).not.toBeInTheDocument();

    const changelog = screen.queryByTestId('changelog');
    expect(changelog).not.toBeInTheDocument();
  });
});
