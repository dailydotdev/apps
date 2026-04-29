import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { LiveRoomControls } from './LiveRoomControls';
import { AuthTriggers } from '../../lib/auth';

const mockUseLiveRoom = jest.fn<LiveRoomContextValue, []>();
const mockDisplayToast = jest.fn();
const mockShowLogin = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('../../contexts/LiveRoomContext', () => ({
  useLiveRoom: () => mockUseLiveRoom(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
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
    ariaLabel,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    ariaLabel?: string;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
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
      audience: {
        participantId: 'audience',
        role: 'audience',
        sessionIds: ['session-audience'],
        joinedAt: '2026-04-27T09:01:00.000Z',
        updatedAt: '2026-04-27T09:01:00.000Z',
      },
    },
    chatPermissions: {},
    sessions: {},
    stage: {
      speakerQueueParticipantIds: [],
      activeSpeakerParticipantIds: [],
    },
    mediaPublications: {},
    mediaRuntimeOwner: null,
    createdAt: '2026-04-27T09:00:00.000Z',
    updatedAt: '2026-04-27T09:00:00.000Z',
  },
  role: 'audience',
  participantId: 'audience',
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
  canPublish: false,
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

const createRoomState = (): NonNullable<LiveRoomContextValue['roomState']> => {
  const { roomState } = createContextValue();
  if (!roomState) {
    throw new Error('Expected default room state');
  }
  return roomState;
};

const renderLiveRoomControls = () => {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <LiveRoomControls onLeave={jest.fn()} />
    </QueryClientProvider>,
  );
};

describe('LiveRoomControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      user: { id: 'viewer-1' },
      showLogin: mockShowLogin,
    });
  });

  it('lets an audience participant join the speaker queue', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(createContextValue({ joinSpeakerQueue }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Join queue' }));

    expect(joinSpeakerQueue).toHaveBeenCalledTimes(1);
  });

  it('shows queued audience state without requeueing', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        joinSpeakerQueue,
        roomState: {
          ...createRoomState(),
          stage: {
            speakerQueueParticipantIds: ['audience'],
            activeSpeakerParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoomControls();

    const queuedButton = screen.getByRole('button', { name: 'Queued' });
    expect(queuedButton).toBeDisabled();
    fireEvent.click(queuedButton);
    expect(joinSpeakerQueue).not.toHaveBeenCalled();
  });

  it('sends emoji reactions through the live room command path', () => {
    const sendReaction = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(createContextValue({ sendReaction }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    fireEvent.click(screen.getByRole('button', { name: 'React 🔥' }));

    expect(sendReaction).toHaveBeenCalledWith('🔥');
  });

  it('sends custom emoji reactions through the emoji picker', () => {
    const sendReaction = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(createContextValue({ sendReaction }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Custom reaction' }));
    fireEvent.click(screen.getByRole('button', { name: '⭐' }));

    expect(sendReaction).toHaveBeenCalledWith('⭐');
  });

  it('prompts anonymous viewers to sign up instead of joining the queue', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    mockUseAuthContext.mockReturnValue({
      user: undefined,
      showLogin: mockShowLogin,
    });
    mockUseLiveRoom.mockReturnValue(createContextValue({ joinSpeakerQueue }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Join queue' }));

    expect(joinSpeakerQueue).not.toHaveBeenCalled();
    expect(mockShowLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
    });
  });

  it('lets an audience participant join the stage in a free-for-all room', () => {
    const joinStage = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        joinStage,
        roomState: {
          ...createRoomState(),
          mode: 'free_for_all',
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: [],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Join stage' }));

    expect(joinStage).toHaveBeenCalledTimes(1);
  });

  it('lets a speaker leave the stage in a free-for-all room', () => {
    const leaveStage = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        leaveStage,
        role: 'speaker',
        roomState: {
          ...createRoomState(),
          mode: 'free_for_all',
          participants: {
            ...createRoomState().participants,
            audience: {
              participantId: 'audience',
              role: 'speaker',
              sessionIds: ['session-audience'],
              joinedAt: '2026-04-27T09:01:00.000Z',
              updatedAt: '2026-04-27T09:01:00.000Z',
            },
          },
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['audience'],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Leave stage' }));

    expect(leaveStage).toHaveBeenCalledTimes(1);
  });

  it('keeps the leave-stage control visible while a reaction is pending', async () => {
    let resolveReaction: (() => void) | undefined;
    const sendReaction = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveReaction = resolve;
        }),
    );
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        sendReaction,
        role: 'speaker',
        canPublish: true,
        roomState: {
          ...createRoomState(),
          mode: 'free_for_all',
          participants: {
            ...createRoomState().participants,
            audience: {
              participantId: 'audience',
              role: 'speaker',
              sessionIds: ['session-audience'],
              joinedAt: '2026-04-27T09:01:00.000Z',
              updatedAt: '2026-04-27T09:01:00.000Z',
            },
          },
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['audience'],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    fireEvent.click(screen.getByRole('button', { name: 'React 🔥' }));

    expect(screen.getByRole('button', { name: 'Leave stage' })).toBeVisible();

    resolveReaction?.();

    await waitFor(() => {
      expect(sendReaction).toHaveBeenCalledWith('🔥');
    });
  });

  it('shows a full-stage state instead of allowing another join in free-for-all mode', () => {
    const joinStage = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        joinStage,
        roomState: {
          ...createRoomState(),
          mode: 'free_for_all',
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['speaker-1', 'speaker-2'],
            speakerLimit: 2,
          },
        },
      }),
    );

    renderLiveRoomControls();

    const fullButton = screen.getByRole('button', { name: 'Stage full' });
    expect(fullButton).toBeDisabled();
    fireEvent.click(fullButton);
    expect(joinStage).not.toHaveBeenCalled();
  });

  it('prompts anonymous viewers to sign up instead of opening reactions', () => {
    const sendReaction = jest.fn().mockResolvedValue(undefined);
    mockUseAuthContext.mockReturnValue({
      user: undefined,
      showLogin: mockShowLogin,
    });
    mockUseLiveRoom.mockReturnValue(createContextValue({ sendReaction }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));

    expect(sendReaction).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'React 🔥' }),
    ).not.toBeInTheDocument();
    expect(mockShowLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
    });
  });

  it('keeps host controls separate from the audience queue button', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'host',
        participantId: 'host',
        canPublish: true,
      }),
    );

    renderLiveRoomControls();

    expect(
      screen.getByRole('button', { name: 'End room' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join queue' }),
    ).not.toBeInTheDocument();
  });

  it('shows media controls when the current participant becomes a speaker', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        canPublish: true,
        roomState: {
          ...createRoomState(),
          participants: {
            ...createRoomState().participants,
            audience: {
              ...createRoomState().participants.audience,
              role: 'speaker',
            },
          },
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: ['audience'],
          },
        },
      }),
    );

    renderLiveRoomControls();

    expect(screen.getByRole('button', { name: 'Mic off' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Camera off' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join queue' }),
    ).not.toBeInTheDocument();
  });

  it('shows built-in microphone settings in the mic menu', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        canPublish: true,
      }),
    );

    renderLiveRoomControls();

    expect(
      screen.getByLabelText('Reduce background noise'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Prevent speaker echo')).toBeInTheDocument();
    expect(screen.getByLabelText('Keep my volume steady')).toBeInTheDocument();
  });

  it('updates microphone settings from the mic menu', () => {
    const setMicSetting = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        canPublish: true,
        setMicSetting,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByLabelText('Reduce background noise'));

    expect(setMicSetting).toHaveBeenCalledWith('noiseSuppression', false);
  });

  it('updates the camera self-view setting from the video menu', () => {
    const setVideoSetting = jest.fn();
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        canPublish: true,
        setVideoSetting,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByLabelText('Hide my preview'));

    expect(setVideoSetting).toHaveBeenCalledWith('hideSelfView', true);
  });
});
