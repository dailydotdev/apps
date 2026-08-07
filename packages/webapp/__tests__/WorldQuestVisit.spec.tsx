import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  ClientQuestEventType,
  trackQuestClientEvent,
} from '@dailydotdev/shared/src/graphql/quests';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import ProfileWorldPage from '../pages/world/[userId]';
import { useUserWorld } from '../components/world/useUserWorld';
import type { UserWorldResult } from '../components/world/useUserWorld';

jest.mock('next/router', () => ({
  useRouter: () => ({ isFallback: false }),
}));

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/graphql/quests', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/quests'),
  trackQuestClientEvent: jest.fn(),
}));

jest.mock('../components/world/useUserWorld', () => ({
  ...jest.requireActual('../components/world/useUserWorld'),
  useUserWorld: jest.fn(),
}));

jest.mock('../components/world/WorldView', () => ({ WorldView: () => null }));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseUserWorld = useUserWorld as jest.MockedFunction<
  typeof useUserWorld
>;
const mockTrack = trackQuestClientEvent as jest.MockedFunction<
  typeof trackQuestClientEvent
>;

const owner = {
  id: 'owner',
  username: 'ido',
  name: 'Ido',
} as PublicProfile;

const standing: UserWorldResult = {
  districts: [],
  isPending: false,
  isHistoryPending: false,
  isEmpty: true,
  isPrivate: false,
};

const setViewer = (id: string | null) =>
  mockUseAuthContext.mockReturnValue({
    user: id ? { id } : null,
  } as unknown as ReturnType<typeof useAuthContext>);

// The boot fallback the dynamic renderer shows first reads the shared query
// cache, so the page needs a client even with the renderer itself stubbed out.
const renderWorld = (user: PublicProfile = owner) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProfileWorldPage user={user} noindex={false} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUserWorld.mockReturnValue(standing);
  mockTrack.mockResolvedValue(undefined);
  setViewer('visitor');
});

describe('visiting a world that is not yours', () => {
  it('counts towards the tour', async () => {
    renderWorld();

    await waitFor(() =>
      expect(mockTrack).toHaveBeenCalledWith(
        ClientQuestEventType.VisitUserWorld,
      ),
    );
  });

  it('does not count a visit to your own world', () => {
    setViewer(owner.id);

    renderWorld();

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('does not count a logged out visit', () => {
    setViewer(null);

    renderWorld();

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('does not count a world that has not stood up yet', () => {
    mockUseUserWorld.mockReturnValue({ ...standing, isPending: true });

    renderWorld();

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('does not count a world its owner has hidden', () => {
    mockUseUserWorld.mockReturnValue({ ...standing, isPrivate: true });

    renderWorld();

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('does not count a world that failed to load', () => {
    mockUseUserWorld.mockReturnValue({
      ...standing,
      error: new Error('nope'),
    });

    renderWorld();

    expect(mockTrack).not.toHaveBeenCalled();
  });
});
