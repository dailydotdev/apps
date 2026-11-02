import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';
import type { SourceFeatures } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import type {
  ExcoEventData,
  ExcoEventName,
} from '../../features/monetization/exco';
import { getExcoPlayerScriptSrc } from '../../features/monetization/exco';
import {
  excoFrameSource,
  getExcoFrameUrl,
} from '../../features/monetization/excoFrame';
import type { ExcoPlacement } from '../../features/monetization/useExcoPlayerLogging';
import { LogEvent, TargetType } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import { checkIsExtension } from '../../lib/func';
import { PostExcoPlayerWidget } from './PostExcoPlayerWidget';

let mockIsLaptop = true;

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: () => mockIsLaptop,
}));

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  checkIsExtension: jest.fn(() => false),
}));

const mockCheckIsExtension = jest.mocked(checkIsExtension);

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

type WidgetPost = Pick<Post, 'id' | 'source' | 'excoPlaylistId'>;

// The loader caches one script per player id for the page's lifetime, so
// every test uses its own id. A post without an `excoPlaylistId` key hasn't
// had its post query land yet.
const renderWidget = (
  playerId: string,
  options: {
    user?: LoggedUser;
    placement?: ExcoPlacement;
    isAuthReady?: boolean;
    excoPlaylistId?: Post['excoPlaylistId'];
    post?: Partial<WidgetPost>;
  } = {},
) => {
  const { user = loggedUser, placement = 'rail', isAuthReady = true } = options;
  const client = new QueryClient();
  const gb = new GrowthBook({
    features: {
      exco_player: { defaultValue: { playerId } },
    },
  });
  const initialPost: WidgetPost = {
    id: 'p1',
    source,
    excoPlaylistId:
      'excoPlaylistId' in options ? options.excoPlaylistId : playlistId,
    ...options.post,
  };
  const tree = (post: WidgetPost) => (
    <TestBootProvider
      client={client}
      auth={{ user, isAuthReady, isAuthReadyOrCached: isAuthReady }}
      log={{ logEvent }}
      gb={gb}
    >
      <PostExcoPlayerWidget post={post} placement={placement} />
    </TestBootProvider>
  );
  const view = render(tree(initialPost));

  return {
    ...view,
    rerenderWithPost: (post: Partial<WidgetPost>) =>
      view.rerender(tree({ ...initialPost, ...post })),
    rerenderWithPlaylist: (excoPlaylistId: Post['excoPlaylistId']) =>
      view.rerender(tree({ ...initialPost, excoPlaylistId })),
  };
};

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
  window.history.replaceState({}, '', '/');
  mockCheckIsExtension.mockReturnValue(false);
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

it('renders nothing when no playlists are configured', () => {
  renderWidget('player-no-playlist', { excoPlaylistId: null });

  expect(getBox()).not.toBeInTheDocument();
  expect(getScript('player-no-playlist')).not.toBeInTheDocument();
});

it('renders nothing with the flag off', () => {
  const { container } = renderWidget('');

  expect(container).toBeEmptyDOMElement();
  expect(document.querySelector('script.exco-player')).not.toBeInTheDocument();
});

it('renders nothing until the post query brings the playlist', async () => {
  const { player } = createPlayer();
  const { container, rerenderWithPlaylist } = renderWidget(
    'player-playlist-pending',
    { excoPlaylistId: undefined },
  );

  expect(container).toBeEmptyDOMElement();
  expect(getScript('player-playlist-pending')).not.toBeInTheDocument();

  rerenderWithPlaylist('playlist-rust');
  loadScript('player-playlist-pending');

  await waitFor(() =>
    expect(player.init).toHaveBeenCalledWith(
      expect.objectContaining({ content: { playlistId: 'playlist-rust' } }),
    ),
  );
});

it('replaces the player in a new element when the playlist changes', async () => {
  const { player: first, create } = createPlayer();
  const second = {
    init: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    on: jest.fn(),
  };
  create.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const { rerenderWithPlaylist } = renderWidget('player-switch');
  loadScript('player-switch');
  await waitFor(() => expect(first.init).toHaveBeenCalled());
  const firstContainer = getContainer();

  rerenderWithPlaylist('playlist-2');

  await waitFor(() =>
    expect(second.init).toHaveBeenCalledWith(
      expect.objectContaining({ content: { playlistId: 'playlist-2' } }),
    ),
  );
  expect(first.destroy).toHaveBeenCalledTimes(1);
  expect(getContainer()).not.toBe(firstContainer);
  expect(document.querySelectorAll('[id^="exco-player-"]')).toHaveLength(1);
});

it('gives the next post its own player and impression on the same playlist', async () => {
  const { player: first, create, emit } = createPlayer();
  const second = {
    init: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    on: jest.fn(),
  };
  create.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const { rerenderWithPost } = renderWidget('player-next-post');
  loadScript('player-next-post');
  await waitFor(() => expect(first.init).toHaveBeenCalled());
  emit('player-in');

  rerenderWithPost({ id: 'p2' });

  await waitFor(() => expect(second.init).toHaveBeenCalled());
  expect(first.destroy).toHaveBeenCalledTimes(1);
  act(() => second.on.mock.calls.find(([name]) => name === 'player-in')[1]());
  expect(getLogged(LogEvent.Impression, TargetType.VideoPlayer)).toHaveLength(
    2,
  );
});

it('holds nothing for a feed post in a squad until its post query says it is not ad-free', () => {
  // The feed selects only `verified`; the post query selects every feature.
  const squad = (features: Partial<SourceFeatures>) =>
    ({ ...source, type: SourceType.Squad, features } as Post['source']);
  const { rerenderWithPost } = renderWidget('player-feed-squad', {
    excoPlaylistId: undefined,
    post: { source: squad({ verified: true }) },
  });

  expect(getBox()).not.toBeInTheDocument();

  rerenderWithPost({
    source: squad({ verified: true, adFree: true }),
    excoPlaylistId: playlistId,
  });
  expect(getBox()).not.toBeInTheDocument();

  rerenderWithPost({
    source: squad({ verified: true, adFree: null }),
    excoPlaylistId: playlistId,
  });
  expect(getContainer()).toBeInTheDocument();
});

it('renders nothing before auth settles', () => {
  const { container } = renderWidget('player-pending', { isAuthReady: false });

  expect(container).toBeEmptyDOMElement();
  expect(getScript('player-pending')).not.toBeInTheDocument();
});

it.each([
  ['on the web', false],
  ['in the extension', true],
])('loads nothing for Plus members %s', (_, isExtension) => {
  mockCheckIsExtension.mockReturnValue(isExtension);
  renderWidget('player-plus', { user: { ...loggedUser, isPlus: true } });

  expect(getScript('player-plus')).not.toBeInTheDocument();
  expect(getBox()).not.toBeInTheDocument();
  expect(document.querySelector('iframe')).not.toBeInTheDocument();
});

it('plays the QA player from the URL with the flag off, Plus members included', async () => {
  window.history.replaceState({}, '', '/posts/p1?exco_player=player-qa');
  const { player } = createPlayer();
  renderWidget('', { user: { ...loggedUser, isPlus: true } });

  loadScript('player-qa');

  await waitFor(() =>
    expect(player.init).toHaveBeenCalledWith(
      expect.objectContaining({ content: { playlistId } }),
    ),
  );
  expect(window.ExCoPlayer?.connect).toHaveBeenCalledWith('player-qa');
});

it('ignores a QA player id that is not a plain id', () => {
  window.history.replaceState({}, '', '/posts/p1?exco_player=../evil');
  const { container } = renderWidget('');

  expect(container).toBeEmptyDOMElement();
  expect(document.querySelector('script.exco-player')).not.toBeInTheDocument();
});

it('frames the player from the webapp in the extension and logs what the frame reports', () => {
  mockCheckIsExtension.mockReturnValue(true);
  renderWidget('player-extension');
  const frame = screen.getByTitle<HTMLIFrameElement>('Video player');
  const postFromFrame = (data: unknown, origin = new URL(frame.src).origin) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data,
          origin,
          source: frame.contentWindow,
        }),
      );
    });

  expect(frame).toHaveAttribute(
    'src',
    getExcoFrameUrl({ playerId: 'player-extension', playlistId }),
  );
  expect(getScript('player-extension')).not.toBeInTheDocument();

  postFromFrame({ source: excoFrameSource, type: 'ready' });
  act(() => {
    frame.dispatchEvent(new Event('load'));
  });
  postFromFrame({
    source: excoFrameSource,
    type: 'event',
    name: 'player-in',
    data: {},
  });
  expect(getLogged(LogEvent.Impression, TargetType.VideoPlayer)).toHaveLength(
    1,
  );

  const failure = { source: excoFrameSource, type: 'error', reason: 'blocked' };
  postFromFrame(failure, 'https://example.com');
  expect(document.querySelector('iframe')).toBeInTheDocument();

  postFromFrame({ ...failure, error: 'Failed to load the EX.CO player' });
  expect(document.querySelector('iframe')).not.toBeInTheDocument();
  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([]);
  expect(getLogged(LogEvent.VideoPlayerBlocked)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({
        reason: 'blocked',
        error: 'Failed to load the EX.CO player',
      }),
    }),
  ]);

  renderWidget('player-extension', { post: { id: 'p2' } });
  expect(document.querySelector('iframe')).not.toBeInTheDocument();
});

it('collapses the frame and logs when the embed page never runs in it', () => {
  jest.useFakeTimers();
  mockCheckIsExtension.mockReturnValue(true);
  renderWidget('player-frame-refused');

  act(() => {
    screen.getByTitle('Video player').dispatchEvent(new Event('load'));
    jest.advanceTimersByTime(5_000);
  });
  jest.useRealTimers();

  expect(document.querySelector('iframe')).not.toBeInTheDocument();
  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({ reason: 'frame_failed' }),
    }),
  ]);
});

it('collapses and logs when a blocker stops the script', async () => {
  const { container } = renderWidget('player-blocked');
  expect(getContainer()).toBeInTheDocument();

  act(() => {
    getScript('player-blocked')?.dispatchEvent(new Event('error'));
  });

  await waitFor(() => expect(container).toBeEmptyDOMElement());
  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([]);
  expect(getLogged(LogEvent.VideoPlayerBlocked)).toEqual([
    expect.objectContaining({
      target_type: TargetType.VideoPlayer,
      extra: expect.objectContaining({
        reason: 'blocked',
        error: 'Failed to load the EX.CO player',
      }),
    }),
  ]);

  const { container: nextPost } = renderWidget('player-blocked', {
    excoPlaylistId: undefined,
    post: { id: 'p2' },
  });
  expect(nextPost).toBeEmptyDOMElement();
});

it('collapses and logs when the script never finishes loading', async () => {
  jest.useFakeTimers();
  renderWidget('player-timeout');
  expect(getContainer()).toBeInTheDocument();

  await act(() => jest.advanceTimersByTimeAsync(15_000));
  jest.useRealTimers();

  expect(getContainer()).not.toBeInTheDocument();
  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({
        reason: 'timeout',
        error: 'The EX.CO player script timed out',
      }),
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

it('logs what went wrong in content and ad errors', async () => {
  const { player, emit } = createPlayer();
  renderWidget('player-errors');
  loadScript('player-errors');
  await waitFor(() => expect(player.init).toHaveBeenCalled());

  emit('content-error', { id: 'v1', error: new Error('Media failed') });
  emit('ad-error', { code: 402, message: 'VAST timeout' } as ExcoEventData);
  emit('content-error', {});

  expect(getLogged(LogEvent.VideoPlayerError)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({
        reason: 'content_error',
        error: 'Media failed',
        error_fields: 'error,id',
      }),
    }),
    expect.objectContaining({
      extra: expect.objectContaining({
        reason: 'content_error',
        error: null,
        error_fields: '',
      }),
    }),
  ]);
  expect(getLogged(LogEvent.AdSlotError)).toEqual([
    expect.objectContaining({
      extra: expect.objectContaining({
        error_type: 'ad_error',
        error: '402: VAST timeout',
        error_fields: 'code,message',
      }),
    }),
  ]);
});
