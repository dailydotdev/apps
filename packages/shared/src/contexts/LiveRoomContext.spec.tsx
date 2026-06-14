import type { ReactNode } from 'react';
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveRoomProvider, useLiveRoom } from './LiveRoomContext';
import {
  readStoredLiveRoomResumeSession,
  writeStoredLiveRoomResumeSession,
} from '../lib/liveRoom/resumeSessionStorage';
import { gqlClient } from '../graphql/common';

const mockUseAuthContext = jest.fn();
const mockUseLogContext = jest.fn();
const mockUseLiveRoomQuery = jest.fn();
type MockConnectionInstance = {
  options: {
    token?: string;
    resumeToken?: string;
    url: string;
  };
  open: jest.Mock;
  close: jest.Mock;
  send: jest.Mock;
  onSessionReady: jest.Mock;
  onSnapshot: jest.Mock;
  onRoomUpdated: jest.Mock;
  onReactionSent: jest.Mock;
  onChatMessage: jest.Mock;
  onChatMessageDeleted: jest.Mock;
  onChatMessageReaction: jest.Mock;
  onChatMessageReactionRemoved: jest.Mock;
  onClose: jest.Mock;
  onError: jest.Mock;
  resumeToken: string | null;
};
const connectionInstances: MockConnectionInstance[] = [];

jest.mock('./AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('./LogContext', () => ({
  useLogContext: () => mockUseLogContext(),
}));

jest.mock('../hooks/liveRooms/useLiveRoom', () => ({
  useLiveRoom: (...args: unknown[]) => mockUseLiveRoomQuery(...args),
}));

jest.mock('../graphql/common', () => ({
  gqlClient: {
    request: jest.fn(),
  },
}));

function MockLiveRoomConnection(
  this: MockConnectionInstance,
  options: {
    token?: string;
    resumeToken?: string;
    url: string;
  },
): void {
  this.options = options;
  this.open = jest.fn();
  this.close = jest.fn();
  this.send = jest.fn();
  this.onSessionReady = jest.fn(() => jest.fn());
  this.onSnapshot = jest.fn(() => jest.fn());
  this.onRoomUpdated = jest.fn(() => jest.fn());
  this.onReactionSent = jest.fn(() => jest.fn());
  this.onChatMessage = jest.fn(() => jest.fn());
  this.onChatMessageDeleted = jest.fn(() => jest.fn());
  this.onChatMessageReaction = jest.fn(() => jest.fn());
  this.onChatMessageReactionRemoved = jest.fn(() => jest.fn());
  this.onClose = jest.fn(() => jest.fn());
  this.onError = jest.fn(() => jest.fn());
  this.resumeToken = null;
  connectionInstances.push(this);
}

jest.mock('../lib/liveRoom/connection', () => ({
  buildLiveRoomWsUrl: () => 'ws://example.test/flyting/ws',
  LiveRoomConnection: MockLiveRoomConnection,
}));

const createMockTrack = (kind: 'audio' | 'video'): MediaStreamTrack =>
  ({
    kind,
    readyState: 'live',
    enabled: true,
    stop: jest.fn(),
    addEventListener: jest.fn(),
  } as unknown as MediaStreamTrack);

class MockMediaStream {
  constructor(private readonly tracks: MediaStreamTrack[] = []) {}

  getAudioTracks(): MediaStreamTrack[] {
    return this.tracks.filter((track) => track.kind === 'audio');
  }

  getVideoTracks(): MediaStreamTrack[] {
    return this.tracks.filter((track) => track.kind === 'video');
  }
}

describe('LiveRoomContext', () => {
  let queryClient = new QueryClient();
  let latestContext: ReturnType<typeof useLiveRoom> | null = null;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const ContextProbe = (): null => {
    latestContext = useLiveRoom();
    return null;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    connectionInstances.length = 0;
    latestContext = null;
    jest.clearAllMocks();
    sessionStorage.clear();

    Object.defineProperty(global, 'MediaStream', {
      configurable: true,
      writable: true,
      value: MockMediaStream,
    });

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getSupportedConstraints: jest.fn().mockReturnValue({}),
        getUserMedia: jest.fn().mockResolvedValue({
          getAudioTracks: () => [createMockTrack('audio')],
          getVideoTracks: () => [],
        }),
      },
    });

    mockUseAuthContext.mockReturnValue({
      user: { id: 'user-1' },
      isAuthReady: true,
    });
    mockUseLogContext.mockReturnValue({
      logEvent: jest.fn(),
    });
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        status: 'live',
      },
      isLoading: false,
    });
    (gqlClient.request as jest.Mock).mockResolvedValue({
      liveRoomJoinToken: {
        token: 'fresh-token',
      },
    });
  });

  it('replaces a mismatched stored resume session with a fresh authenticated join token', async () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-1',
      participantId: 'tracking-anon-1',
      resumeToken: 'resume-token-1',
      ttlMs: 30_000,
      updatedAt: Date.now(),
    });

    render(
      <LiveRoomProvider roomId="room-1">
        <div>standup</div>
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => expect(gqlClient.request).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(connectionInstances).toHaveLength(1));

    expect(readStoredLiveRoomResumeSession('room-1')).toBeNull();
    expect(connectionInstances[0].options).toEqual(
      expect.objectContaining({
        token: 'fresh-token',
        url: 'ws://example.test/flyting/ws',
      }),
    );
    expect(connectionInstances[0].options.resumeToken).toBeUndefined();
  });

  it('does not fetch a join token or open a websocket for an ended standup', async () => {
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        status: 'ended',
      },
      isLoading: false,
    });

    render(
      <LiveRoomProvider roomId="room-1">
        <div>standup</div>
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => {
      expect(mockUseLiveRoomQuery).toHaveBeenCalledWith('room-1');
    });

    expect(gqlClient.request).not.toHaveBeenCalled();
    expect(connectionInstances).toHaveLength(0);
  });

  it('does not fetch a join token or open a websocket for anonymous community-moderated viewers', async () => {
    mockUseAuthContext.mockReturnValue({
      user: undefined,
      isAuthReady: true,
    });
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        mode: 'community_moderated',
        status: 'created',
      },
      isLoading: false,
    });
    writeStoredLiveRoomResumeSession({
      roomId: 'room-1',
      participantId: 'tracking-anon-1',
      resumeToken: 'resume-token-1',
      ttlMs: 30_000,
      updatedAt: Date.now(),
    });

    render(
      <LiveRoomProvider roomId="room-1">
        <div>standup</div>
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => {
      expect(readStoredLiveRoomResumeSession('room-1')).toBeNull();
    });

    expect(gqlClient.request).not.toHaveBeenCalled();
    expect(connectionInstances).toHaveLength(0);
  });

  it('only allows publishing in community-moderated rooms after quorum is live', async () => {
    render(
      <LiveRoomProvider roomId="room-1">
        <ContextProbe />
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => expect(connectionInstances).toHaveLength(1));

    const connection = connectionInstances[0];
    const handleSessionReady = connection.onSessionReady.mock.calls[0][0];
    const handleSnapshot = connection.onSnapshot.mock.calls[0][0];
    const handleRoomUpdated = connection.onRoomUpdated.mock.calls[0][0];
    const pendingRoom = {
      roomId: 'room-1',
      mode: 'community_moderated',
      status: 'created',
      activityStatus: 'pending',
      minParticipantsToGoLive: 3,
      version: 1,
      participants: {
        'speaker-1': {
          participantId: 'speaker-1',
          role: 'speaker',
          sessionIds: ['session-speaker-1'],
          joinedAt: '2026-05-12T10:00:00.000Z',
          updatedAt: '2026-05-12T10:00:00.000Z',
        },
      },
      coHostParticipantIds: [],
      chatPermissions: {},
      sessions: {},
      stage: {
        speakerQueueParticipantIds: [],
        activeSpeakerParticipantIds: ['speaker-1'],
        raisedHandParticipantIds: [],
      },
      mediaPublications: {},
      mediaRuntimeOwner: null,
      createdAt: '2026-05-12T10:00:00.000Z',
      updatedAt: '2026-05-12T10:00:00.000Z',
    };

    act(() => {
      handleSessionReady({
        roomId: 'room-1',
        participantId: 'speaker-1',
        role: 'speaker',
        resumeToken: 'resume-token-1',
        resumeSessionTtlMs: 30_000,
      });
      handleSnapshot({ room: pendingRoom });
    });

    await waitFor(() => expect(latestContext?.canPublish).toBe(false));

    act(() => {
      handleRoomUpdated({
        room: {
          ...pendingRoom,
          activityStatus: 'live',
          version: 2,
        },
      });
    });

    await waitFor(() => expect(latestContext?.canPublish).toBe(true));
  });

  it('lowers a raised hand after successfully unmuting', async () => {
    render(
      <LiveRoomProvider roomId="room-1">
        <ContextProbe />
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => expect(connectionInstances).toHaveLength(1));

    const connection = connectionInstances[0];
    connection.send.mockResolvedValue(undefined);

    const handleSessionReady = connection.onSessionReady.mock.calls[0][0];
    const handleSnapshot = connection.onSnapshot.mock.calls[0][0];

    act(() => {
      handleSessionReady({
        roomId: 'room-1',
        participantId: 'speaker-1',
        role: 'speaker',
        resumeToken: 'resume-token-1',
        resumeSessionTtlMs: 30_000,
      });
      handleSnapshot({
        room: {
          roomId: 'room-1',
          mode: 'moderated',
          status: 'live',
          version: 1,
          participants: {
            'speaker-1': {
              participantId: 'speaker-1',
              role: 'speaker',
              sessionIds: ['session-speaker-1'],
              joinedAt: '2026-05-12T10:00:00.000Z',
              updatedAt: '2026-05-12T10:00:00.000Z',
            },
          },
          coHostParticipantIds: [],
          chatPermissions: {},
          sessions: {},
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['speaker-1'],
            raisedHandParticipantIds: ['speaker-1'],
          },
          mediaPublications: {},
          mediaRuntimeOwner: null,
          createdAt: '2026-05-12T10:00:00.000Z',
          updatedAt: '2026-05-12T10:00:00.000Z',
        },
      });
    });

    await waitFor(() => expect(latestContext?.participantId).toBe('speaker-1'));

    await act(async () => {
      await latestContext?.toggleMic();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(connection.send).toHaveBeenCalledWith({
      type: 'stage.hand.remove',
    });
  });
});
