import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useViewSize } from '@dailydotdev/shared/src/hooks';
import { WorldView } from '../components/world/WorldView';
import type { UserWorldResult } from '../components/world/useUserWorld';
import type { WorldState } from '../components/world/worldState';
import { createWorldEngine } from '../components/world/engine/world';

/* The card logs `open signup` from a mount effect, so how many times it mounts
   IS the event count. Counted here rather than asserted on the log context,
   which the real card only reaches through the whole auth form. */
const mockSignupMounted = jest.fn();
jest.mock('../components/world/WorldSignupCta', () => ({
  WorldSignupCta: () => {
    const { useEffect } = jest.requireActual('react');
    useEffect(() => mockSignupMounted(), []);

    return <div data-testid="signup" />;
  },
}));

jest.mock('../components/world/engine/world', () => ({
  createWorldEngine: jest.fn(),
}));

jest.mock('../components/world/engine/buildWorld', () => ({
  buildWorld: () => ({ districts: [], quarters: [], replayable: false }),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSize: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/contexts/SettingsContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/SettingsContext'),
  useSettingsContext: () => ({ autoDismissNotifications: true }),
}));

jest.mock('../components/world/useWorldDraft', () => ({
  useWorldDraft: () => ({ isOpen: false, applied: undefined }),
}));

jest.mock('../components/world/useWorldPlate', () => ({
  useWorldPlate: jest.fn(),
}));

jest.mock('../components/world/useWorldMusic', () => ({
  RIDE_MUTED_KEY: 'ride:muted',
  useWorldMusic: jest.fn(),
}));

jest.mock('../components/world/useWorldLog', () => ({
  useWorldLog: jest.fn(),
}));

const mockCreateEngine = createWorldEngine as jest.MockedFunction<
  typeof createWorldEngine
>;
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

const owner = {
  id: 'owner',
  name: 'Ido',
  username: 'ido',
  permalink: 'http://localhost:5002/ido',
} as PublicProfile;

const world: UserWorldResult = {
  districts: [
    {
      niche: { slug: 'web', name: 'Web', realm: 'frameworks' },
      reads: 12,
    },
  ],
  isPending: false,
  isHistoryPending: false,
  isEmpty: false,
  isPrivate: false,
} as unknown as UserWorldResult;

const ready: Partial<WorldState> = {
  status: 'ready',
  progress: 1,
  rank: [],
  articles: 12,
  districts: 1,
  realms: 1,
};

beforeEach(() => {
  mockSignupMounted.mockReset();
  mockUseViewSize.mockReturnValue(true);
  mockCreateEngine.mockImplementation(({ onState }) => {
    // The world stands as soon as it is asked to load, which is all this test
    // needs the engine for: the rail only exists once something is standing.
    return {
      load: async () =>
        onState((previous: WorldState) => ({ ...previous, ...ready })),
      dispose: jest.fn(),
      setLook: jest.fn(),
      setCrest: jest.fn(),
      setSky: jest.fn(),
      setLevelProgress: jest.fn(),
      setPadding: jest.fn(),
      attachHistory: () => false,
      attachSpark: jest.fn(),
      focus: jest.fn(),
      leaveRealm: jest.fn(),
      seek: jest.fn(),
      toggle: jest.fn(),
      toStart: jest.fn(),
      toEnd: jest.fn(),
      setSpeed: jest.fn(),
    } as never;
  });
});

const renderWorld = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={
          {
            user: null,
            isAuthReady: true,
            isLoggedIn: false,
            showLogin: jest.fn(),
            closeLogin: jest.fn(),
          } as never
        }
      >
        <WorldView user={owner} world={world} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

it('mounts the signup card once per visit, not once per panel toggle', async () => {
  renderWorld();

  await screen.findByTestId('signup');
  expect(mockSignupMounted).toHaveBeenCalledTimes(1);

  /* By role, so a hidden rail counts as gone: display:none takes its own copy
     of this toggle out of the accessibility tree, which is the difference
     between out of the way and unmounted. */
  for (let i = 0; i < 3; i += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Hide the panels' }));
    // eslint-disable-next-line no-await-in-loop
    await screen.findByRole('button', { name: 'Show the panels' });
    fireEvent.click(screen.getByRole('button', { name: 'Show the panels' }));
    // eslint-disable-next-line no-await-in-loop
    await screen.findByRole('button', { name: 'Hide the panels' });
  }

  await waitFor(() => expect(screen.getByTestId('signup')).toBeInTheDocument());
  expect(mockSignupMounted).toHaveBeenCalledTimes(1);
});
