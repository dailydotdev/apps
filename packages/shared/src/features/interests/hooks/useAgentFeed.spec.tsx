import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import * as queries from '../queries';
import { useAgentFeed } from './useAgentFeed';

const renderFeed = (forceDemo: boolean) =>
  renderHook(() => useAgentFeed({ id: 'a1', forceDemo }), {
    wrapper: ({ children }) => (
      <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
        {children}
      </TestBootProvider>
    ),
  });

const noFindings = () =>
  jest.spyOn(queries, 'interestFindingsQueryOptions').mockReturnValue({
    queryKey: ['findings', 'a1'],
    queryFn: async () => [],
  } as never);

afterEach(() => jest.restoreAllMocks());

/**
 * The demo surface is the only thing that may produce mock findings. Deriving it
 * from an empty response instead meant a real agent that had honestly kept
 * nothing showed nine fabricated articles as its own work, and the flag can be
 * ramped in GrowthBook without a deploy or a second look at this file.
 */
describe('an agent that has found nothing', () => {
  it('reports nothing rather than borrowing the demo findings', async () => {
    noFindings();
    const { result } = renderFeed(false);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isDemo).toBe(false);
    expect(result.current.items).toHaveLength(0);
  });

  it('keeps the scripted findings for the demo surface', () => {
    const { result } = renderFeed(true);

    expect(result.current.isDemo).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
