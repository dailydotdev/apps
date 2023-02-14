import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import Post from '../../__tests__/fixture/post';
import { useChangelog } from './useChangelog';
import { AlertContextProvider } from '../contexts/AlertContext';
import { AuthContextProvider } from '../contexts/AuthContext';
import { Alerts } from '../graphql/alerts';

const client = new QueryClient();
const defaultPost = Post;
const noop = jest.fn();
const updateAlerts = jest.fn();
const defaultAlerts: Alerts = {
  lastChangelog: new Date(defaultPost.createdAt).toISOString(),
};

const Wrapper = ({ children }) => {
  return (
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
          {children}
        </AlertContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

describe('useChangelog hook', () => {
  beforeEach(() => {
    client.clear();
  });

  it('changelog should be available if post createdAt is greater then lastChangelog', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() - 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeTruthy();
    expect(changelog.latestPost).not.toBeUndefined();
  });

  it('changelog should be NOT be avaiable if post createdAt is less then lastChangelog', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });

  it('changelog should be NOT be avaiable when post is not defined', async () => {
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
    expect(changelog.latestPost).toBeUndefined();
  });
});
