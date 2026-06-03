import type { ReactElement } from 'react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import type { UserShortProfile } from '../../lib/user';
import { MicrophoneIcon, ShieldIcon, VolumeOffIcon } from '../icons';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { IconSize } from '../Icon';
import {
  SPEAKING_LEVEL_THRESHOLD,
  useLiveRoomAudioLevel,
} from './useLiveRoomAudioLevel';
import { pickLiveTrack } from './liveRoomMedia';
import { LiveRoomTileActions } from './LiveRoomTileActions';
import { Drawer } from '../drawers';
import { RootPortal } from '../tooltips/Portal';
import { useViewSize, ViewSize } from '../../hooks';
import { useTouchLongPress } from '../../hooks/useTouchLongPress';
import { anchorDefaultRel } from '../../lib/strings';
import { ProfileTooltip } from '../profile/ProfileTooltip';

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
  onToggleSelfMute?: () => void | Promise<void>;
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

export const LiveRoomVideoTile = ({
  stream,
  user,
  selfView = false,
  isHost = false,
  isCoHost = false,
  raisedHandQueuePosition,
  isMuted = false,
  className,
  onToggleSelfMute,
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
  const mutedNoticeId = useId();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isMobile = !isTablet;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isMutedNoticeOpen, setIsMutedNoticeOpen] = useState(false);
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

  useEffect(() => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    if (node.srcObject !== videoStream) {
      node.srcObject = videoStream;
    }
  }, [videoStream]);

  const hasProfileLink = !!user.permalink && user.permalink !== '#';
  const hasProfileTooltip = hasProfileLink;
  const nameLabel = (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      bold
      truncate
      className={classNames(
        'min-w-0 !text-white !typo-caption2 tablet:!typo-footnote',
        hasProfileTooltip && 'pointer-events-auto hover:underline',
      )}
    >
      {user.name}
    </Typography>
  );
  const linkedSpeakerName = hasProfileLink ? (
    <a
      href={user.permalink}
      target="_blank"
      rel={anchorDefaultRel}
      className="pointer-events-auto inline-flex min-w-0 items-center"
    >
      {nameLabel}
    </a>
  ) : (
    nameLabel
  );
  const speakerName = hasProfileTooltip ? (
    <ProfileTooltip userId={user.id} initialUser={user}>
      {linkedSpeakerName}
    </ProfileTooltip>
  ) : (
    linkedSpeakerName
  );

  const gestureHandlers = isFocused
    ? swipeHandlers
    : {
        onTouchStart: handlePressStart,
        onTouchEnd: longPressHandlers.onTouchEnd,
        onTouchMove: longPressHandlers.onTouchMove,
        onTouchCancel: longPressHandlers.onTouchCancel,
      };
  const mutedBadgeCopy = 'Muted by user';
  const isSelfMutedTile = selfView && !!onToggleSelfMute;
  const handleMutedBadgeClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    if (isSelfMutedTile) {
      onToggleSelfMute?.();
      return;
    }

    setIsMutedNoticeOpen((current) => !current);
  };
  const closeMutedNotice = (): void => {
    if (isSelfMutedTile) {
      return;
    }

    setIsMutedNoticeOpen(false);
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
      {!isFocused && onFocus ? (
        <button
          type="button"
          aria-label={`Enlarge ${user.name}`}
          className="focus-outline absolute inset-0 cursor-zoom-in"
          onClick={handleFocusButtonClick}
        />
      ) : null}
      {isFocused ? (
        <button
          type="button"
          aria-label={`Close enlarged ${user.name}`}
          className="focus-outline absolute inset-0 cursor-zoom-out"
          onClick={() => onUnfocus?.()}
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
        <button
          type="button"
          aria-label={isSelfMutedTile ? 'Unmute yourself' : mutedBadgeCopy}
          aria-controls={!isSelfMutedTile ? mutedNoticeId : undefined}
          aria-expanded={!isSelfMutedTile ? isMutedNoticeOpen : undefined}
          className="hover:bg-overlay-dark-dark4 absolute right-3 top-3 z-1 inline-flex items-center justify-end rounded-10 bg-overlay-dark-dark3 px-1 py-1 text-white backdrop-blur transition-colors"
          onClick={handleMutedBadgeClick}
          onMouseLeave={closeMutedNotice}
          onBlur={closeMutedNotice}
        >
          {!isSelfMutedTile ? (
            <span
              id={mutedNoticeId}
              aria-hidden={!isMutedNoticeOpen}
              className={classNames(
                'overflow-hidden whitespace-nowrap text-left text-status-error transition-[max-width,opacity,transform,margin,padding] duration-200 ease-out typo-caption1',
                isMutedNoticeOpen
                  ? 'mr-1.5 max-w-[7.5rem] translate-x-0 pl-1 opacity-100'
                  : 'max-w-0 -translate-x-1 pl-0 opacity-0',
              )}
            >
              {mutedBadgeCopy}
            </span>
          ) : null}
          <span className="flex size-5 items-center justify-center">
            <VolumeOffIcon
              size={IconSize.XSmall}
              className="text-status-error"
            />
          </span>
        </button>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 pb-3 pl-1.5 pr-3 pt-3 tablet:pl-3">
        <div className="pointer-events-auto flex min-h-8 min-w-0 items-center gap-1.5 rounded-12 bg-overlay-dark-dark3 px-2 py-1 backdrop-blur transition-[padding] duration-200 ease-out tablet:gap-2 tablet:px-2.5 tablet:group-hover:pr-1">
          {isHost ? (
            <>
              <ShieldIcon
                secondary
                size={IconSize.XXSmall}
                className="shrink-0 text-accent-bun-default tablet:hidden"
                aria-label="Host"
              />
              <Typography
                type={TypographyType.Caption2}
                bold
                className="hidden shrink-0 uppercase tracking-wide !text-accent-bun-default tablet:inline"
              >
                Host
              </Typography>
            </>
          ) : null}
          {isCoHost ? (
            <>
              <ShieldIcon
                secondary
                size={IconSize.XXSmall}
                className="shrink-0 text-accent-water-bolder tablet:hidden"
                aria-label="Co-host"
              />
              <Typography
                type={TypographyType.Caption2}
                bold
                className="hidden shrink-0 uppercase tracking-wide !text-accent-water-bolder tablet:inline"
              >
                Co-host
              </Typography>
            </>
          ) : null}
          {speakerName}
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
            <MicrophoneIcon size={IconSize.XSmall} />
          </span>
        ) : null}
      </div>
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
