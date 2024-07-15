import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { useFeeds } from './useFeeds';
import {
  CREATE_FEED_MUTATION,
  DELETE_FEED_MUTATION,
  FEED_LIST_QUERY,
  UPDATE_FEED_MUTATION,
} from '../../graphql/feed';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { BootApp } from '../../lib/boot';
import { GrowthBookProvider } from '../../components/GrowthBookProvider';

const client = new QueryClient();
const noop = jest.fn();
let queryCalled = false;

const Wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultUser}
        squads={[]}
        getRedirectUri={noop}
        updateUser={noop}
        tokenRefreshed={false}
      >
        <GrowthBookProvider
          app={BootApp.Test}
          user={defaultUser}
          deviceId="123"
          experimentation={{
            f: '{}',
            e: [],
            a: [],
          }}
        >
          {children}
        </GrowthBookProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const feeds = [
  {
    node: {
      id: 'cf1',
      userId: '1',
      flags: {
        name: 'Cool feed',
      },
      slug: 'cool-feed-cf1',
    },
  },
  {
    node: {
      id: 'cf2',
      userId: '1',
      flags: {
        name: 'PHP feed',
      },
      slug: 'php-feed-cf2',
    },
  },
  {
    node: {
      id: 'cf3',
      userId: '1',
      flags: {
        name: 'Awful feed',
      },
      slug: 'awful-feed-cf3',
    },
  },
];

describe('useFeeds hook', () => {
  beforeEach(() => {
    client.clear();

    mockGraphQL({
      request: {
        query: FEED_LIST_QUERY,
      },
      result: () => {
        queryCalled = true;

        return {
          data: {
            feedList: {
              pageInfo: {
                endCursor: expect.any(String),
                hasNextPage: false,
              },
              edges: feeds,
            },
          },
        };
      },
    });

    mockGraphQL({
      request: {
        query: CREATE_FEED_MUTATION,
        variables: {
          name: 'New feed',
        },
      },
      result: () => {
        queryCalled = true;

        return {
          data: {
            createFeed: {
              id: 'cf4',
              userId: '1',
              flags: {
                name: 'New feed',
              },
              slug: 'new-feed-cf4',
            },
          },
        };
      },
    });

    mockGraphQL({
      request: {
        query: UPDATE_FEED_MUTATION,
        variables: {
          name: 'Updated feed',
          feedId: 'cf1',
        },
      },
      result: () => {
        queryCalled = true;

        return {
          data: {
            updateFeed: {
              id: 'cf1',
              userId: '1',
              flags: {
                name: 'Updated feed',
              },
              slug: 'updated-feed-cf1',
            },
          },
        };
      },
    });

    mockGraphQL({
      request: {
        query: DELETE_FEED_MUTATION,
        variables: {
          feedId: 'cf1',
        },
      },
      result: () => {
        queryCalled = true;

        return {
          data: {
            deleteFeed: {
              id: 'cf1',
            },
          },
        };
      },
    });
  });

  it('should return feeds', async () => {
    const { result } = renderHook(() => useFeeds(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(queryCalled).toBe(true));

    expect(result.current.feeds).toBeTruthy();
    expect(result.current.feeds.edges).toMatchObject(feeds);
  });

  it('should create a feed', async () => {
    const { result, rerender } = renderHook(() => useFeeds(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(queryCalled).toBe(true));

    const feed = await result.current.createFeed({ name: 'New feed' });
    rerender();

    expect(feed).toBeTruthy();
    expect(feed.flags.name).toBe('New feed');
    expect(
      result.current.feeds.edges.find((f) => f.node.id === feed.id),
    ).toBeTruthy();
  });

  it('should update a feed', async () => {
    const { result, rerender } = renderHook(() => useFeeds(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(queryCalled).toBe(true));

    const feed = await result.current.updateFeed({
      feedId: 'cf1',
      name: 'Updated feed',
    });
    rerender();

    expect(feed).toBeTruthy();
    expect(feed.flags.name).toBe('Updated feed');
    expect(
      result.current.feeds.edges.find((f) => f.node.id === feed.id),
    ).toBeTruthy();
  });

  it('should delete a feed', async () => {
    const { result, rerender } = renderHook(() => useFeeds(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(queryCalled).toBe(true));

    await act(async () => {
      await result.current.deleteFeed({ feedId: 'cf1' });
    });

    rerender();

    expect(
      result.current.feeds.edges.find((f) => f.node.id === 'cf1'),
    ).toBeFalsy();
  });
});
