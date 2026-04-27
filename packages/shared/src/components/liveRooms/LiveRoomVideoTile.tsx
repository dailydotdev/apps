import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { UserShortProfile } from '../../lib/user';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';

interface LiveRoomVideoTileProps {
  stream: MediaStream | null;
  user: UserShortProfile;
  label?: string;
  // When true, only video is shown (audio not rendered to avoid feedback for own preview).
  selfView?: boolean;
  className?: string;
}

const pickLiveTrack = (
  source: MediaStream | null,
  kind: 'audio' | 'video',
): MediaStreamTrack | null => {
  if (!source) {
    return null;
  }
  const tracks =
    kind === 'audio' ? source.getAudioTracks() : source.getVideoTracks();
  return tracks.find((t) => t.readyState === 'live') ?? null;
};

export const LiveRoomVideoTile = ({
  stream,
  user,
  label,
  selfView = false,
  className,
}: LiveRoomVideoTileProps): ReactElement => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false);

  // Pick stable track references based on the source stream so identity
  // changes only when the underlying track changes.
  const videoTrack = useMemo(() => pickLiveTrack(stream, 'video'), [stream]);
  const audioTrack = useMemo(
    () => (selfView ? null : pickLiveTrack(stream, 'audio')),
    [stream, selfView],
  );

  // Build per-track MediaStream wrappers that are stable across renders.
  const videoStream = useMemo(
    () => (videoTrack ? new MediaStream([videoTrack]) : null),
    [videoTrack],
  );
  const audioStream = useMemo(
    () => (audioTrack ? new MediaStream([audioTrack]) : null),
    [audioTrack],
  );

  const tryPlayAudio = (): void => {
    const node = audioRef.current;
    if (!node) {
      return;
    }
    const playPromise = node.play();
    if (!playPromise) {
      return;
    }
    playPromise
      .then(() => setNeedsAudioGesture(false))
      .catch(() => setNeedsAudioGesture(true));
  };

  useEffect(() => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    if (node.srcObject !== videoStream) {
      node.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    const node = audioRef.current;
    if (!node) {
      return;
    }
    if (node.srcObject !== audioStream) {
      node.srcObject = audioStream;
    }
    if (audioStream) {
      tryPlayAudio();
    } else {
      setNeedsAudioGesture(false);
    }
  }, [audioStream]);

  const handleEnableAudio = (): void => {
    tryPlayAudio();
  };

  return (
    <div
      className={classNames(
        'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-16 bg-surface-float',
        className,
      )}
    >
      {videoStream ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // Re-attempt audio playback once video starts — Chrome's autoplay
          // policy sometimes blocks the audio element until something visible
          // is playing.
          onPlay={() => {
            if (audioStream) {
              tryPlayAudio();
            }
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <ProfilePicture user={user} size={ProfileImageSize.XXLarge} />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {user.name}
          </Typography>
        </div>
      )}
      {audioStream ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={audioRef} autoPlay />
      ) : null}
      {label ? (
        <div className="absolute bottom-3 left-3 rounded-8 bg-overlay-base-tertiary px-2 py-1 backdrop-blur">
          <Typography type={TypographyType.Caption1} bold>
            {label}
          </Typography>
        </div>
      ) : null}
      {audioStream ? (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-8 bg-overlay-base-tertiary px-2 py-1 backdrop-blur">
          <Typography type={TypographyType.Caption2} bold>
            Audio
          </Typography>
          <LiveRoomMicLevel stream={audioStream} />
        </div>
      ) : null}
      {needsAudioGesture ? (
        <Button
          className="absolute right-3 top-3"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={handleEnableAudio}
        >
          Tap to unmute
        </Button>
      ) : null}
    </div>
  );
};
