import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { LiveRoomControls } from './LiveRoomControls';

const useLiveRoomMock = jest.fn<LiveRoomContextValue, []>();
const displayToast = jest.fn();

jest.mock('../../contexts/LiveRoomContext', () => ({
  useLiveRoom: () => useLiveRoomMock(),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast }),
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
      activeSpeakerParticipantId: null,
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
  promoteNextSpeaker: jest.fn(),
  removeCurrentSpeaker: jest.fn(),
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

describe('LiveRoomControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets an audience participant join the speaker queue', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    useLiveRoomMock.mockReturnValue(createContextValue({ joinSpeakerQueue }));

    render(<LiveRoomControls onLeave={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Join queue' }));

    expect(joinSpeakerQueue).toHaveBeenCalledTimes(1);
  });

  it('shows queued audience state without requeueing', () => {
    const joinSpeakerQueue = jest.fn().mockResolvedValue(undefined);
    useLiveRoomMock.mockReturnValue(
      createContextValue({
        joinSpeakerQueue,
        roomState: {
          ...createRoomState(),
          debate: {
            speakerQueueParticipantIds: ['audience'],
            activeSpeakerParticipantId: null,
          },
        },
      }),
    );

    render(<LiveRoomControls onLeave={jest.fn()} />);

    const queuedButton = screen.getByRole('button', { name: 'Queued' });
    expect(queuedButton).toBeDisabled();
    fireEvent.click(queuedButton);
    expect(joinSpeakerQueue).not.toHaveBeenCalled();
  });

  it('sends emoji reactions through the live room command path', () => {
    const sendReaction = jest.fn().mockResolvedValue(undefined);
    useLiveRoomMock.mockReturnValue(createContextValue({ sendReaction }));

    render(<LiveRoomControls onLeave={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'React 🔥' }));

    expect(sendReaction).toHaveBeenCalledWith('🔥');
  });

  it('keeps host controls separate from the audience queue button', () => {
    useLiveRoomMock.mockReturnValue(
      createContextValue({
        role: 'host',
        participantId: 'host',
        canPublish: true,
      }),
    );

    render(<LiveRoomControls onLeave={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'End room' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join queue' }),
    ).not.toBeInTheDocument();
  });

  it('shows media controls when the current participant becomes a speaker', () => {
    useLiveRoomMock.mockReturnValue(
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
            activeSpeakerParticipantId: 'audience',
          },
        },
      }),
    );

    render(<LiveRoomControls onLeave={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Mic off' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Camera off' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join queue' }),
    ).not.toBeInTheDocument();
  });
});
