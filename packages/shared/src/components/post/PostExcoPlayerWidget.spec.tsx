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

const playlistId = 'playlist-1';

const getScript = (playerId: string) =>
  document.head.querySelector<HTMLScriptElement>(
    `script[src="${getExcoPlayerScriptSrc(playerId)}"]`,
  );

const getContainer = () => document.querySelector('[id^="exco-player-"]');

// The loader caches one script per player id for the page's lifetime, so
// every test uses its own id.
const renderWidget = (playerId: string, user: LoggedUser = loggedUser) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user }}
      gb={
        new GrowthBook({
          features: {
            exco_player: { defaultValue: { playerId, playlistId } },
          },
        })
      }
    >
      <PostExcoPlayerWidget source={source} />
    </TestBootProvider>,
  );

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
    expect(player.init).toHaveBeenCalledWith({
      playbackMode: 'play-in-view',
      mute: true,
      content: { playlistId },
    }),
  );
  expect(window.ExCoPlayer.connect).toHaveBeenCalledWith('player-1');
  expect(create).toHaveBeenCalledWith({ selector: `#${containerId}` });

  unmount();
  await act(() => Promise.resolve());
  expect(player.destroy).not.toHaveBeenCalled();

  resolveInit();
  await waitFor(() => expect(player.destroy).toHaveBeenCalledTimes(1));
});

it('loads nothing for Plus members', () => {
  renderWidget('player-2', { ...loggedUser, isPlus: true });

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
