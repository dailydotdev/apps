import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from '@tanstack/react-query';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { LiveRoom } from './LiveRoom';

const mockPush = jest.fn();
const mockDisplayToast = jest.fn();
const mockLogEvent = jest.fn();
const mockUseLiveRoomConnection = jest.fn<LiveRoomContextValue, []>();
const mockUseLiveRoomQuery = jest.fn();
const mockUseAuthContext = jest.fn();
const mockUseLiveRoomParticipantStreams = jest.fn();
const mockUseLiveRoomSubscription = jest.fn();
const mockUsePushNotificationContext = jest.fn();
const mockSubscribeToLiveRoom = jest.fn();
const mockUnsubscribeFromLiveRoom = jest.fn();
const mockEnablePush = jest.fn();
const mockShareOrCopyStandup = jest.fn();
const mockUseShareOrCopyLink = jest.fn();
const mockUseViewSize = jest.fn<boolean, [unknown]>(() => true);
const mockUseQueries = useQueries as jest.Mock;

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueries: jest.fn(),
  };
});

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../../contexts/LiveRoomContext', () => ({
  LiveRoomProvider: ({ children }: { children: React.ReactNode }) => children,
  useLiveRoom: () => mockUseLiveRoomConnection(),
}));

jest.mock('../../hooks/liveRooms/useLiveRoom', () => ({
  useLiveRoom: (...args: unknown[]) => mockUseLiveRoomQuery(...args),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/liveRooms/useLiveRoomParticipantStreams', () => ({
  useLiveRoomParticipantStreams: (...args: unknown[]) =>
    mockUseLiveRoomParticipantStreams(...args),
}));

jest.mock('../../hooks/liveRooms/useLiveRoomSubscription', () => ({
  useLiveRoomSubscription: (...args: unknown[]) =>
    mockUseLiveRoomSubscription(...args),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

jest.mock('../../hooks/notifications/usePushNotificationMutation', () => ({
  usePushNotificationMutation: () => ({ onEnablePush: mockEnablePush }),
}));

jest.mock('../../hooks/useShareOrCopyLink', () => ({
  useShareOrCopyLink: (...args: unknown[]) => mockUseShareOrCopyLink(...args),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../hooks', () => {
  const actual = jest.requireActual('../../hooks');
  return {
    ...actual,
    useViewSize: (size: unknown) => mockUseViewSize(size),
  };
});

jest.mock('../../graphql/users', () => ({
  getUserShortInfo: jest.fn(),
}));

jest.mock('./LiveRoomVideoTile', () => ({
  LiveRoomVideoTile: ({
    user,
    raisedHandQueuePosition,
  }: {
    user: { username: string };
    raisedHandQueuePosition?: number;
  }) => (
    <div data-testid="live-room-tile">
      {`tile-${user.username}`}
      {raisedHandQueuePosition ? (
        <span>{`hand-${user.username}-${raisedHandQueuePosition}`}</span>
      ) : null}
    </div>
  ),
}));

jest.mock('./LiveRoomControls', () => ({
  LiveRoomControls: () => <div>controls</div>,
}));

jest.mock('../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

const createContextValue = (
  overrides: Partial<LiveRoomContextValue> = {},
): LiveRoomContextValue => ({
  status: 'connected',
  errorMessage: null,
  roomState: {
    roomId: 'room-1',
    mode: 'moderated',
    status: 'live',
    version: 1,
    participants: {
      host: {
        participantId: 'host',
        role: 'host',
        sessionIds: ['session-host'],
        joinedAt: '2026-04-27T09:00:00.000Z',
        updatedAt: '2026-04-27T09:00:00.000Z',
      },
      speaker1: {
        participantId: 'speaker1',
        role: 'speaker',
        sessionIds: ['session-speaker1'],
        joinedAt: '2026-04-27T09:01:00.000Z',
        updatedAt: '2026-04-27T09:01:00.000Z',
      },
      speaker2: {
        participantId: 'speaker2',
        role: 'speaker',
        sessionIds: ['session-speaker2'],
        joinedAt: '2026-04-27T09:02:00.000Z',
        updatedAt: '2026-04-27T09:02:00.000Z',
      },
      queued1: {
        participantId: 'queued1',
        role: 'audience',
        sessionIds: ['session-queued1'],
        joinedAt: '2026-04-27T09:03:00.000Z',
        updatedAt: '2026-04-27T09:03:00.000Z',
      },
    },
    coHostParticipantIds: [],
    chatPermissions: {},
    sessions: {},
    stage: {
      speakerQueueParticipantIds: ['queued1'],
      activeSpeakerParticipantIds: ['speaker1', 'speaker2'],
      raisedHandParticipantIds: [],
    },
    mediaPublications: {},
    mediaRuntimeOwner: null,
    createdAt: '2026-04-27T09:00:00.000Z',
    updatedAt: '2026-04-27T09:00:00.000Z',
  },
  role: 'host',
  participantId: 'host',
  startRoom: jest.fn(),
  endRoom: jest.fn(),
  joinSpeakerQueue: jest.fn(),
  raiseHand: jest.fn(),
  removeHand: jest.fn(),
  joinStage: jest.fn(),
  leaveStage: jest.fn(),
  sendReaction: jest.fn(),
  sendChatMessage: jest.fn(),
  deleteChatMessage: jest.fn(),
  sendChatMessageReaction: jest.fn(),
  removeChatMessageReaction: jest.fn(),
  grantCoHost: jest.fn(),
  revokeCoHost: jest.fn(),
  setParticipantChatEnabled: jest.fn(),
  promoteSpeaker: jest.fn(),
  removeSpeaker: jest.fn(),
  kickParticipant: jest.fn(),
  canChat: true,
  canPublish: true,
  isCameraOn: false,
  isMicOn: false,
  isCameraPublishing: false,
  isMicPublishing: false,
  toggleCamera: jest.fn(),
  toggleMic: jest.fn(),
  cameras: [],
  microphones: [],
  selectedCameraId: null,
  selectedMicId: null,
  micSettings: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  micSettingSupport: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  setMicSetting: jest.fn(),
  videoSettings: {
    audioOnly: false,
    quality: 'auto',
    hideSelfView: false,
  },
  setVideoSetting: jest.fn(),
  selectCamera: jest.fn(),
  selectMic: jest.fn(),
  localStream: null,
  remoteStreams: [],
  reactions: [],
  chatMessages: [],
  ...overrides,
});

const renderLiveRoom = () => {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <LiveRoom roomId="room-1" />
    </QueryClientProvider>,
  );
};

const createParticipant = (
  participantId: string,
  role: 'host' | 'speaker' | 'audience' = 'speaker',
) => ({
  participantId,
  role,
  sessionIds: [`session-${participantId}`],
  joinedAt: '2026-04-27T09:00:00.000Z',
  updatedAt: '2026-04-27T09:00:00.000Z',
});

describe('LiveRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseViewSize.mockReturnValue(true);
    mockUseLiveRoomParticipantStreams.mockReturnValue(new Map());
    mockSubscribeToLiveRoom.mockResolvedValue({});
    mockUnsubscribeFromLiveRoom.mockResolvedValue({});
    mockEnablePush.mockResolvedValue(true);
    mockShareOrCopyStandup.mockResolvedValue(undefined);
    mockUseShareOrCopyLink.mockReturnValue([false, mockShareOrCopyStandup]);
    mockUseLiveRoomSubscription.mockReturnValue({
      subscribe: { mutateAsync: mockSubscribeToLiveRoom, isPending: false },
      unsubscribe: {
        mutateAsync: mockUnsubscribeFromLiveRoom,
        isPending: false,
      },
    });
    mockUsePushNotificationContext.mockReturnValue({
      isPushSupported: true,
      isInitialized: true,
      isSubscribed: false,
      isLoading: false,
      shouldOpenPopup: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    });
    mockUseQueries.mockImplementation(({ queries }) =>
      queries.map(({ queryKey }: { queryKey: readonly unknown[] }) => {
        const participantId = queryKey[queryKey.length - 1] as string;
        return {
          data: {
            id: participantId,
            username: participantId,
            name: participantId,
            image: '',
            permalink: '#',
            createdAt: '',
            reputation: 0,
          },
        };
      }),
    );
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: true,
      showLogin: jest.fn(),
      user: { id: 'user-1' },
    });
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        createdAt: '2026-04-27T09:00:00.000Z',
        updatedAt: '2026-04-27T09:00:00.000Z',
        topic: 'Queue changes',
        mode: 'moderated',
        status: 'live',
        startedAt: '2026-04-27T09:00:00.000Z',
        endedAt: null,
        scheduledStart: null,
        descriptionHtml: null,
        subscribed: false,
        contentEmbeds: [],
        host: {
          id: 'host',
          username: 'host',
          name: 'Host',
          image: '',
          permalink: '#',
        },
      },
      error: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lets the host promote a specific queued participant and remove a specific active speaker', async () => {
    const promoteSpeaker = jest.fn().mockResolvedValue(undefined);
    const removeSpeaker = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({ promoteSpeaker, removeSpeaker }),
    );

    renderLiveRoom();

    fireEvent.click(screen.getByRole('tab', { name: /Queue/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Promote @queued1' }));

    await waitFor(() => {
      expect(promoteSpeaker).toHaveBeenCalledWith('queued1');
    });

    const removeSpeakerButton = screen.getByRole('button', {
      name: 'Remove @speaker1',
    });

    await waitFor(() => {
      expect(removeSpeakerButton).not.toBeDisabled();
    });

    fireEvent.click(removeSpeakerButton);

    await waitFor(() => {
      expect(removeSpeaker).toHaveBeenCalledWith('speaker1');
    });
  });

  it('lets the original host grant co-host from the queue panel', async () => {
    const grantCoHost = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({ grantCoHost }),
    );

    renderLiveRoom();

    fireEvent.click(screen.getByRole('tab', { name: /Queue/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Grant co-host to @queued1' }),
    );

    await waitFor(() => {
      expect(grantCoHost).toHaveBeenCalledWith('queued1');
    });
  });

  it('renders every active speaker on stage instead of a single current speaker', () => {
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    expect(screen.getByText('tile-host')).toBeInTheDocument();
    expect(screen.getByText('tile-speaker1')).toBeInTheDocument();
    expect(screen.getByText('tile-speaker2')).toBeInTheDocument();
  });

  it('passes raised hand queue positions to matching stage tiles', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          stage: {
            speakerQueueParticipantIds: ['queued1'],
            activeSpeakerParticipantIds: ['speaker1', 'speaker2'],
            raisedHandParticipantIds: ['speaker2', 'host'],
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getByText('hand-speaker2-1')).toBeInTheDocument();
    expect(screen.getByText('hand-host-2')).toBeInTheDocument();
    expect(screen.queryByText('hand-speaker1-')).not.toBeInTheDocument();
  });

  it('uses the room creation time as the timer reference after refresh', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-27T09:05:07.000Z'));
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    await waitFor(() => {
      expect(screen.getByText('05:07')).toBeInTheDocument();
    });
  });

  it('renders the scheduled lobby description instead of speaker tiles', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-04T09:00:00.000Z'));
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'user-1',
        canPublish: false,
        roomState: {
          ...createContextValue().roomState!,
          status: 'created',
          participants: {
            host: createParticipant('host', 'host'),
            'user-1': createParticipant('user-1', 'audience'),
          },
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: [],
            raisedHandParticipantIds: [],
          },
        },
      }),
    );
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        createdAt: '2026-05-04T08:55:00.000Z',
        updatedAt: '2026-05-04T08:55:00.000Z',
        topic: 'Lobby launch',
        mode: 'moderated',
        status: 'created',
        startedAt: null,
        endedAt: null,
        scheduledStart: '2026-05-04T11:00:00.000Z',
        descriptionHtml: '<p>Review launch notes</p>',
        subscribed: false,
        contentEmbeds: [],
        host: {
          id: 'host',
          username: 'host',
          name: 'Host',
          image: '',
          permalink: '#',
        },
      },
      error: null,
      isLoading: false,
    });

    renderLiveRoom();

    expect(screen.getByText('Review launch notes')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('02 hours 00 minutes 00 seconds'),
    );
    expect(screen.queryByTestId('live-room-tile')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remind me' }));

    await waitFor(() => {
      expect(mockSubscribeToLiveRoom).toHaveBeenCalledTimes(1);
    });
    expect(mockEnablePush).toHaveBeenCalledWith('standup lobby');
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'subscribe standup',
        target_id: 'room-1',
        extra: expect.stringContaining('"surface":"lobby_hero"'),
      }),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'subscribe standup',
        target_id: 'room-1',
        extra: expect.stringContaining('"pushEnabled":true'),
      }),
    );
  });

  it('lets subscribed users unsubscribe from a scheduled lobby', async () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'user-1',
        canPublish: false,
        roomState: {
          ...createContextValue().roomState!,
          status: 'created',
        },
      }),
    );
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        createdAt: '2026-05-04T08:55:00.000Z',
        updatedAt: '2026-05-04T08:55:00.000Z',
        topic: 'Lobby launch',
        mode: 'moderated',
        status: 'created',
        startedAt: null,
        endedAt: null,
        scheduledStart: '2026-05-04T11:00:00.000Z',
        descriptionHtml: null,
        subscribed: true,
        contentEmbeds: [],
        host: {
          id: 'host',
          username: 'host',
          name: 'Host',
          image: '',
          permalink: '#',
        },
      },
      error: null,
      isLoading: false,
    });

    renderLiveRoom();

    fireEvent.click(screen.getByRole('button', { name: 'Reminder set' }));

    await waitFor(() => {
      expect(mockUnsubscribeFromLiveRoom).toHaveBeenCalledTimes(1);
    });
    expect(mockEnablePush).not.toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'unsubscribe standup',
        target_id: 'room-1',
        extra: expect.stringContaining('"surface":"lobby_hero"'),
      }),
    );
  });

  it('uses the shared share action without logging a duplicate event locally', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'user-1',
        canPublish: false,
        roomState: {
          ...createContextValue().roomState!,
          status: 'created',
        },
      }),
    );
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        createdAt: '2026-05-04T08:55:00.000Z',
        updatedAt: '2026-05-04T08:55:00.000Z',
        topic: 'Lobby launch',
        mode: 'moderated',
        status: 'created',
        startedAt: null,
        endedAt: null,
        scheduledStart: '2026-05-04T11:00:00.000Z',
        descriptionHtml: null,
        subscribed: false,
        contentEmbeds: [],
        host: {
          id: 'host',
          username: 'host',
          name: 'Host',
          image: '',
          permalink: '#',
        },
      },
      error: null,
      isLoading: false,
    });

    renderLiveRoom();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    expect(mockShareOrCopyStandup).toHaveBeenCalledTimes(1);
    expect(mockUseShareOrCopyLink).toHaveBeenCalledWith(
      expect.objectContaining({
        link: 'http://localhost/standups/room-1',
      }),
    );
    expect(mockLogEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'share standup',
      }),
    );
  });

  it('does not render a placeholder tile when only the host is visible on stage', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          stage: {
            speakerQueueParticipantIds: ['queued1'],
            activeSpeakerParticipantIds: [],
            raisedHandParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(1);
    expect(screen.getByText('tile-host')).toBeInTheDocument();
    expect(
      screen.queryByText('Waiting for the next speaker'),
    ).not.toBeInTheDocument();
  });

  it('hides the current participant tile when self view is disabled', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        participantId: 'host',
        videoSettings: {
          audioOnly: false,
          quality: 'auto',
          hideSelfView: true,
        },
      }),
    );

    renderLiveRoom();

    expect(screen.queryByText('tile-host')).not.toBeInTheDocument();
    expect(screen.getAllByText(/^tile-/)).toHaveLength(2);
  });

  it('drops remote video streams before building participant tiles in audio only mode', () => {
    const audioStream = { id: 'audio-stream' } as MediaStream;
    const videoStream = { id: 'video-stream' } as MediaStream;

    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        participantId: 'host',
        remoteStreams: [
          {
            participantId: 'speaker1',
            publicationId: 'pub-audio',
            kind: 'audio',
            stream: audioStream,
          },
          {
            participantId: 'speaker1',
            publicationId: 'pub-video',
            kind: 'video',
            stream: videoStream,
          },
        ],
        videoSettings: {
          audioOnly: true,
          quality: 'auto',
          hideSelfView: false,
        },
      }),
    );

    renderLiveRoom();

    expect(mockUseLiveRoomParticipantStreams).toHaveBeenCalledWith(
      [
        {
          participantId: 'speaker1',
          publicationId: 'pub-audio',
          kind: 'audio',
          stream: audioStream,
        },
      ],
      null,
      'host',
    );
  });

  it('switches the side panel to audience mode for free-for-all rooms', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          mode: 'free_for_all',
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['speaker1'],
            raisedHandParticipantIds: [],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getByRole('tab', { name: /Audience/ })).toBeInTheDocument();
  });

  it('allows anonymous users to load the standup', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: false,
      showLogin: jest.fn(),
      user: undefined,
    });
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    expect(
      screen.queryByText('Sign in to join this standup'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('tile-host')).toBeInTheDocument();
  });

  it('renders chat messages with sanitized markdown and send controls', async () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: '# heading **hello** [daily](https://daily.dev)',
            createdAt: '2026-04-27T09:04:00.000Z',
          },
        ],
      }),
    );

    renderLiveRoom();

    expect(screen.getByText('@speaker1')).toBeInTheDocument();
    expect(screen.getByText('# heading')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'daily' })).toHaveAttribute(
        'target',
        '_blank',
      ),
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('keeps other chat reactions clickable while one reaction is still pending', async () => {
    let resolveFirstReaction = (): void => undefined;
    const firstReactionPromise = new Promise<void>((resolve) => {
      resolveFirstReaction = resolve;
    });
    const sendChatMessageReaction = jest
      .fn()
      .mockImplementation(() => firstReactionPromise);
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        sendChatMessageReaction,
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: 'hello',
            createdAt: '2026-04-27T09:04:00.000Z',
          },
        ],
      }),
    );

    renderLiveRoom();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'React 🔥 to message from @speaker1',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'React 👀 to message from @speaker1',
      }),
    );

    expect(sendChatMessageReaction).toHaveBeenNthCalledWith(
      1,
      'message-1',
      '🔥',
    );
    expect(sendChatMessageReaction).toHaveBeenNthCalledWith(
      2,
      'message-1',
      '👀',
    );

    await act(async () => {
      resolveFirstReaction();
      await firstReactionPromise;
    });
  });

  it('always shows all quick reactions and toggles a reacted emoji off when clicked', async () => {
    const sendChatMessageReaction = jest.fn().mockResolvedValue(undefined);
    const removeChatMessageReaction = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        sendChatMessageReaction,
        removeChatMessageReaction,
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: 'hello',
            createdAt: '2026-04-27T09:04:00.000Z',
            reactions: [
              {
                messageId: 'message-1',
                participantId: 'host',
                key: '🔥',
                createdAt: '2026-04-27T09:05:00.000Z',
              },
              {
                messageId: 'message-1',
                participantId: 'speaker2',
                key: '🔥',
                createdAt: '2026-04-27T09:05:01.000Z',
              },
              {
                messageId: 'message-1',
                participantId: 'speaker2',
                key: '💡',
                createdAt: '2026-04-27T09:05:02.000Z',
              },
              {
                messageId: 'message-1',
                participantId: 'speaker2',
                key: '😂',
                createdAt: '2026-04-27T09:05:03.000Z',
              },
            ],
          },
        ],
      }),
    );

    renderLiveRoom();

    const fireRemoveButtons = screen.getAllByRole('button', {
      name: 'Remove 🔥 reaction from message from @speaker1',
    });
    expect(fireRemoveButtons).toHaveLength(2);
    expect(fireRemoveButtons[0]).toHaveTextContent('2');
    expect(
      screen.getByRole('button', {
        name: 'React 👀 to message from @speaker1',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'React 🚀 to message from @speaker1',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Custom reaction to message from @speaker1',
      }),
    ).toBeInTheDocument();

    fireEvent.click(fireRemoveButtons[0]);

    await waitFor(() =>
      expect(removeChatMessageReaction).toHaveBeenCalledWith('message-1', '🔥'),
    );
    expect(sendChatMessageReaction).not.toHaveBeenCalledWith('message-1', '🔥');
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'remove standup chat reaction',
        target_id: 'message-1',
        extra: expect.stringContaining('"source":"active_chip"'),
      }),
    );
  });

  it('sends quick and custom chat reactions for messages without active reactions', async () => {
    const sendChatMessageReaction = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        sendChatMessageReaction,
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: 'hello',
            createdAt: '2026-04-27T09:04:00.000Z',
          },
        ],
      }),
    );

    renderLiveRoom();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'React 🔥 to message from @speaker1',
      }),
    );

    await waitFor(() =>
      expect(sendChatMessageReaction).toHaveBeenCalledWith('message-1', '🔥'),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'send standup chat reaction',
        target_id: 'message-1',
        extra: expect.stringContaining('"source":"quick_shortcut"'),
      }),
    );

    const customReactionButton = screen.getByRole('button', {
      name: 'Custom reaction to message from @speaker1',
    });
    await waitFor(() => expect(customReactionButton).toBeEnabled());

    fireEvent.click(customReactionButton);
    fireEvent.click(screen.getByTitle('grinning face'));

    await waitFor(() =>
      expect(sendChatMessageReaction).toHaveBeenCalledWith('message-1', '😀'),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'send standup chat reaction',
        target_id: 'message-1',
        extra: expect.stringContaining('"source":"custom_picker"'),
      }),
    );
  });

  it('shows host moderation controls for chat rows', async () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: 'hello',
            createdAt: '2026-04-27T09:04:00.000Z',
          },
        ],
      }),
    );

    renderLiveRoom();

    expect(
      screen.getByRole('button', { name: /Delete message/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kick user/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Revoke chat access/i }),
    ).toBeInTheDocument();
  });

  it('lets a co-host access host-only chat moderation controls', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'queued1',
        roomState: {
          ...createContextValue().roomState!,
          coHostParticipantIds: ['queued1'],
        },
        chatMessages: [
          {
            messageId: 'message-1',
            participantId: 'speaker1',
            body: 'hello',
            createdAt: '2026-04-27T09:04:00.000Z',
          },
        ],
      }),
    );

    renderLiveRoom();

    expect(
      screen.getByRole('button', { name: /Delete message/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kick user/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Revoke chat access/i }),
    ).toBeInTheDocument();
  });

  it('paginates stage tiles after the first 12 visible speakers', () => {
    const activeSpeakerParticipantIds = Array.from(
      { length: 12 },
      (_, index) => `speaker-${index + 1}`,
    );
    const participants = activeSpeakerParticipantIds.reduce<
      NonNullable<LiveRoomContextValue['roomState']>['participants']
    >(
      (acc, participantId) => ({
        ...acc,
        [participantId]: createParticipant(participantId),
      }),
      {
        host: createParticipant('host', 'host'),
      },
    );

    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          participants,
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds,
            raisedHandParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(12);

    fireEvent.click(
      screen.getByRole('tab', { name: 'Go to stage page 2 of 2' }),
    );

    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(1);

    fireEvent.click(
      screen.getByRole('tab', { name: 'Go to stage page 1 of 2' }),
    );

    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(12);
  });

  it('limits stage pagination to four visible speakers on mobile', () => {
    mockUseViewSize.mockReturnValue(false);
    const activeSpeakerParticipantIds = Array.from(
      { length: 12 },
      (_, index) => `speaker-${index + 1}`,
    );
    const participants = activeSpeakerParticipantIds.reduce<
      NonNullable<LiveRoomContextValue['roomState']>['participants']
    >(
      (acc, participantId) => ({
        ...acc,
        [participantId]: createParticipant(participantId),
      }),
      {
        host: createParticipant('host', 'host'),
      },
    );

    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          participants,
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds,
            raisedHandParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getByText('1/4')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(4);

    fireEvent.click(
      screen.getByRole('tab', { name: 'Go to stage page 2 of 4' }),
    );

    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(4);
  });

  it('logs a room query error only once for the same failure', () => {
    let contextValue = createContextValue({ selectedMicId: 'mic-1' });

    mockUseLiveRoomConnection.mockImplementation(() => contextValue);
    mockUseLiveRoomQuery.mockReturnValue({
      data: undefined,
      error: new Error('Room fetch failed'),
      isLoading: false,
    });

    const queryClient = new QueryClient();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <LiveRoom roomId="room-1" />
      </QueryClientProvider>,
    );

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'standup error',
        target_id: 'room query',
      }),
    );

    contextValue = createContextValue({ selectedMicId: 'mic-2' });

    rerender(
      <QueryClientProvider client={queryClient}>
        <LiveRoom roomId="room-1" />
      </QueryClientProvider>,
    );

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });
});
