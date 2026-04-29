import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { UserShortProfile } from '../../lib/user';
import { MegaphoneIcon } from '../icons';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import {
  SPEAKING_LEVEL_THRESHOLD,
  useLiveRoomAudioLevel,
} from './useLiveRoomAudioLevel';
import { LiveRoomTileActions } from './LiveRoomTileActions';

interface LiveRoomVideoTileProps {
  stream: MediaStream | null;
  user: UserShortProfile;
  // When true, only video is shown (audio not rendered to avoid feedback for own preview).
  selfView?: boolean;
  isHost?: boolean;
  className?: string;
  onRemoveSpeaker?: () => void;
  onKick?: () => void;
  isRemoving?: boolean;
  isKicking?: boolean;
  moderationDisabled?: boolean;
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
  selfView = false,
  isHost = false,
  className,
  onRemoveSpeaker,
  onKick,
  isRemoving = false,
  isKicking = false,
  moderationDisabled = false,
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

  // The level analyser is the source of truth for the speaking ring; for
  // selfView (no audio element) we still need an audio-only stream to read
  // levels off, otherwise the host's own tile would never glow on speech.
  const levelStream = useMemo(() => {
    if (audioStream) {
      return audioStream;
    }
    if (!selfView) {
      return null;
    }
    const localAudio = pickLiveTrack(stream, 'audio');
    return localAudio ? new MediaStream([localAudio]) : null;
  }, [audioStream, selfView, stream]);
  const level = useLiveRoomAudioLevel(levelStream);
  const isSpeaking = level >= SPEAKING_LEVEL_THRESHOLD;

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
        'group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-16 border bg-surface-float transition-[border-color,box-shadow] duration-150',
        isSpeaking
          ? 'border-accent-avocado-default shadow-[0_0_0_3px_var(--theme-accent-avocado-subtle)]'
          : 'border-border-subtlest-tertiary',
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="flex min-w-0 items-center gap-2 rounded-12 bg-overlay-dark-dark3 px-2.5 py-1 backdrop-blur transition-[padding] duration-200 ease-out group-hover:pr-1">
          {isHost ? (
            <Typography
              type={TypographyType.Caption2}
              bold
              className="shrink-0 uppercase tracking-wide !text-accent-bun-default"
            >
              Host
            </Typography>
          ) : null}
          <Link href={user.permalink} passHref>
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Footnote}
              bold
              truncate
              className="pointer-events-auto min-w-0 !text-white hover:underline"
            >
              {user.name}
            </Typography>
          </Link>
          <LiveRoomTileActions
            user={user}
            onRemoveSpeaker={onRemoveSpeaker}
            onKick={onKick}
            isRemoving={isRemoving}
            isKicking={isKicking}
            moderationDisabled={moderationDisabled}
          />
        </div>
        {isSpeaking ? (
          <span
            aria-label="Speaking"
            className="pointer-events-none flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-avocado-default text-white"
          >
            <MegaphoneIcon size={IconSize.XSmall} />
          </span>
        ) : null}
      </div>
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
