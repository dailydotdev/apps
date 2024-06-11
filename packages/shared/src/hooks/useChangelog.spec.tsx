import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Post from '../../__tests__/fixture/post';
import { useChangelog } from './useChangelog';
import { AlertContextProvider } from '../contexts/AlertContext';
import { AuthContextProvider } from '../contexts/AuthContext';
import { Alerts } from '../graphql/alerts';
import * as hooks from './vote/useVotePost';
import { Origin } from '../lib/log';

const client = new QueryClient();
const defaultPost = Post;
const noop = jest.fn();
const updateAlerts = jest.fn();
const defaultAlerts: Alerts = {
  changelog: false,
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

    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('1020'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
  });

  it('changelog should be available if post createdAt is greater then lastChangelog', async () => {
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);
    defaultAlerts.changelog = true;
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

  it('changelog should be NOT be available if post createdAt is less then lastChangelog', async () => {
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);
    defaultAlerts.changelog = true;
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });

  it('changelog should be NOT be available when post is not defined', async () => {
    defaultAlerts.changelog = false;
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

  it('changelog should be NOT be available on tablet', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('656'),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);
    defaultAlerts.changelog = true;
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

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

    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);
    defaultAlerts.changelog = true;
    const lastChangelog = new Date(defaultAlerts.lastChangelog);
    lastChangelog.setMonth(lastChangelog.getMonth() + 1);
    defaultAlerts.lastChangelog = lastChangelog.toISOString();

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;

    expect(changelog.isAvailable).toBeFalsy();
  });

  it('should call toggleUpvote of useVotePost if toggleUpvote is called', async () => {
    const toggleUpvote = jest.fn();

    jest.spyOn(hooks, 'useVotePost').mockImplementation(() => ({
      toggleUpvote,
      upvotePost: jest.fn(),
      downvotePost: jest.fn(),
      cancelPostVote: jest.fn(),
      toggleDownvote: jest.fn(),
    }));

    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    const { result } = renderHook(() => useChangelog(), {
      wrapper: Wrapper,
    });

    const changelog = result.current;
    await changelog.toggleUpvote({
      payload: defaultPost,
      origin: Origin.ChangelogPopup,
    });

    expect(toggleUpvote).toHaveBeenCalledWith({
      payload: defaultPost,
      origin: Origin.ChangelogPopup,
    });
  });
});
