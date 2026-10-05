import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { get as getCache, set as setCache } from 'idb-keyval';
import {
  getSlackShareOriginPath,
  slackShareSnapshotKey,
  useSlackShareReturn,
} from './useSlackShareButton';
import type { Post } from '../../../graphql/posts';
import type { UserIntegration } from '../../../graphql/integrations';
import { UserIntegrationType } from '../../../graphql/integrations';
import { Origin } from '../../../lib/log';
import { LazyModal } from '../../../components/modals/common/types';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import {
  generateQueryKey,
  getPostByIdKey,
  RequestKey,
} from '../../../lib/query';

const mockOpenModal = jest.fn();
const mockDisplayToast = jest.fn();
const mockRestoreScrollPosition = jest.fn();
const mockStore = new Map<string, unknown>();

// jsdom's Blob cannot be structured-cloned into fake-indexeddb
jest.mock('idb-keyval', () => ({
  ...jest.requireActual('idb-keyval'),
  get: async (key: string) => mockStore.get(key),
  set: async (key: string, value: unknown) => {
    mockStore.set(key, value);
  },
  del: async (key: string) => {
    mockStore.delete(key);
  },
}));

jest.mock('../../useLazyModal', () => ({
  ...jest.requireActual('../../useLazyModal'),
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('../../../lib/scrollRestoration', () => ({
  ...jest.requireActual('../../../lib/scrollRestoration'),
  restoreScrollPosition: (target: number) => mockRestoreScrollPosition(target),
}));

jest.mock('../../useToastNotification', () => ({
  ...jest.requireActual('../../useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const post = { id: 'p1', slug: 'p1-slug' } as Post;
const slackIntegration = {
  id: 'integration-1',
  type: UserIntegrationType.Slack,
} as UserIntegration;

describe('getSlackShareOriginPath', () => {
  it('should return to the starting page with the pending share, replacing a stale one', () => {
    const path = getSlackShareOriginPath({
      post: { id: 'p2' } as Post,
      origin: Origin.PostContent,
      path: '/popular?tag=rust&lzym=slackShare&slackPostId=p1&slackScrollY=10#top',
      scrollY: 1234.6,
    });

    const [pathname, query] = path.split('?');

    expect(pathname).toBe('/popular');
    expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
      tag: 'rust',
      lzym: LazyModal.SlackShare,
      slackPostId: 'p2',
      slackScrollY: '1235',
      slackOrigin: Origin.PostContent,
    });
  });
});

describe('useSlackShareReturn', () => {
  const replace = jest.fn();

  const land = (params: Record<string, string>) => {
    const search = new URLSearchParams({
      tag: 'rust',
      lzym: LazyModal.SlackShare,
      slackPostId: post.id,
      slackScrollY: '0',
      ...params,
    });
    window.history.replaceState({}, '', `/popular?${search}`);
    jest.mocked(useRouter).mockReturnValue({
      pathname: '/popular',
      query: Object.fromEntries(search),
      replace,
    } as unknown as ReturnType<typeof useRouter>);
  };

  const renderReturn = (integrations: UserIntegration[]) => {
    const client = new QueryClient();
    client.setQueryData(
      generateQueryKey(RequestKey.UserIntegrations, loggedUser),
      integrations,
    );
    client.setQueryData(getPostByIdKey(post.id), { post });

    renderHook(() => useSlackShareReturn(), {
      wrapper: ({ children }) => (
        <TestBootProvider client={client} auth={{ user: loggedUser }}>
          {children}
        </TestBootProvider>
      ),
    });
  };

  const expectParamsCleared = () =>
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/popular', query: { tag: 'rust' } },
      '/popular?tag=rust',
      { shallow: true, scroll: false },
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();
  });

  afterAll(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should reopen the picker where the share started, through the router', async () => {
    land({ slackOrigin: Origin.PostContent });
    renderReturn([slackIntegration]);

    await waitFor(() =>
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.SlackShare,
        props: expect.objectContaining({ post, origin: Origin.PostContent }),
      }),
    );
    expectParamsCleared();
  });

  it('should scroll back to where the share started once the picker closes', async () => {
    land({ slackScrollY: '1200' });
    renderReturn([slackIntegration]);

    await waitFor(() => expect(mockOpenModal).toHaveBeenCalled());
    expect(mockRestoreScrollPosition).not.toHaveBeenCalled();

    mockOpenModal.mock.calls[0][0].props.onAfterClose();

    expect(mockRestoreScrollPosition).toHaveBeenCalledWith(1200);
  });

  it('should drop an origin that is not one of ours', async () => {
    land({ slackOrigin: 'anything' });
    renderReturn([slackIntegration]);

    await waitFor(() =>
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.SlackShare,
        props: expect.objectContaining({ post, origin: undefined }),
      }),
    );
  });

  it('should reopen the picker with the snapshot that left for Slack', async () => {
    const snapshot = {
      image: new Blob(['snapshot'], { type: 'image/png' }),
      filename: 'tldr',
      message: 'Worth a read',
      channel: { id: 'c1', name: 'general' },
    };
    await setCache(slackShareSnapshotKey, { ...snapshot, postId: post.id });
    land({ slackSnapshot: '1' });
    renderReturn([slackIntegration]);

    await waitFor(() =>
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.SlackShare,
        props: expect.objectContaining({ post, snapshot }),
      }),
    );
    expectParamsCleared();
    expect(await getCache(slackShareSnapshotKey)).toBeUndefined();
  });

  it('should ask for a new snapshot rather than share the link when it was lost', async () => {
    land({ slackSnapshot: '1' });
    renderReturn([slackIntegration]);

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'Slack is connected. Take the snapshot again to send it.',
      ),
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('should clear the params and say so when Slack refused', async () => {
    land({ error: 'access_denied' });
    renderReturn([]);

    await waitFor(() => expect(mockDisplayToast).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/popular', query: { tag: 'rust' } },
      '/popular?tag=rust',
      { shallow: true, scroll: false },
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('should clear the params and say so when no workspace got connected', async () => {
    land({});
    renderReturn([]);

    await waitFor(() => expect(mockDisplayToast).toHaveBeenCalled());
    expectParamsCleared();
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
