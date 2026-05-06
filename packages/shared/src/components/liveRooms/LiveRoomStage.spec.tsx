import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { LiveRoomStageSpeaker } from './LiveRoomStage';
import { LiveRoomStage } from './LiveRoomStage';

const mockRetryHandlers = new Map<string, jest.Mock>();

jest.mock('./LiveRoomVideoTile', () => {
  const mockReact = jest.requireActual('react');

  return {
    LiveRoomVideoTile: ({
      user,
      onAudioPlaybackStateChange,
      onRegisterAudioRetry,
    }: {
      user: { id: string; name: string };
      onAudioPlaybackStateChange?: (
        state: 'none' | 'blocked' | 'playing',
      ) => void;
      onRegisterAudioRetry?: (retry: (() => void) | null) => void;
    }) => {
      mockReact.useEffect(() => {
        const retry = jest.fn();
        mockRetryHandlers.set(user.id, retry);
        onRegisterAudioRetry?.(retry);

        return () => {
          mockRetryHandlers.delete(user.id);
          onRegisterAudioRetry?.(null);
        };
      }, [onRegisterAudioRetry, user.id]);

      return (
        <div data-testid={`tile-${user.id}`}>
          <span>{user.name}</span>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.('blocked')}
          >
            {`block-${user.id}`}
          </button>
          <button
            type="button"
            onClick={() => onAudioPlaybackStateChange?.('playing')}
          >
            {`play-${user.id}`}
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
  stream: null,
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
      speakers={[createSpeaker('speaker-1'), createSpeaker('speaker-2')]}
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
});
