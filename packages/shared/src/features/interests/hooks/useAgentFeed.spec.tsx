import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import type { Post } from '../../../graphql/posts';
import * as queries from '../queries';
import { useAgentFeed } from './useAgentFeed';

const renderFeed = () =>
  renderHook(() => useAgentFeed({ id: 'a1' }), {
    wrapper: ({ children }) => (
      <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
        {children}
      </TestBootProvider>
    ),
  });

const mockFindings = (findings: unknown[]) =>
  jest.spyOn(queries, 'interestFindingsQueryOptions').mockReturnValue({
    queryKey: ['findings', 'a1'],
    queryFn: async () => findings,
  } as never);

afterEach(() => jest.restoreAllMocks());

describe('useAgentFeed', () => {
  it('maps findings to feed items and drops the ones whose post is gone', async () => {
    mockFindings([
      {
        id: 'f1',
        postId: 'p1',
        score: 0.9,
        rationale: 'strong match',
        createdAt: '2026-01-01T00:00:00Z',
        post: { id: 'p1', title: 'A post' } as Post,
      },
      {
        id: 'f2',
        postId: 'p2',
        score: 0.8,
        rationale: null,
        createdAt: '2026-01-01T00:00:00Z',
        post: null,
      },
    ]);
    const { result } = renderFeed();

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      id: 'f1',
      score: 0.9,
      rationale: 'strong match',
    });
  });

  it('reports nothing for an agent that has honestly kept nothing', async () => {
    mockFindings([]);
    const { result } = renderFeed();

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.items).toHaveLength(0);
  });
});
