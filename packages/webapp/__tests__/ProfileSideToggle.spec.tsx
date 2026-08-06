import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ProfileSideToggle } from '../components/profile/ProfileSideToggle';
import { userWorldQueryKey } from '../components/world/useUserWorld';

const mockLogEvent = jest.fn();

jest.mock('@dailydotdev/shared/src/graphql/common', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/common'),
  gqlClient: { request: jest.fn() },
}));

jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

// The renderer is most of a megabyte of three.js and a WebGL context; the
// warm-up only has to be observed, never actually run.
jest.mock('../components/world/WorldView', () => ({ WorldView: () => null }));

const request = gqlClient.request as jest.Mock;

const user = {
  id: 'u1',
  username: 'ido',
  name: 'Ido',
} as PublicProfile;

const renderToggle = (
  queryClient: QueryClient,
  profile: PublicProfile = user,
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ProfileSideToggle user={profile} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  request.mockReset();
  mockLogEvent.mockReset();
});

describe('ProfileSideToggle', () => {
  it('offers both sides, with the world a link away', () => {
    renderToggle(new QueryClient());

    // "side" is its own element so it can drop on a phone, so the labels are
    // read off the group rather than out of a single node.
    const group = screen.getByRole('group', { name: 'Profile sides' });
    expect(group).toHaveTextContent(/Professional side/);
    expect(group).toHaveTextContent(/Fun side/);

    const fun = screen.getByRole('link', { name: /Fun side/ });
    expect(fun).toHaveAttribute('href', '/world/ido');
  });

  it('falls back to the id for a reader with no username', () => {
    renderToggle(new QueryClient(), { ...user, username: undefined });

    expect(screen.getByRole('link', { name: /Fun side/ })).toHaveAttribute(
      'href',
      '/world/u1',
    );
  });

  it('warms the world on intent, so the click is not the start of the wait', async () => {
    const districts = [{ niche: { slug: 'ai_llm' } }];
    request.mockResolvedValue({
      userWorld: districts,
      userWorldSettings: null,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderToggle(queryClient);

    expect(request).not.toHaveBeenCalled();

    fireEvent.mouseEnter(screen.getByRole('link', { name: /Fun side/ }));

    // The entry the world page will read on arrival, under the key it reads it
    // by — a prefetch into a different key would be a wasted request.
    await waitFor(() =>
      expect(queryClient.getQueryData(userWorldQueryKey('u1'))).toEqual({
        districts,
        settings: null,
      }),
    );
  });

  it('warms the world once, however often it is hovered', async () => {
    request.mockResolvedValue({ userWorld: [], userWorldSettings: null });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderToggle(queryClient);
    const fun = screen.getByRole('link', { name: /Fun side/ });

    fireEvent.mouseEnter(fun);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    fireEvent.mouseEnter(fun);
    fireEvent.focus(fun);

    // Fresh data is fresh: re-hovering must not re-ask.
    expect(request).toHaveBeenCalledTimes(1);
  });
});
