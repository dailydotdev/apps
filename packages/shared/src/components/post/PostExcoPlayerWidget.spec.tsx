import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { act, render, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import { getExcoPlayerScriptSrc } from '../../features/monetization/exco';
import { PostExcoPlayerWidget } from './PostExcoPlayerWidget';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: () => true,
}));

const source = {
  id: 'daily',
  handle: 'daily',
  name: 'daily.dev',
  type: SourceType.Machine,
} as Post['source'];

const playlistId = 'playlist-fallback';
const playlists = { rust: 'playlist-rust' };

const getScript = (playerId: string) =>
  document.head.querySelector<HTMLScriptElement>(
    `script[src="${getExcoPlayerScriptSrc(playerId)}"]`,
  );

const getContainer = () => document.querySelector('[id^="exco-player-"]');

const playerInit = (forPlaylistId: string) => ({
  playbackMode: 'play-in-view',
  mute: true,
  content: { playlistId: forPlaylistId },
});

type PlayerMock = { init: jest.Mock; destroy: jest.Mock };

const mockExcoPlayer = () => {
  const players: PlayerMock[] = [];
  const create = jest.fn(async () => {
    const player = {
      init: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
    };
    players.push(player);
    return player;
  });
  window.ExCoPlayer = { connect: jest.fn(() => ({ create })) };

  return { players };
};

// The loader caches one script per player id for the page's lifetime, so
// every test uses its own id. A post without a `niche` key hasn't had its
// post query land yet.
const renderWidget = (
  playerId: string,
  options: { niche?: Post['niche']; user?: LoggedUser } = {},
) => {
  const client = new QueryClient();
  const gb = new GrowthBook({
    features: {
      exco_player: { defaultValue: { playerId, playlistId, playlists } },
    },
  });
  const tree = (niche: Post['niche']) => (
    <TestBootProvider
      client={client}
      auth={{ user: options.user ?? loggedUser }}
      gb={gb}
    >
      <PostExcoPlayerWidget post={{ source, niche }} />
    </TestBootProvider>
  );
  const view = render(tree('niche' in options ? options.niche : null));

  return {
    ...view,
    rerenderWithNiche: (niche: Post['niche']) => view.rerender(tree(niche)),
  };
};

const loadScript = (playerId: string) =>
  act(() => {
    getScript(playerId)?.dispatchEvent(new Event('load'));
  });

afterEach(() => {
  delete window.ExCoPlayer;
  document.head
    .querySelectorAll('script.exco-player')
    .forEach((script) => script.remove());
});

it('plays the flagged playlist muted in view and destroys the player only once init settles', async () => {
  let resolveInit: () => void = () => undefined;
  const player = {
    init: jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInit = resolve;
        }),
    ),
    destroy: jest.fn(),
  };
  const create = jest.fn().mockResolvedValue(player);
  window.ExCoPlayer = { connect: jest.fn(() => ({ create })) };

  const { unmount } = renderWidget('player-1');
  const script = getScript('player-1');
  expect(script).toHaveAttribute('programmatic', 'true');
  expect(script).toHaveAttribute('multiple', 'true');
  const containerId = getContainer()?.id;

  act(() => {
    script?.dispatchEvent(new Event('load'));
  });

  await waitFor(() =>
    expect(player.init).toHaveBeenCalledWith(playerInit(playlistId)),
  );
  expect(window.ExCoPlayer.connect).toHaveBeenCalledWith('player-1');
  expect(create).toHaveBeenCalledWith({ selector: `#${containerId}` });

  unmount();
  await act(() => Promise.resolve());
  expect(player.destroy).not.toHaveBeenCalled();

  resolveInit();
  await waitFor(() => expect(player.destroy).toHaveBeenCalledTimes(1));
});

it.each([
  ['its niche playlist', 'rust', playlists.rust],
  ['the fallback for a niche without a playlist', 'other', playlistId],
])('plays %s', async (_, slug, expected) => {
  const { players } = mockExcoPlayer();
  renderWidget(`player-${slug}`, { niche: { slug } });
  loadScript(`player-${slug}`);

  await waitFor(() =>
    expect(players[0]?.init).toHaveBeenCalledWith(playerInit(expected)),
  );
});

it('waits for the post query to bring the niche before loading', async () => {
  const { players } = mockExcoPlayer();
  const { rerenderWithNiche } = renderWidget('player-pending', {
    niche: undefined,
  });

  expect(getScript('player-pending')).not.toBeInTheDocument();
  expect(getContainer()).not.toBeInTheDocument();

  rerenderWithNiche({ slug: 'rust' });
  loadScript('player-pending');

  await waitFor(() =>
    expect(players[0]?.init).toHaveBeenCalledWith(playerInit(playlists.rust)),
  );
});

it('replaces the player in a new element when the playlist changes', async () => {
  const { players } = mockExcoPlayer();
  const { rerenderWithNiche } = renderWidget('player-switch', {
    niche: { slug: 'rust' },
  });
  loadScript('player-switch');
  await waitFor(() =>
    expect(players[0]?.init).toHaveBeenCalledWith(playerInit(playlists.rust)),
  );

  const firstContainer = getContainer();

  rerenderWithNiche({ slug: 'other' });

  await waitFor(() =>
    expect(players[1]?.init).toHaveBeenCalledWith(playerInit(playlistId)),
  );
  expect(players[0].destroy).toHaveBeenCalledTimes(1);
  expect(getContainer()).not.toBe(firstContainer);
  expect(document.querySelectorAll('[id^="exco-player-"]')).toHaveLength(1);
});

it('loads nothing for Plus members', () => {
  renderWidget('player-2', { user: { ...loggedUser, isPlus: true } });

  expect(getScript('player-2')).not.toBeInTheDocument();
  expect(getContainer()).not.toBeInTheDocument();
});

it('renders nothing when a blocker stops the script', async () => {
  renderWidget('player-3');
  expect(getContainer()).toBeInTheDocument();

  act(() => {
    getScript('player-3')?.dispatchEvent(new Event('error'));
  });

  await waitFor(() => expect(getContainer()).not.toBeInTheDocument());
});
