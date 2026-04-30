import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const mockUseLiveRoomConnection = jest.fn<LiveRoomContextValue, []>();
const mockUseLiveRoomQuery = jest.fn();
const mockUseAuthContext = jest.fn();
const mockUseLiveRoomParticipantStreams = jest.fn();
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

jest.mock('../../hooks/liveRooms/useLiveRoomParticipantStreams', () => ({
  useLiveRoomParticipantStreams: (...args: unknown[]) =>
    mockUseLiveRoomParticipantStreams(...args),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../graphql/users', () => ({
  getUserShortInfo: jest.fn(),
}));

jest.mock('./LiveRoomVideoTile', () => ({
  LiveRoomVideoTile: ({ user }: { user: { username: string } }) => (
    <div data-testid="live-room-tile">{`tile-${user.username}`}</div>
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
    chatPermissions: {},
    sessions: {},
    stage: {
      speakerQueueParticipantIds: ['queued1'],
      activeSpeakerParticipantIds: ['speaker1', 'speaker2'],
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
  joinStage: jest.fn(),
  leaveStage: jest.fn(),
  sendReaction: jest.fn(),
  sendChatMessage: jest.fn(),
  deleteChatMessage: jest.fn(),
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
    mockUseLiveRoomParticipantStreams.mockReturnValue(new Map());
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

  it('renders every active speaker on stage instead of a single current speaker', () => {
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    expect(screen.getByText('tile-host')).toBeInTheDocument();
    expect(screen.getByText('tile-speaker1')).toBeInTheDocument();
    expect(screen.getByText('tile-speaker2')).toBeInTheDocument();
  });

  it('uses the room creation time as the timer reference after refresh', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-27T09:05:07.000Z'));
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    await waitFor(() => {
      expect(screen.getByText('05:07')).toBeInTheDocument();
    });
  });

  it('does not render a placeholder tile when only the host is visible on stage', () => {
    mockUseLiveRoomConnection.mockReturnValue(
      createContextValue({
        roomState: {
          ...createContextValue().roomState!,
          stage: {
            speakerQueueParticipantIds: ['queued1'],
            activeSpeakerParticipantIds: [],
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

  it('renders chat messages with sanitized markdown and send controls', () => {
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
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
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
          },
        },
      }),
    );

    renderLiveRoom();

    expect(screen.getByText('Page 1 / 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(12);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Page 2 / 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));

    expect(screen.getByText('Page 1 / 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('live-room-tile')).toHaveLength(12);
  });
});
