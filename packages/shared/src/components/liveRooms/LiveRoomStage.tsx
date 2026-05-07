import type { Dispatch, ReactElement, SetStateAction } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { UserIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserShortProfile } from '../../lib/user';
import { LiveRoomControls } from './LiveRoomControls';
import { LiveRoomStagePager } from './LiveRoomStagePager';
import {
  LiveRoomVideoTile,
  type LiveRoomTileAudioPlaybackState,
} from './LiveRoomVideoTile';

export interface LiveRoomStageSpeaker {
  id: string;
  profile: UserShortProfile;
  stream: MediaStream | null;
  selfView: boolean;
  isHost: boolean;
  isCoHost: boolean;
  raisedHandQueuePosition?: number;
  isMuted: boolean;
}

interface LiveRoomStageProps {
  roomId: string;
  isEnded: boolean;
  stagePageCount: number;
  clampedStagePage: number;
  setStagePage: Dispatch<SetStateAction<number>>;
  stageGridColumnCount: number;
  stageGridRowCount: number;
  speakers: LiveRoomStageSpeaker[];
  stagePageStart: number;
  focusedSpeakerIndex: number | null;
  waitingPrompt: string;
  hasHostPrivileges: boolean;
  isHost: boolean;
  moderationBusy: string | null;
  onFocusSpeaker: (index: number) => void;
  onUnfocusSpeaker: () => void;
  onSpeakerFocusNavigate: (delta: 1 | -1) => void;
  guardedModerationAction: (
    key: string,
    action: () => Promise<void>,
  ) => Promise<void>;
  onGrantCoHost: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onRevokeCoHost: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onRemoveSpeaker: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onKickParticipant: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onToggleSelfMute: () => Promise<void>;
  onNavigateBack: (surface: string) => void;
  showControls: boolean;
  onLeave: () => void;
}

export const LiveRoomStage = ({
  roomId,
  isEnded,
  stagePageCount,
  clampedStagePage,
  setStagePage,
  stageGridColumnCount,
  stageGridRowCount,
  speakers,
  stagePageStart,
  focusedSpeakerIndex,
  waitingPrompt,
  hasHostPrivileges,
  isHost,
  moderationBusy,
  onFocusSpeaker,
  onUnfocusSpeaker,
  onSpeakerFocusNavigate,
  guardedModerationAction,
  onGrantCoHost,
  onRevokeCoHost,
  onRemoveSpeaker,
  onKickParticipant,
  onToggleSelfMute,
  onNavigateBack,
  showControls,
  onLeave,
}: LiveRoomStageProps): ReactElement => {
  const [speakerAudioStates, setSpeakerAudioStates] = useState<
    Record<string, LiveRoomTileAudioPlaybackState>
  >({});
  const audioRetryHandlersRef = useRef(new Map<string, () => void>());
  const hasMultiplePages = stagePageCount > 1;
  const visibleSpeakerIds = useMemo(
    () => new Set(speakers.map((speaker) => speaker.id)),
    [speakers],
  );
  const goToPage = useCallback(
    (page: number) => {
      setStagePage(() => Math.max(0, Math.min(stagePageCount - 1, page)));
    },
    [setStagePage, stagePageCount],
  );
  const goToPrevPage = useCallback(() => {
    setStagePage((currentPage) => Math.max(0, currentPage - 1));
  }, [setStagePage]);
  const goToNextPage = useCallback(() => {
    setStagePage((currentPage) =>
      Math.min(stagePageCount - 1, currentPage + 1),
    );
  }, [setStagePage, stagePageCount]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (hasMultiplePages && focusedSpeakerIndex === null) {
        goToNextPage();
      }
    },
    onSwipedRight: () => {
      if (hasMultiplePages && focusedSpeakerIndex === null) {
        goToPrevPage();
      }
    },
    trackTouch: true,
    trackMouse: false,
  });

  useEffect(() => {
    setSpeakerAudioStates((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([speakerId]) =>
          visibleSpeakerIds.has(speakerId),
        ),
      ),
    );

    audioRetryHandlersRef.current.forEach((_, speakerId) => {
      if (!visibleSpeakerIds.has(speakerId)) {
        audioRetryHandlersRef.current.delete(speakerId);
      }
    });
  }, [visibleSpeakerIds]);

  const handleSpeakerAudioPlaybackStateChange = useCallback(
    (speakerId: string, state: LiveRoomTileAudioPlaybackState): void => {
      setSpeakerAudioStates((current) => {
        if (state === 'none') {
          if (!(speakerId in current)) {
            return current;
          }

          const next = { ...current };
          delete next[speakerId];
          return next;
        }

        if (current[speakerId] === state) {
          return current;
        }

        return { ...current, [speakerId]: state };
      });
    },
    [],
  );

  const registerSpeakerAudioRetry = useCallback(
    (speakerId: string, retry: (() => void) | null): void => {
      if (retry) {
        audioRetryHandlersRef.current.set(speakerId, retry);
        return;
      }

      audioRetryHandlersRef.current.delete(speakerId);
    },
    [],
  );

  const hasBlockedAudio = speakers.some(
    (speaker) => speakerAudioStates[speaker.id] === 'blocked',
  );
  const hasPlayingAudio = speakers.some(
    (speaker) => speakerAudioStates[speaker.id] === 'playing',
  );
  const showAudioPrompt = hasBlockedAudio && !hasPlayingAudio;

  const retrySpeakerAudioPlayback = (): void => {
    audioRetryHandlersRef.current.forEach((retry) => retry());
  };

  return (
    <section aria-label="Speakers" className="relative flex min-h-0 flex-col">
      {showAudioPrompt ? (
        <Button
          type="button"
          className="absolute right-3 top-3 z-1"
          variant={ButtonVariant.Primary}
          onClick={retrySpeakerAudioPlayback}
        >
          Tap to unmute
        </Button>
      ) : null}
      {speakers.length > 0 ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            {...swipeHandlers}
            className={classNames(
              'grid min-h-0 flex-1 gap-3 overflow-hidden p-1.5',
              hasMultiplePages ? 'pb-32 tablet:pb-36' : 'pb-24 tablet:pb-28',
            )}
            style={{
              gridTemplateColumns: `repeat(${stageGridColumnCount}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${stageGridRowCount}, minmax(0, 1fr))`,
            }}
          >
            {speakers.map((speaker, index) => {
              const canModerate = hasHostPrivileges && !speaker.isHost;
              const canManageCoHosts = isHost && !speaker.isHost;
              const globalIndex = stagePageStart + index;

              return (
                <div
                  key={speaker.id}
                  className="flex min-h-0 min-w-0 items-center justify-center"
                >
                  <LiveRoomVideoTile
                    stream={speaker.stream}
                    user={speaker.profile}
                    selfView={speaker.selfView}
                    isHost={speaker.isHost}
                    isCoHost={speaker.isCoHost}
                    raisedHandQueuePosition={speaker.raisedHandQueuePosition}
                    isMuted={speaker.isMuted}
                    onToggleSelfMute={
                      speaker.selfView ? onToggleSelfMute : undefined
                    }
                    isFocused={focusedSpeakerIndex === globalIndex}
                    onFocus={() => onFocusSpeaker(globalIndex)}
                    onUnfocus={onUnfocusSpeaker}
                    onSwipeNext={() => onSpeakerFocusNavigate(1)}
                    onSwipePrev={() => onSpeakerFocusNavigate(-1)}
                    onAudioPlaybackStateChange={(state) =>
                      handleSpeakerAudioPlaybackStateChange(speaker.id, state)
                    }
                    onRegisterAudioRetry={(retry) =>
                      registerSpeakerAudioRetry(speaker.id, retry)
                    }
                    onGrantCoHost={
                      canManageCoHosts && !speaker.isCoHost
                        ? () =>
                            guardedModerationAction(
                              `tile-grant-cohost-${speaker.id}`,
                              () => onGrantCoHost(speaker.id, 'stage_tile'),
                            )
                        : undefined
                    }
                    onRevokeCoHost={
                      canManageCoHosts && speaker.isCoHost
                        ? () =>
                            guardedModerationAction(
                              `tile-revoke-cohost-${speaker.id}`,
                              () => onRevokeCoHost(speaker.id, 'stage_tile'),
                            )
                        : undefined
                    }
                    onRemoveSpeaker={
                      canModerate
                        ? () =>
                            guardedModerationAction(
                              `tile-remove-${speaker.id}`,
                              () => onRemoveSpeaker(speaker.id, 'stage_tile'),
                            )
                        : undefined
                    }
                    onKick={
                      canModerate
                        ? () =>
                            guardedModerationAction(
                              `tile-kick-${speaker.id}`,
                              () => onKickParticipant(speaker.id, 'stage_tile'),
                            )
                        : undefined
                    }
                    isRemoving={moderationBusy === `tile-remove-${speaker.id}`}
                    isGrantingCoHost={
                      moderationBusy === `tile-grant-cohost-${speaker.id}`
                    }
                    isRevokingCoHost={
                      moderationBusy === `tile-revoke-cohost-${speaker.id}`
                    }
                    isKicking={moderationBusy === `tile-kick-${speaker.id}`}
                    moderationDisabled={!!moderationBusy}
                  />
                </div>
              );
            })}
          </div>
          <LiveRoomStagePager
            pageCount={stagePageCount}
            currentPage={clampedStagePage}
            onPageSelect={goToPage}
            onPrev={goToPrevPage}
            onNext={goToNextPage}
          />
        </div>
      ) : null}
      {speakers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
              <UserIcon size={IconSize.Small} />
            </span>
            <Typography type={TypographyType.Footnote} bold>
              No visible speakers
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {waitingPrompt}
            </Typography>
          </div>
        </div>
      ) : null}

      {isEnded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background-default p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Typography type={TypographyType.Title3} bold>
              This standup has ended
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Thanks for joining — catch the next one soon.
            </Typography>
            <Button
              className="mt-2"
              variant={ButtonVariant.Primary}
              onClick={() => onNavigateBack('ended_state')}
            >
              Back home
            </Button>
          </div>
        </div>
      ) : null}

      {showControls && !isEnded ? (
        <LiveRoomControls roomId={roomId} onLeave={onLeave} />
      ) : null}
    </section>
  );
};
