import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { LiveRoom } from './LiveRoom';

const mockPush = jest.fn();
const mockDisplayToast = jest.fn();
const mockUseLiveRoomConnection = jest.fn<LiveRoomContextValue, []>();
const mockUseLiveRoomQuery = jest.fn();
const mockUseAuthContext = jest.fn();

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

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../graphql/users', () => ({
  getUserShortInfo: jest.fn(),
}));

jest.mock('./LiveRoomVideoTile', () => ({
  LiveRoomVideoTile: ({ user }: { user: { username: string } }) => (
    <div>{`tile-${user.username}`}</div>
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

describe('LiveRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: true,
      showLogin: jest.fn(),
      user: { id: 'user-1' },
    });
    mockUseLiveRoomQuery.mockReturnValue({
      data: {
        id: 'room-1',
        topic: 'Queue changes',
        status: 'live',
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

    fireEvent.click(screen.getByRole('button', { name: 'Remove @speaker1' }));

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

  it('allows anonymous users to load the live room', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: false,
      showLogin: jest.fn(),
      user: undefined,
    });
    mockUseLiveRoomConnection.mockReturnValue(createContextValue());

    renderLiveRoom();

    expect(
      screen.queryByText('Sign in to join this live room'),
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
});
