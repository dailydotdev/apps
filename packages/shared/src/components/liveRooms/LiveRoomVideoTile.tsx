import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { UserShortProfile } from '../../lib/user';
import { MegaphoneIcon, VolumeOffIcon } from '../icons';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import {
  SPEAKING_LEVEL_THRESHOLD,
  useLiveRoomAudioLevel,
} from './useLiveRoomAudioLevel';
import { LiveRoomTileActions } from './LiveRoomTileActions';
import { Drawer } from '../drawers';
import { RootPortal } from '../tooltips/Portal';
import { useViewSize, ViewSize } from '../../hooks';
import { useTouchLongPress } from '../../hooks/useTouchLongPress';

interface LiveRoomVideoTileProps {
  stream: MediaStream | null;
  user: UserShortProfile;
  // When true, only video is shown (audio not rendered to avoid feedback for own preview).
  selfView?: boolean;
  isHost?: boolean;
  isCoHost?: boolean;
  raisedHandQueuePosition?: number;
  isMuted?: boolean;
  className?: string;
  onGrantCoHost?: () => void;
  onRevokeCoHost?: () => void;
  onRemoveSpeaker?: () => void;
  onKick?: () => void;
  isGrantingCoHost?: boolean;
  isRevokingCoHost?: boolean;
  isRemoving?: boolean;
  isKicking?: boolean;
  moderationDisabled?: boolean;
  isFocused?: boolean;
  onFocus?: () => void;
  onUnfocus?: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
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
  isCoHost = false,
  raisedHandQueuePosition,
  isMuted = false,
  className,
  onGrantCoHost,
  onRevokeCoHost,
  onRemoveSpeaker,
  onKick,
  isGrantingCoHost = false,
  isRevokingCoHost = false,
  isRemoving = false,
  isKicking = false,
  moderationDisabled = false,
  isFocused = false,
  onFocus,
  onUnfocus,
  onSwipeNext,
  onSwipePrev,
}: LiveRoomVideoTileProps): ReactElement => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isMobile = !isTablet;
  const [actionsOpen, setActionsOpen] = useState(false);
  const longPressFiredRef = useRef(false);
  const longPressHandlers = useTouchLongPress<undefined>({
    enabled: isMobile && !selfView,
    onLongPress: () => {
      longPressFiredRef.current = true;
      setActionsOpen(true);
    },
  });
  const handlePressStart = (event: React.TouchEvent): void => {
    longPressFiredRef.current = false;
    longPressHandlers.onTouchStart(event, undefined);
  };
  const handleFocusButtonClick = (): void => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (isFocused) {
      return;
    }
    onFocus?.();
  };
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isFocused) {
        onSwipeNext?.();
      }
    },
    onSwipedRight: () => {
      if (isFocused) {
        onSwipePrev?.();
      }
    },
    trackTouch: true,
    trackMouse: false,
  });

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
  const hasProfileLink = !!user.permalink && user.permalink !== '#';
  const nameLabel = (
    <Typography
      tag={hasProfileLink ? TypographyTag.Link : TypographyTag.Span}
      type={TypographyType.Footnote}
      bold
      truncate
      className={classNames(
        'min-w-0 !text-white !typo-caption2 tablet:!typo-footnote',
        hasProfileLink && 'pointer-events-auto hover:underline',
      )}
    >
      {user.name}
    </Typography>
  );

  const gestureHandlers = isFocused
    ? swipeHandlers
    : {
        onTouchStart: handlePressStart,
        onTouchEnd: longPressHandlers.onTouchEnd,
        onTouchMove: longPressHandlers.onTouchMove,
        onTouchCancel: longPressHandlers.onTouchCancel,
      };

  return (
    <div
      {...gestureHandlers}
      className={classNames(
        'group flex items-center justify-center overflow-hidden rounded-16 border bg-surface-float transition-[border-color,box-shadow] duration-150',
        isFocused
          ? 'fixed left-1/2 top-1/2 z-modal h-[80vh] max-h-[90vh] w-[90vw] max-w-[64rem] -translate-x-1/2 -translate-y-1/2'
          : 'relative h-full max-h-full w-full max-w-full cursor-zoom-in',
        isSpeaking
          ? 'border-accent-avocado-default shadow-[0_0_0_3px_var(--theme-accent-avocado-subtle)]'
          : 'border-border-subtlest-tertiary',
        isMobile && 'select-none [-webkit-touch-callout:none]',
        className,
      )}
      onContextMenu={(event) => {
        if (isMobile) {
          event.preventDefault();
        }
      }}
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
      {!isFocused && onFocus ? (
        <button
          type="button"
          aria-label={`Enlarge ${user.name}`}
          className="focus-outline absolute inset-0 cursor-zoom-in"
          onClick={handleFocusButtonClick}
        />
      ) : null}
      {raisedHandQueuePosition ? (
        <span
          aria-label={`Hand raised, position ${raisedHandQueuePosition}`}
          className="pointer-events-none absolute left-3 top-3 inline-flex animate-raise-hand-pop items-center gap-1 rounded-10 bg-accent-cheese-default px-2 py-1 text-raw-pepper-90 shadow-2"
        >
          <RaiseHandIcon
            size={IconSize.Size16}
            secondary
            className="origin-bottom animate-raise-hand-wave"
          />
          <span className="font-bold tabular-nums typo-caption1">
            #{raisedHandQueuePosition}
          </span>
        </span>
      ) : null}
      {isMuted ? (
        <span
          aria-label="Muted"
          className="pointer-events-none absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-10 bg-overlay-dark-dark3 backdrop-blur"
        >
          <VolumeOffIcon size={IconSize.XSmall} className="text-status-error" />
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 pb-3 pl-1.5 pr-3 pt-3 tablet:pl-3">
        <div className="flex min-h-8 min-w-0 items-center gap-1.5 rounded-12 bg-overlay-dark-dark3 px-2 py-1 backdrop-blur transition-[padding] duration-200 ease-out tablet:gap-2 tablet:px-2.5 tablet:group-hover:pr-1">
          {isHost ? (
            <Typography
              type={TypographyType.Caption2}
              bold
              className="hidden shrink-0 uppercase tracking-wide !text-accent-bun-default tablet:inline"
            >
              Host
            </Typography>
          ) : null}
          {isCoHost ? (
            <Typography
              type={TypographyType.Caption2}
              bold
              className="hidden shrink-0 uppercase tracking-wide !text-accent-water-bolder tablet:inline"
            >
              Co-host
            </Typography>
          ) : null}
          {hasProfileLink ? (
            <Link href={user.permalink} passHref>
              {nameLabel}
            </Link>
          ) : (
            nameLabel
          )}
          <LiveRoomTileActions
            user={user}
            onGrantCoHost={onGrantCoHost}
            onRevokeCoHost={onRevokeCoHost}
            onRemoveSpeaker={onRemoveSpeaker}
            onKick={onKick}
            isGrantingCoHost={isGrantingCoHost}
            isRevokingCoHost={isRevokingCoHost}
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
      <RootPortal>
        <Drawer
          isOpen={actionsOpen}
          onClose={() => setActionsOpen(false)}
          displayCloseButton={false}
        >
          <LiveRoomTileActions
            user={user}
            variant="drawer"
            onGrantCoHost={onGrantCoHost}
            onRevokeCoHost={onRevokeCoHost}
            onRemoveSpeaker={onRemoveSpeaker}
            onKick={onKick}
            isGrantingCoHost={isGrantingCoHost}
            isRevokingCoHost={isRevokingCoHost}
            isRemoving={isRemoving}
            isKicking={isKicking}
            moderationDisabled={moderationDisabled}
            onActionComplete={() => setActionsOpen(false)}
          />
        </Drawer>
        {isFocused ? (
          <button
            type="button"
            aria-label="Close enlarged tile"
            className="fixed inset-0 z-popup cursor-zoom-out bg-overlay-quaternary-onion backdrop-blur"
            onClick={() => onUnfocus?.()}
          />
        ) : null}
      </RootPortal>
    </div>
  );
};
