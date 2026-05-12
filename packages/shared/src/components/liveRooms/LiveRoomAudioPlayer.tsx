import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { pickLiveTrack } from './liveRoomMedia';

export type LiveRoomAudioPlaybackState = 'none' | 'blocked' | 'playing';

interface LiveRoomAudioPlayerProps {
  stream: MediaStream | null;
  selfView?: boolean;
  onAudioPlaybackStateChange?: (state: LiveRoomAudioPlaybackState) => void;
  onRegisterAudioRetry?: (retry: (() => void) | null) => void;
}

export const LiveRoomAudioPlayer = ({
  stream,
  selfView = false,
  onAudioPlaybackStateChange,
  onRegisterAudioRetry,
}: LiveRoomAudioPlayerProps): ReactElement | null => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTrack = useMemo(
    () => (selfView ? null : pickLiveTrack(stream, 'audio')),
    [selfView, stream],
  );
  const audioStream = useMemo(
    () => (audioTrack ? new MediaStream([audioTrack]) : null),
    [audioTrack],
  );

  const tryPlayAudio = useCallback((): void => {
    const node = audioRef.current;
    if (!node) {
      onAudioPlaybackStateChange?.('none');
      return;
    }

    const playPromise = node.play();
    if (!playPromise) {
      onAudioPlaybackStateChange?.('playing');
      return;
    }

    playPromise
      .then(() => onAudioPlaybackStateChange?.('playing'))
      .catch(() => onAudioPlaybackStateChange?.('blocked'));
  }, [onAudioPlaybackStateChange]);

  useEffect(() => {
    const node = audioRef.current;
    if (!node) {
      onAudioPlaybackStateChange?.('none');
      return;
    }

    if (node.srcObject !== audioStream) {
      node.srcObject = audioStream;
    }

    if (audioStream) {
      tryPlayAudio();
      return;
    }

    onAudioPlaybackStateChange?.('none');
  }, [audioStream, onAudioPlaybackStateChange, tryPlayAudio]);

  useEffect(() => {
    if (!audioStream) {
      onRegisterAudioRetry?.(null);
      return undefined;
    }

    onRegisterAudioRetry?.(tryPlayAudio);

    return () => {
      onRegisterAudioRetry?.(null);
    };
  }, [audioStream, onRegisterAudioRetry, tryPlayAudio]);

  if (!audioStream) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
  );
};
