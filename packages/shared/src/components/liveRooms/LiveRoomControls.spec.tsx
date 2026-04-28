import { fireEvent, render, screen } from '@testing-library/react';
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

const createContextValue = (
  overrides: Partial<LiveRoomContextValue> = {},
): LiveRoomContextValue => ({
  status: 'connected',
  errorMessage: null,
  roomState: {
    roomId: 'room-1',
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
    sessions: {},
    debate: {
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
  sendReaction: jest.fn(),
  promoteSpeaker: jest.fn(),
  removeSpeaker: jest.fn(),
  kickParticipant: jest.fn(),
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
  selectCamera: jest.fn(),
  selectMic: jest.fn(),
  localStream: null,
  remoteStreams: [],
  reactions: [],
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
          debate: {
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
          debate: {
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
});
