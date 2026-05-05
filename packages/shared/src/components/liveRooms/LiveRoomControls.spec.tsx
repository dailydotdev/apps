import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { LiveRoomControls } from './LiveRoomControls';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent } from '../../lib/log';

const mockUseLiveRoom = jest.fn<LiveRoomContextValue, []>();
const mockDisplayToast = jest.fn();
const mockShowLogin = jest.fn();
const mockUseAuthContext = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../../contexts/LiveRoomContext', () => ({
  useLiveRoom: () => mockUseLiveRoom(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
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
  DropdownMenuOptions: ({
    options,
  }: {
    options: { label: string; action?: () => void; ariaLabel?: string }[];
  }) => (
    <div>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-label={option.ariaLabel ?? option.label}
          onClick={option.action}
        >
          {option.label}
        </button>
      ))}
    </div>
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

jest.mock('../modals/common/Modal', () => {
  function MockModalHeader({ title }: { title?: string }) {
    return title ? <div>{title}</div> : null;
  }

  function MockModalBody({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  function MockModal({
    children,
    drawerProps,
  }: {
    children: React.ReactNode;
    drawerProps?: { appendOnRoot?: boolean };
  }) {
    return (
      <div
        role="dialog"
        data-append-on-root={drawerProps?.appendOnRoot ? 'true' : 'false'}
      >
        {children}
      </div>
    );
  }

  Object.assign(MockModal, {
    Kind: {
      FixedCenter: 'fixed-center',
      FlexibleCenter: 'flexible-center',
    },
    Size: {
      Small: 'small',
      Medium: 'medium',
    },
    Header: MockModalHeader,
    Body: MockModalBody,
  });

  return { Modal: MockModal };
});

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
    coHostParticipantIds: [],
    chatPermissions: {},
    sessions: {},
    stage: {
      speakerQueueParticipantIds: [],
      activeSpeakerParticipantIds: [],
      raisedHandParticipantIds: [],
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
      <LiveRoomControls roomId="room-1" onLeave={jest.fn()} />
    </QueryClientProvider>,
  );
};

const flushAsyncUpdates = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

const click = async (element: HTMLElement): Promise<void> => {
  await act(async () => {
    fireEvent.click(element);
  });
};

const getEmojiButton = (
  container: HTMLElement,
  label: string,
): HTMLButtonElement => {
  const button = container.querySelector<HTMLButtonElement>(
    `button[title="${label}"]`,
  );

  if (!button) {
    throw new Error(`Could not find ${label} emoji button`);
  }

  return button;
};

describe('LiveRoomControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseAuthContext.mockReturnValue({
      user: { id: 'viewer-1' },
      showLogin: mockShowLogin,
    });
  });

  it('lets an audience participant join the speaker queue', async () => {
    const joinSpeakerQueue = jest.fn(() => new Promise<void>(() => undefined));
    mockUseLiveRoom.mockReturnValue(createContextValue({ joinSpeakerQueue }));

    renderLiveRoomControls();

    await click(screen.getByRole('button', { name: 'Ask to speak' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(joinSpeakerQueue).toHaveBeenCalledTimes(1);
    });
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
            raisedHandParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoomControls();

    const queuedButton = screen.getByRole('button', {
      name: 'Waiting to speak',
    });
    expect(queuedButton).toBeDisabled();
    fireEvent.click(queuedButton);
    expect(joinSpeakerQueue).not.toHaveBeenCalled();
  });

  it('logs when speakers raise their hand from the controls', async () => {
    const raiseHand = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        raiseHand,
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
            raisedHandParticipantIds: [],
          },
        },
      }),
    );

    renderLiveRoomControls();

    await click(screen.getByRole('button', { name: 'Raise hand' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(raiseHand).toHaveBeenCalledTimes(1);
    });
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.RaiseStandupHand,
        target_id: 'room-1',
      }),
    );
    expect(JSON.parse(mockLogEvent.mock.calls[0][0].extra)).toMatchObject({
      roomId: 'room-1',
      role: 'speaker',
      participantId: 'audience',
      surface: 'controls',
      handQueuePosition: 1,
      raisedHandCount: 1,
    });
  });

  it('logs when co-hosts with a raised hand lower it from the controls', async () => {
    const removeHand = jest.fn().mockResolvedValue(undefined);
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        removeHand,
        roomState: {
          ...createRoomState(),
          coHostParticipantIds: ['audience'],
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: [],
            raisedHandParticipantIds: ['host', 'audience'],
          },
        },
      }),
    );

    renderLiveRoomControls();

    await click(screen.getByRole('button', { name: 'Lower hand' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(removeHand).toHaveBeenCalledTimes(1);
    });
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.RemoveStandupHand,
        target_id: 'room-1',
      }),
    );
    expect(JSON.parse(mockLogEvent.mock.calls[0][0].extra)).toMatchObject({
      roomId: 'room-1',
      role: 'audience',
      participantId: 'audience',
      isCoHost: true,
      surface: 'controls',
      handQueuePosition: 2,
      raisedHandCount: 1,
    });
  });

  it('sends emoji reactions through the live room command path', async () => {
    const sendReaction = jest.fn(() => new Promise<void>(() => undefined));
    mockUseLiveRoom.mockReturnValue(createContextValue({ sendReaction }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    await click(screen.getByRole('button', { name: 'React 🔥' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(sendReaction).toHaveBeenCalledWith('🔥');
    });
  });

  it('sends custom emoji reactions through the emoji picker', async () => {
    const sendReaction = jest.fn(() => new Promise<void>(() => undefined));
    mockUseLiveRoom.mockReturnValue(createContextValue({ sendReaction }));

    const { container } = renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Custom reaction' }));
    fireEvent.change(await screen.findByPlaceholderText('Search emojis...'), {
      target: { value: 'grinning face' },
    });
    await waitFor(() => {
      expect(getEmojiButton(container, 'grinning face')).toBeInTheDocument();
    });
    await click(getEmojiButton(container, 'grinning face'));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(sendReaction).toHaveBeenCalledWith('😀');
    });
  });

  it('prompts anonymous viewers to sign up instead of joining the queue', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    mockUseAuthContext.mockReturnValue({
      user: undefined,
      showLogin: mockShowLogin,
    });
    mockUseLiveRoom.mockReturnValue(createContextValue({ joinSpeakerQueue }));

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Ask to speak' }));

    expect(joinSpeakerQueue).not.toHaveBeenCalled();
    expect(mockShowLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
    });
  });

  it('lets an audience participant join the stage in a free-for-all room', async () => {
    const joinStage = jest.fn(() => new Promise<void>(() => undefined));
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        joinStage,
        roomState: {
          ...createRoomState(),
          mode: 'free_for_all',
          stage: {
            speakerQueueParticipantIds: [],
            activeSpeakerParticipantIds: [],
            raisedHandParticipantIds: [],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    await click(screen.getByRole('button', { name: 'Join as speaker' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(joinStage).toHaveBeenCalledTimes(1);
    });
  });

  it('lets a speaker leave the stage in a free-for-all room', async () => {
    const leaveStage = jest.fn(() => new Promise<void>(() => undefined));
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
            raisedHandParticipantIds: [],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    await click(screen.getByRole('button', { name: 'Stop speaking' }));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(leaveStage).toHaveBeenCalledTimes(1);
    });
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
            raisedHandParticipantIds: [],
            speakerLimit: 4,
          },
        },
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }));
    await click(screen.getByRole('button', { name: 'React 🔥' }));

    expect(screen.getByRole('button', { name: 'Stop speaking' })).toBeVisible();

    await act(async () => {
      resolveReaction?.();
    });

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
            raisedHandParticipantIds: [],
            speakerLimit: 2,
          },
        },
      }),
    );

    renderLiveRoomControls();

    const fullButton = screen.getByRole('button', { name: 'Speakers full' });
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
      screen.getByRole('button', { name: 'End standup' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ask to speak' }),
    ).not.toBeInTheDocument();
  });

  it('shows host-only room controls for a co-host audience participant', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        roomState: {
          ...createRoomState(),
          coHostParticipantIds: ['audience'],
        },
      }),
    );

    renderLiveRoomControls();

    expect(
      screen.getByRole('button', { name: 'End standup' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Leave' }),
    ).not.toBeInTheDocument();
  });

  it('keeps go-live as a host-only action for co-hosts', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        roomState: {
          ...createRoomState(),
          status: 'created',
          coHostParticipantIds: ['audience'],
        },
      }),
    );

    renderLiveRoomControls();

    expect(
      screen.queryByRole('button', { name: 'Go live' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'End standup' }),
    ).toBeInTheDocument();
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
            raisedHandParticipantIds: [],
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
      screen.queryByRole('button', { name: 'Ask to speak' }),
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

  it('updates microphone settings from the mic menu', async () => {
    const setMicSetting = jest.fn(() => new Promise<void>(() => undefined));
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'speaker',
        participantId: 'audience',
        canPublish: true,
        setMicSetting,
      }),
    );

    renderLiveRoomControls();

    await click(screen.getByLabelText('Reduce background noise'));
    await flushAsyncUpdates();

    await waitFor(() => {
      expect(setMicSetting).toHaveBeenCalledWith('noiseSuppression', false);
    });
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

  it('shows room settings to regular audience participants', () => {
    const setVideoSetting = jest.fn();
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        canPublish: false,
        setVideoSetting,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Standup settings' }));

    expect(screen.getByText('Standup settings')).toBeInTheDocument();
    expect(screen.getByText('Video quality')).toBeInTheDocument();
    expect(screen.getByLabelText('Audio only')).toBeInTheDocument();
    expect(screen.queryByLabelText('Hide my preview')).not.toBeInTheDocument();
    expect(setVideoSetting).not.toHaveBeenCalled();
  });

  it('renders mobile room settings drawer outside the controls hit area', () => {
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        canPublish: false,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Standup settings' }));

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'data-append-on-root',
      'true',
    );
  });

  it('updates the audio only setting from the room settings modal', () => {
    const setVideoSetting = jest.fn();
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        canPublish: false,
        setVideoSetting,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Standup settings' }));
    fireEvent.click(screen.getByLabelText('Audio only'));

    expect(setVideoSetting).toHaveBeenCalledWith('audioOnly', true);
  });

  it('updates the video quality setting from the room settings modal', () => {
    const setVideoSetting = jest.fn();
    mockUseLiveRoom.mockReturnValue(
      createContextValue({
        role: 'audience',
        participantId: 'audience',
        canPublish: false,
        setVideoSetting,
      }),
    );

    renderLiveRoomControls();

    fireEvent.click(screen.getByRole('button', { name: 'Standup settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Data saver' }));

    expect(setVideoSetting).toHaveBeenCalledWith('quality', 'data_saver');
  });
});
