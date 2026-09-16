import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useViewSize } from '@dailydotdev/shared/src/hooks';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { WorldView } from '../../components/world/WorldView';
import type { UserWorldResult } from '../../components/world/useUserWorld';
import type { WorldEngine } from '../../components/world/worldState';
import { createWorldEngine } from '../../components/world/engine/world';

const mockLogEvent = jest.fn();
jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/LogContext'),
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../components/world/engine/world', () => ({
  createWorldEngine: jest.fn(),
}));

jest.mock('../../components/world/engine/buildWorld', () => ({
  buildWorld: () => ({ user: 'owner', replayable: false, nT: 1 }),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSize: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/contexts/SettingsContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/SettingsContext'),
  useSettingsContext: () => ({ autoDismissNotifications: true }),
}));

jest.mock('../../components/world/useWorldDraft', () => ({
  useWorldDraft: () => ({ isOpen: false, applied: undefined }),
}));

jest.mock('../../components/world/useWorldPlate', () => ({
  useWorldPlate: jest.fn(),
}));

jest.mock('../../components/world/useWorldMusic', () => ({
  RIDE_MUTED_KEY: 'ride:muted',
  useWorldMusic: jest.fn(),
}));

jest.mock('../../components/world/useWorldIntro', () => ({
  useWorldIntro: () => ({ step: null, dismiss: jest.fn() }),
}));

jest.mock('../../components/world/useWorldAuthoring', () => ({
  authoringEndpoint: () => 'http://localhost:4321',
  useWorldAuthoring: () => ({ unsaved: 0 }),
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

const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext',
);

const mockCanvasContext = (getContext: jest.Mock) => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: getContext,
  });
};

const createEngine = (
  load: WorldEngine['load'] = jest.fn().mockResolvedValue(undefined),
): WorldEngine =>
  ({
    load,
    attachHistory: jest.fn(() => false),
    play: jest.fn(),
    pause: jest.fn(),
    toggle: jest.fn(),
    seek: jest.fn(),
    toStart: jest.fn(),
    toEnd: jest.fn(),
    setSpeed: jest.fn(),
    focus: jest.fn(),
    deselect: jest.fn(),
    replaceAuthored: jest.fn(),
    patchAuthored: jest.fn(),
    leaveRealm: jest.fn(),
    frameWorld: jest.fn(),
    attachSpark: jest.fn(),
    setPadding: jest.fn(),
    setLook: jest.fn(),
    setCrest: jest.fn(),
    setSky: jest.fn(),
    setLevelProgress: jest.fn(),
    setViewFlags: jest.fn(),
    capture: jest.fn(() => ''),
    dispose: jest.fn(),
  } as unknown as WorldEngine);

const renderWorld = (overrides: Partial<UserWorldResult> = {}) => {
  const client = new QueryClient();
  const tree = (next: Partial<UserWorldResult>) => (
    <QueryClientProvider client={client}>
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
        <WorldView user={owner} world={{ ...world, ...next }} />
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  const view = render(tree(overrides));

  return {
    ...view,
    /* The districts coming back, on the component that is already mounted:
       a fresh render would be a fresh boot, which is the ordering this file
       exists to rule out. */
    settle: (next: Partial<UserWorldResult> = {}) => view.rerender(tree(next)),
  };
};

const events = () => mockLogEvent.mock.calls.map(([event]) => event);

const eventsByName = (eventName: LogEvent) =>
  events().filter(({ event_name: name }) => name === eventName);

const extraOf = (event: { extra?: string }) =>
  JSON.parse(event.extra ?? '{}') as Record<string, unknown>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
});

afterEach(() => {
  if (originalGetContext) {
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      'getContext',
      originalGetContext,
    );
  }
});

describe('WorldView boot failures', () => {
  it('handles missing WebGL support without logging a global error', async () => {
    mockCreateEngine.mockImplementation(() => {
      throw new Error('Error creating WebGL context.');
    });
    mockCanvasContext(jest.fn(() => null));
    const onError = jest.fn();
    window.addEventListener('error', onError);

    const view = renderWorld();

    await screen.findByText(/This browser can't render 3D worlds/);
    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(eventsByName(LogEvent.GlobalError)).toHaveLength(0);
    expect(onError).not.toHaveBeenCalled();
    expect(extraOf(failure)).toEqual(
      expect.objectContaining({
        kind: 'unsupported',
        reason: 'Error creating WebGL context.',
      }),
    );
    expect(() => view.unmount()).not.toThrow();
    window.removeEventListener('error', onError);
  });

  /* The real ordering on a browser with no WebGL: the constructor throws in the
     mount commit, while the districts query is still on the wire, so the failure
     is standing before there is a view for it to resolve. */
  it('reports the outcome when WebGL fails before the districts settle', async () => {
    mockCreateEngine.mockImplementation(() => {
      throw new Error('Error creating WebGL context.');
    });
    mockCanvasContext(jest.fn(() => null));

    const view = renderWorld({ isPending: true, districts: undefined });

    await screen.findByText(/This browser can't render 3D worlds/);
    expect(events()).toHaveLength(0);

    view.settle();

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );
    expect(eventsByName(LogEvent.WorldView)).toHaveLength(1);
    expect(extraOf(eventsByName(LogEvent.WorldBootFailed)[0])).toEqual(
      expect.objectContaining({ kind: 'unsupported' }),
    );
  });

  it('leaves nothing of a half-built engine in the mount node', async () => {
    let mount: HTMLElement | null = null;
    mockCreateEngine.mockImplementation(
      (options: { container: HTMLElement }) => {
        /* What the engine really does before it builds the renderer: its root and
         an injected <style> are in the container by the time it throws. */
        mount = options.container;
        mount.appendChild(document.createElement('div'));
        throw new Error('Error creating WebGL context.');
      },
    );
    mockCanvasContext(jest.fn(() => null));

    renderWorld();

    await screen.findByText(/This browser can't render 3D worlds/);
    expect(mount).not.toBeNull();
    expect(mount!.childNodes).toHaveLength(0);
  });

  it('logs context-limit when WebGL exists but the engine context was refused', async () => {
    mockCreateEngine.mockImplementation(() => {
      throw new Error('Error creating WebGL context.');
    });
    mockCanvasContext(
      jest.fn(() => ({
        getExtension: jest.fn(() => ({ loseContext: jest.fn() })),
      })),
    );

    renderWorld();

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(extraOf(failure)).toEqual(
      expect.objectContaining({
        kind: 'context-limit',
        reason: 'Error creating WebGL context.',
      }),
    );
    expect(
      screen.queryByText(/This browser can't render 3D worlds/),
    ).not.toBeInTheDocument();
  });

  it('keeps engine load rejection as an engine boot failure with generic copy', async () => {
    mockCreateEngine.mockReturnValue(
      createEngine(
        jest.fn().mockRejectedValue(new Error('terrain failed')),
      ) as never,
    );

    renderWorld();

    await screen.findByText(
      'This world could not be loaded right now. Try again in a moment.',
    );
    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(extraOf(failure)).toEqual(
      expect.objectContaining({
        kind: 'engine',
        reason: 'terrain failed',
      }),
    );
    expect(
      screen.queryByText(/This browser can't render 3D worlds/),
    ).not.toBeInTheDocument();
  });
});
