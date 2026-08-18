import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { WorldPanel } from '../components/world/WorldPanel';
import type {
  WorldOpenRealm,
  WorldState,
} from '../components/world/worldState';

/* The real card mounts the whole auth form, and none of this is about it. */
jest.mock('../components/world/WorldSignupCta', () => ({
  WorldSignupCta: () => <div data-testid="signup" />,
}));

const owner = {
  id: 'owner',
  name: 'Ido',
  username: 'ido',
  permalink: 'http://localhost:5002/ido',
} as PublicProfile;

const row = (key: string, name: string, level: number, reads: number) => ({
  key,
  name,
  level,
  reads,
  color: '#fff',
  share: 100,
  selected: false,
});

const renderRail = (open?: WorldOpenRealm) =>
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
        <WorldPanel
          user={owner}
          state={
            {
              status: 'ready',
              open,
              rank: [row('frame', 'Frameworks', 4, 64)],
            } as WorldState
          }
          isImmersive={false}
          isOwn={false}
          canShare
          onToggleImmersive={jest.fn()}
          onFocus={jest.fn()}
          onLeaveRealm={jest.fn()}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

const realm: WorldOpenRealm = {
  id: 'frame',
  name: 'Frameworks',
  theme: 'the frameworks you build with',
  districts: 4,
  articles: 64,
};

describe('the world rail ranking', () => {
  /* The whole reason this file exists. The level badge is a tooltip trigger, and
     a trigger is a Radix `asChild` slot handed a ref: put anything there that
     builds a new component type per render (Typography does) and every render
     deletes and remounts the fiber, whose ref detach renders it again. It does
     not degrade, it exceeds the update depth and takes the page down. */
  it('renders rank rows without looping', () => {
    renderRail();

    expect(screen.getByText('Frameworks')).toBeInTheDocument();
    expect(screen.getByText('L4')).toBeInTheDocument();
  });

  /* At world scale a row is a REALM, scored on the ladder with its thresholds
     stretched by REALM_DIV. 64 articles is L4 of that stretched ladder. */
  it('reads a realm row off the stretched ladder', () => {
    renderRail();

    expect(
      screen.getByLabelText('Level 4 · 16 articles to L5'),
    ).toBeInTheDocument();
  });

  /* The same 64 articles inside a realm is a DISTRICT on the plain ladder, which
     is a different rung entirely. Getting the divisor from `open` is the whole
     of the difference, and it is invisible without both cases side by side. */
  it('reads a district row off the plain ladder', () => {
    renderRail(realm);

    expect(
      screen.getByLabelText('Level 7 · 16 articles to L8'),
    ).toBeInTheDocument();
  });
});
