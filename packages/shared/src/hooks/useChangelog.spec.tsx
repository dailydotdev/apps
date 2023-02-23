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
  changelog: false,
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

    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('1020'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
  });

  it('changelog should be available if changelog alert is true', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    defaultAlerts.changelog = true;

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeTruthy();
    expect(changelog.latestPost).not.toBeUndefined();
  });

  it('changelog should be NOT be available if changelog alert is false', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );
    defaultAlerts.changelog = false;

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });

  it('changelog should be NOT be available when post is not defined', async () => {
    defaultAlerts.changelog = true;

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
    expect(changelog.latestPost).toBeUndefined();
  });

  it('changelog should be NOT be available on tablet', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('656'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    defaultAlerts.changelog = true;

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });

  it('changelog should be NOT be available on mobile', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('420'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    defaultAlerts.changelog = true;

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });
});
