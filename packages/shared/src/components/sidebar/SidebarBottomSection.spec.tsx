import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import Post from '../../../__tests__/fixture/post';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { Alerts } from '../../graphql/alerts';
import { SidebarBottomSectionSection } from './SidebarBottomSection';

describe('SidebarBottomSection component', () => {
  const noop = jest.fn();
  const defaultPost = Post;
  const updateAlerts = jest.fn();
  const defaultAlerts: Alerts = {
    lastChangelog: new Date(defaultPost.createdAt).toISOString(),
  };

  beforeEach(async () => {
    nock.cleanAll();
    jest.clearAllMocks();

    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('1020'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
  });

  const renderComponent = ({
    client,
  }: {
    client: QueryClient;
  }): RenderResult => {
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
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    defaultAlerts.changelog = true;
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() - 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    renderComponent({ client });
    const changelog = await screen.findByTestId('changelog');

    const changelogBadge = await screen.findByTestId('changelogBadge');
    expect(changelogBadge).toBeInTheDocument();

    expect(changelog).toBeInTheDocument();
  });

  it('should NOT render changelog and badge if changelog NOT available', () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    defaultAlerts.changelog = false;
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    renderComponent({ client });

    const changelogBadge = screen.queryByTestId('changelogBadge');
    expect(changelogBadge).not.toBeInTheDocument();

    const changelog = screen.queryByTestId('changelog');
    expect(changelog).not.toBeInTheDocument();
  });
});
