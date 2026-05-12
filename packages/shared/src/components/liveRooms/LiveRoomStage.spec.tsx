import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { LiveRoomStageSpeaker } from './LiveRoomStage';
import { LiveRoomStage } from './LiveRoomStage';

const mockRetryHandlers = new Map<string, jest.Mock>();

jest.mock('./LiveRoomVideoTile', () => ({
  LiveRoomVideoTile: ({ user }: { user: { id: string; name: string } }) => (
    <div data-testid={`tile-${user.id}`}>
      <span>{user.name}</span>
    </div>
  ),
}));

jest.mock('./LiveRoomAudioPlayer', () => {
  const mockReact = jest.requireActual('react');

  return {
    LiveRoomAudioPlayer: ({
      stream,
      selfView,
      onAudioPlaybackStateChange,
      onRegisterAudioRetry,
    }: {
      stream: MediaStream | null;
      selfView?: boolean;
      onAudioPlaybackStateChange?: (
        state: 'none' | 'blocked' | 'playing',
      ) => void;
      onRegisterAudioRetry?: (retry: (() => void) | null) => void;
    }) => {
      mockReact.useEffect(() => {
        const retry = jest.fn();
        const speakerId = stream?.id ?? 'unknown';
        mockRetryHandlers.set(speakerId, retry);
        onRegisterAudioRetry?.(retry);

        return () => {
          mockRetryHandlers.delete(speakerId);
          onRegisterAudioRetry?.(null);
        };
      }, [onRegisterAudioRetry, stream]);

      if (selfView) {
        return null;
      }

      return (
        <div data-testid={`audio-player-${stream?.id ?? 'unknown'}`}>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.('blocked')}
          >
            {`block-${stream?.id ?? 'unknown'}`}
          </button>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.('playing')}
          >
            {`play-${stream?.id ?? 'unknown'}`}
          </button>
        </div>
      );
    },
  };
});

jest.mock('./LiveRoomControls', () => ({
  LiveRoomControls: () => <div>controls</div>,
}));

jest.mock('./LiveRoomStagePager', () => ({
  LiveRoomStagePager: () => null,
}));

const createSpeaker = (id: string): LiveRoomStageSpeaker => ({
  id,
  profile: {
    id,
    username: id,
    name: id,
    image: '',
    permalink: '#',
    createdAt: '',
    reputation: 0,
  },
  stream: { id } as MediaStream,
  selfView: false,
  isHost: false,
  isCoHost: false,
  isMuted: false,
});

const renderStage = () =>
  render(
    <LiveRoomStage
      roomId="room-1"
      isEnded={false}
      stagePageCount={1}
      clampedStagePage={0}
      setStagePage={jest.fn()}
      stageGridColumnCount={2}
      stageGridRowCount={1}
      speakers={[createSpeaker('speaker-1')]}
      audioSpeakers={[createSpeaker('speaker-1'), createSpeaker('speaker-2')]}
      stagePageStart={0}
      focusedSpeakerIndex={null}
      waitingPrompt="Waiting"
      hasHostPrivileges={false}
      isHost={false}
      moderationBusy={null}
      onFocusSpeaker={jest.fn()}
      onUnfocusSpeaker={jest.fn()}
      onSpeakerFocusNavigate={jest.fn()}
      guardedModerationAction={jest.fn()}
      onGrantCoHost={jest.fn()}
      onRevokeCoHost={jest.fn()}
      onRemoveSpeaker={jest.fn()}
      onKickParticipant={jest.fn()}
      onToggleSelfMute={jest.fn()}
      onNavigateBack={jest.fn()}
      showControls={false}
      onLeave={jest.fn()}
    />,
  );

describe('LiveRoomStage', () => {
  beforeEach(() => {
    mockRetryHandlers.clear();
  });

  it('shows a single tap-to-unmute prompt only while audio is blocked globally', () => {
    renderStage();

    expect(
      screen.queryByRole('button', { name: 'Tap to unmute' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'block-speaker-1' }));

    expect(
      screen.getByRole('button', { name: 'Tap to unmute' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'play-speaker-2' }));

    expect(
      screen.queryByRole('button', { name: 'Tap to unmute' }),
    ).not.toBeInTheDocument();
  });

  it('retries audio playback for every visible tile from the shared prompt', () => {
    renderStage();

    fireEvent.click(screen.getByRole('button', { name: 'block-speaker-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap to unmute' }));

    expect(mockRetryHandlers.get('speaker-1')).toHaveBeenCalledTimes(1);
    expect(mockRetryHandlers.get('speaker-2')).toHaveBeenCalledTimes(1);
  });

  it('surfaces blocked audio from an off-page speaker', () => {
    renderStage();

    fireEvent.click(screen.getByRole('button', { name: 'block-speaker-2' }));

    expect(
      screen.getByRole('button', { name: 'Tap to unmute' }),
    ).toBeInTheDocument();
  });
});
