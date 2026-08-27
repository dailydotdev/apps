import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import type { HotTake } from '../../../graphql/user/userHotTake';
import type { PublicProfile } from '../../../lib/user';
import { useHotTakes } from './useHotTakes';

jest.mock('../../../graphql/common', () => ({
  ...jest.requireActual('../../../graphql/common'),
  gqlClient: { request: jest.fn() },
}));

jest.mock('../../../hooks/profile/useProfilePreview', () => ({
  useProfilePreview: () => ({ isOwner: true }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

const request = gqlClient.request as jest.Mock;
const user = { id: 'u1' } as PublicProfile;

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

const setup = (initialHotTakes: HotTake[]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  request.mockResolvedValueOnce(showcase(initialHotTakes));

  return renderHook(() => useHotTakes(user), { wrapper });
};

const profileShowcaseCalls = () =>
  request.mock.calls.filter(([, variables]) => variables?.userId === user.id);

beforeEach(() => {
  request.mockReset();
});

describe('useHotTakes', () => {
  it('adds the returned hot take to the profile showcase cache', async () => {
    const first = hotTake({ id: 'h1', position: 0 });
    const added = hotTake({
      id: 'h2',
      title: 'Tabs are state',
      position: 999999,
      createdAt: '2026-01-02T00:00:00.000Z',
    });
    const { result } = setup([first]);

    await waitFor(() => expect(result.current.hotTakes).toEqual([first]));
    request.mockResolvedValueOnce({ addHotTake: added });

    await act(() =>
      result.current.add({
        emoji: added.emoji,
        title: added.title,
        subtitle: added.subtitle ?? undefined,
      }),
    );

    await waitFor(() =>
      expect(result.current.hotTakes).toEqual([first, added]),
    );
    expect(profileShowcaseCalls()).toHaveLength(1);
  });

  it('replaces updated hot takes in the profile showcase cache', async () => {
    const first = hotTake({ id: 'h1', title: 'Before' });
    const updated = { ...first, title: 'After' };
    const { result } = setup([first]);

    await waitFor(() => expect(result.current.hotTakes).toEqual([first]));
    request.mockResolvedValueOnce({ updateHotTake: updated });

    await act(() =>
      result.current.update({
        id: first.id,
        input: { title: updated.title },
      }),
    );

    await waitFor(() => expect(result.current.hotTakes).toEqual([updated]));
    expect(profileShowcaseCalls()).toHaveLength(1);
  });

  it('removes deleted hot takes from the profile showcase cache', async () => {
    const first = hotTake({ id: 'h1' });
    const second = hotTake({ id: 'h2', position: 1 });
    const { result } = setup([first, second]);

    await waitFor(() =>
      expect(result.current.hotTakes).toEqual([first, second]),
    );
    request.mockResolvedValueOnce({ deleteHotTake: { _: true } });

    await act(() => result.current.remove(first.id));

    await waitFor(() => expect(result.current.hotTakes).toEqual([second]));
    expect(profileShowcaseCalls()).toHaveLength(1);
  });

  it('reorders hot takes from the mutation result', async () => {
    const first = hotTake({ id: 'h1', position: 0 });
    const second = hotTake({ id: 'h2', position: 1 });
    const reordered = [
      { ...second, position: 0 },
      { ...first, position: 1 },
    ];
    const { result } = setup([first, second]);

    await waitFor(() =>
      expect(result.current.hotTakes).toEqual([first, second]),
    );
    request.mockResolvedValueOnce({ reorderHotTakes: reordered });

    await act(() =>
      result.current.reorder(
        reordered.map(({ id, position }) => ({ id, position })),
      ),
    );

    await waitFor(() => expect(result.current.hotTakes).toEqual(reordered));
    expect(profileShowcaseCalls()).toHaveLength(1);
  });
});
