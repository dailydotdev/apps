import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import type { ProfileShowcase } from '../../graphql/user/profileShowcase';
import type { HotTake } from '../../graphql/user/userHotTake';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useVoteHotTake } from './useVoteHotTake';

jest.mock('../../graphql/common', () => {
  const requestMock = jest.fn();

  return {
    ...jest.requireActual('../../graphql/common'),
    gqlClient: { request: requestMock },
    gqlRequest: requestMock,
  };
});

jest.mock('../../contexts/AuthContext', () => {
  const { createContext } = jest.requireActual('react');
  return {
    __esModule: true,
    default: createContext({ user: { id: 'viewer' }, showLogin: jest.fn() }),
  };
});

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../useActions', () => ({
  useActions: () => ({ completeAction: jest.fn() }),
}));

const request = gqlClient.request as jest.Mock;

const connection = <T,>(nodes: T[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const hotTake = (props: Partial<HotTake> & Pick<HotTake, 'id'>): HotTake => ({
  emoji: ':fire:',
  title: props.id,
  subtitle: null,
  position: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  upvotes: 0,
  upvoted: false,
  ...props,
});

const showcase = (hotTakes: HotTake[]): ProfileShowcase => ({
  userStack: connection([]),
  hotTakes: connection(hotTakes),
  userWorkspacePhotos: connection([]),
  gear: connection([]),
});

const showcaseKey = generateQueryKey(
  RequestKey.ProfileShowcase,
  { id: 'author' },
  'profile',
);

const setup = (initialHotTakes: HotTake[]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(showcaseKey, showcase(initialHotTakes));

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, ...renderHook(() => useVoteHotTake(), { wrapper }) };
};

const cachedHotTake = (queryClient: QueryClient, id: string) =>
  queryClient
    .getQueryData<ProfileShowcase>(showcaseKey)
    ?.hotTakes.edges.find((edge) => edge.node.id === id)?.node;

beforeEach(() => {
  request.mockReset();
});

describe('useVoteHotTake', () => {
  it('optimistically applies an upvote to the profile showcase cache', async () => {
    const { queryClient, result } = setup([
      hotTake({ id: 'h1', upvotes: 2, upvoted: false }),
    ]);
    request.mockResolvedValueOnce({ vote: { _: true } });

    await act(() => result.current.upvoteHotTake({ id: 'h1' }));

    expect(cachedHotTake(queryClient, 'h1')).toMatchObject({
      upvotes: 3,
      upvoted: true,
    });
  });

  it('rolls the showcase cache back when the vote fails', async () => {
    const { queryClient, result } = setup([
      hotTake({ id: 'h1', upvotes: 2, upvoted: false }),
    ]);
    request.mockRejectedValueOnce(new Error('nope'));

    await act(async () => {
      await result.current.upvoteHotTake({ id: 'h1' }).catch(() => undefined);
    });

    expect(cachedHotTake(queryClient, 'h1')).toMatchObject({
      upvotes: 2,
      upvoted: false,
    });
  });
});
