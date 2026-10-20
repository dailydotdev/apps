import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { act, render, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import type {
  ExcoEventData,
  ExcoEventName,
} from '../../features/monetization/exco';
import { getExcoPlayerScriptSrc } from '../../features/monetization/exco';
import type { ExcoPlacement } from '../../features/monetization/useExcoPlayerLogging';
import { LogEvent, TargetType } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import { PostExcoPlayerWidget } from './PostExcoPlayerWidget';

let mockIsLaptop = true;

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: () => mockIsLaptop,
}));

const source = {
  id: 'daily',
  handle: 'daily',
  name: 'daily.dev',
  type: SourceType.Machine,
} as Post['source'];

const playlistId = 'playlist-1';

type Listener = (data?: ExcoEventData) => void;

const getScript = (playerId: string) =>
  document.head.querySelector<HTMLScriptElement>(
    `script[src="${getExcoPlayerScriptSrc(playerId)}"]`,
  );

const getBox = () => document.querySelector('.aspect-video');
const getContainer = () => document.querySelector('[id^="exco-player-"]');

const createPlayer = (init = jest.fn().mockResolvedValue(undefined)) => {
  const listeners = new Map<ExcoEventName, Listener>();
  const player = {
    init,
    destroy: jest.fn(),
    on: jest.fn((name: ExcoEventName, listener: Listener) =>
      listeners.set(name, listener),
    ),
  };
  const create = jest.fn().mockResolvedValue(player);
  window.ExCoPlayer = { connect: jest.fn(() => ({ create })) };
  const emit = (name: ExcoEventName, data?: ExcoEventData) =>
    act(() => listeners.get(name)?.(data));

  return { player, create, emit };
};

const logEvent = jest.fn();

// The loader caches one script per player id for the page's lifetime, so
// every test uses its own id.
const renderWidget = (
  playerId: string,
  {
    user = loggedUser,
    placement = 'rail',
    isAuthReady = true,
  }: {
    user?: LoggedUser;
    placement?: ExcoPlacement;
    isAuthReady?: boolean;
  } = {},
) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user, isAuthReady, isAuthReadyOrCached: isAuthReady }}
      log={{ logEvent }}
      gb={
        new GrowthBook({
          features: {
            exco_player: { defaultValue: { playerId, playlistId } },
          },
        })
      }
    >
      <PostExcoPlayerWidget source={source} placement={placement} />
    </TestBootProvider>,
  );

const loadScript = (playerId: string) =>
  act(() => {
    getScript(playerId)?.dispatchEvent(new Event('load'));
  });

const getLogged = (eventName: string, targetType?: string) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter(
      (event) =>
        event.event_name === eventName &&
        (!targetType || event.target_type === targetType),
    )
    .map((event) => ({ ...event, extra: JSON.parse(event.extra) }));

beforeEach(() => {
  mockIsLaptop = true;
  logEvent.mockClear();
});

afterEach(() => {
  delete window.ExCoPlayer;
  document.head
    .querySelectorAll('script.exco-player')
    .forEach((script) => script.remove());
});

it('plays the flagged playlist muted in view and destroys the player only once init settles', async () => {
  let resolveInit: () => void = () => undefined;
  const { player, create } = createPlayer(
    jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInit = resolve;
        }),
    ),
  );

  const { unmount } = renderWidget('player-1');
  const script = getScript('player-1');
  expect(script).toHaveAttribute('programmatic', 'true');
  expect(script).toHaveAttribute('multiple', 'true');
  const containerId = getContainer()?.id;

  loadScript('player-1');

  await waitFor(() =>
    expect(player.init).toHaveBeenCalledWith({
      playbackMode: 'play-in-view',
      mute: true,
      content: { playlistId },
    }),
  );
  expect(window.ExCoPlayer?.connect).toHaveBeenCalledWith('player-1');
  expect(create).toHaveBeenCalledWith({ selector: `#${containerId}` });

  unmount();
  await act(() => Promise.resolve());
  expect(player.destroy).not.toHaveBeenCalled();

  resolveInit();
  await waitFor(() => expect(player.destroy).toHaveBeenCalledTimes(1));
});

it('holds the box before auth settles and loads nothing yet', () => {
  renderWidget('player-pending', { isAuthReady: false });

  expect(getBox()).toBeInTheDocument();
  expect(getContainer()).not.toBeInTheDocument();
  expect(getScript('player-pending')).not.toBeInTheDocument();
});

it('loads nothing for Plus members', () => {
  renderWidget('player-plus', { user: { ...loggedUser, isPlus: true } });

  expect(getScript('player-plus')).not.toBeInTheDocument();
  expect(getBox()).not.toBeInTheDocument();
});

it('collapses and logs when a blocker stops the script', async () => {
  renderWidget('player-blocked');
  expect(getContainer()).toBeInTheDocument();

  act(() => {
    getScript('player-blocked')?.dispatchEvent(new Event('error'));
  });

  await waitFor(() => expect(getContainer()).not.toBeInTheDocument());
  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([
    expect.objectContaining({
      target_type: TargetType.VideoPlayer,
      extra: expect.objectContaining({ reason: 'blocked' }),
    }),
  ]);
});

it('plays inline without the sticky player below laptop, and not in the rail', async () => {
  mockIsLaptop = false;
  const { player } = createPlayer();
  renderWidget('player-inline', { placement: 'inline' });
  loadScript('player-inline');

  await waitFor(() =>
    expect(player.init).toHaveBeenCalledWith(
      expect.objectContaining({
        sticky: { desktop: { enabled: false }, mobile: { enabled: false } },
      }),
    ),
  );

  const { container } = renderWidget('player-rail-phone');
  expect(container).toBeEmptyDOMElement();
});

it('logs the player, its ad breaks and its video ads', async () => {
  const { player, emit } = createPlayer();
  renderWidget('player-logging');
  loadScript('player-logging');
  await waitFor(() => expect(player.init).toHaveBeenCalled());

  emit('player-in');
  emit('player-in');
  emit('slot-start');
  emit('slot-auction-completed', { bid: false });
  emit('ad-impression', { adId: 'ad-1', cpm: 2.5, skippable: true });
  emit('ad-midpoint', { adId: 'ad-1' });
  emit('cta-clicked', { url: 'https://daily.dev/posts/p1', title: 'P1' });

  const shared = { provider: 'exco', format: 'video', placement: 'rail' };
  expect(getLogged(LogEvent.Impression, TargetType.VideoPlayer)).toEqual([
    expect.objectContaining({
      target_type: TargetType.VideoPlayer,
      target_id: 'player-logging',
      extra: expect.objectContaining({ ...shared, playlist_id: playlistId }),
    }),
  ]);
  expect(getLogged(LogEvent.RequestAdSlot)).toHaveLength(1);
  expect(getLogged(LogEvent.EmptyAdSlot)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({ ...shared, reason: 'no_bid' }),
    }),
  ]);
  expect(getLogged(AdActions.Impression, 'ad')).toEqual([
    expect.objectContaining({
      target_type: 'ad',
      target_id: 'ad-1',
      ad_provider_id: 'exco',
      extra: expect.objectContaining({ cpm: 2.5, skippable: true }),
    }),
  ]);
  expect(getLogged(LogEvent.VideoAdProgress)).toEqual([
    expect.objectContaining({
      ad_provider_id: 'exco',
      extra: expect.objectContaining({ milestone: 50 }),
    }),
  ]);
  expect(getLogged(LogEvent.Click)).toEqual([
    expect.objectContaining({
      target_type: TargetType.VideoPlayer,
      extra: expect.objectContaining({
        cta: 'go to post',
        url: 'https://daily.dev/posts/p1',
      }),
    }),
  ]);
});
