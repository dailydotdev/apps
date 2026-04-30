import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Loader } from '../Loader';
import { LiveRoomVideoTile } from './LiveRoomVideoTile';
import { LiveRoomControls } from './LiveRoomControls';
import { LiveRoomChatPanel } from './LiveRoomChatPanel';
import { LiveRoomQueuePanel } from './LiveRoomQueuePanel';
import {
  LiveRoomProvider,
  useLiveRoom as useLiveRoomConnection,
  type LiveRoomReaction,
} from '../../contexts/LiveRoomContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { useLiveRoom as useLiveRoomQuery } from '../../hooks/liveRooms/useLiveRoom';
import { useLiveRoomParticipantProfiles } from '../../hooks/liveRooms/useLiveRoomParticipantProfiles';
import { useLiveRoomParticipantStreams } from '../../hooks/liveRooms/useLiveRoomParticipantStreams';
import { useStreamDuration } from '../../hooks/liveRooms/useStreamDuration';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { clearStoredLiveRoomResumeSession } from '../../lib/liveRoom/resumeSessionStorage';
import { TimerIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserShortProfile } from '../../lib/user';
import {
  buildDisplayProfile,
  buildParticipantProfile,
} from './liveRoomParticipants';
import {
  LiveRoomSidePanelTabs,
  type LiveRoomSidePanelTab,
} from './LiveRoomSidePanelTabs';

interface LiveRoomProps {
  roomId: string;
}

const MAX_STAGE_TILES_PER_PAGE = 12;

const getStageGridColumnCount = (count: number): number => {
  if (count <= 1) {
    return 1;
  }
  if (count <= 4) {
    return 2;
  }
  if (count <= 9) {
    return 3;
  }
  return 4;
};

const formatStreamDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};

const AnimatedCount = ({ value }: { value: number }): ReactElement => (
  <span key={value} className="live-room-count-bump tabular-nums">
    {value}
  </span>
);

const ReactionOverlay = ({
  reactions,
}: {
  reactions: LiveRoomReaction[];
}): ReactElement | null => {
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4 z-3 overflow-hidden"
      aria-hidden
    >
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="live-room-reaction absolute bottom-0 text-4xl"
          style={
            {
              '--live-room-reaction-left': `${16 + reaction.lane * 16}%`,
              '--live-room-reaction-drift':
                reaction.lane % 2 === 0 ? '-1rem' : '1rem',
            } as React.CSSProperties
          }
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
};

const LiveBadge = ({ isLive }: { isLive: boolean }): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-8 px-2 py-0.5 typo-caption1',
      isLive
        ? 'bg-accent-ketchup-default text-white'
        : 'bg-surface-float text-text-tertiary',
    )}
  >
    <span
      className={classNames(
        'size-1.5 rounded-full',
        isLive ? 'animate-pulse bg-white' : 'bg-text-quaternary',
      )}
    />
    <span className="font-bold uppercase tracking-wide">
      {isLive ? 'Live' : 'Setup'}
    </span>
  </span>
);

const LiveRoomInner = ({ roomId }: LiveRoomProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isAuthReady, showLogin, user } = useAuthContext();
  const {
    status,
    errorMessage,
    roomState,
    role,
    participantId,
    sendChatMessage,
    deleteChatMessage,
    setParticipantChatEnabled,
    promoteSpeaker,
    removeSpeaker,
    kickParticipant,
    canChat,
    localStream,
    remoteStreams,
    videoSettings,
    reactions,
    chatMessages,
    isMicOn,
  } = useLiveRoomConnection();
  const {
    data: room,
    error: roomError,
    isLoading: isRoomLoading,
  } = useLiveRoomQuery(roomId);

  const { onAskConfirmation } = useExitConfirmation({
    message: 'Leave the standup? You will disconnect from the stream.',
    onValidateAction: () => status !== 'connected',
  });

  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LiveRoomSidePanelTab>('chat');
  const [stagePage, setStagePage] = useState(0);

  const handleLeave = (): void => {
    onAskConfirmation(false);
    clearStoredLiveRoomResumeSession(roomId);
    router.push('/standups');
  };

  const guardedModerationAction = async (
    key: string,
    action: () => Promise<void>,
  ): Promise<void> => {
    if (moderationBusy) {
      return;
    }

    setModerationBusy(key);
    try {
      await action();
    } catch (error) {
      displayToast(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setModerationBusy(null);
    }
  };

  const handleSendChatMessage = async (body: string): Promise<void> => {
    try {
      await sendChatMessage(body);
    } catch (error) {
      displayToast(error instanceof Error ? error.message : 'Message failed');
    }
  };

  const handleDeleteChatMessage = async (messageId: string): Promise<void> => {
    try {
      await deleteChatMessage(messageId);
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not delete message',
      );
    }
  };

  const handleSetParticipantChatEnabled = async (
    targetParticipantId: string,
    nextCanChat: boolean,
  ): Promise<void> => {
    try {
      await setParticipantChatEnabled(targetParticipantId, nextCanChat);
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not update chat access',
      );
    }
  };

  const handleKickChatParticipant = async (
    targetParticipantId: string,
  ): Promise<void> => {
    try {
      await kickParticipant(targetParticipantId);
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not kick user',
      );
    }
  };

  const handleChatLogin = (): void => {
    showLogin({ trigger: AuthTriggers.MainButton });
  };

  const participantIds = useMemo(() => {
    const ids = new Set<string>();
    const hostId = room?.host.id;

    Object.keys(roomState?.participants ?? {}).forEach((id) => {
      if (id && id !== hostId) {
        ids.add(id);
      }
    });

    chatMessages.forEach((message) => {
      if (message.participantId && message.participantId !== hostId) {
        ids.add(message.participantId);
      }
    });

    return [...ids];
  }, [chatMessages, room?.host.id, roomState?.participants]);
  const visibleRemoteStreams = useMemo(
    () =>
      videoSettings.audioOnly
        ? remoteStreams.filter((stream) => stream.kind !== 'video')
        : remoteStreams,
    [remoteStreams, videoSettings.audioOnly],
  );
  const participantProfiles = useLiveRoomParticipantProfiles(participantIds);
  const participantStreamsById = useLiveRoomParticipantStreams(
    visibleRemoteStreams,
    localStream,
    participantId,
  );
  const isHost = role === 'host';
  const isCreated = roomState?.status === 'created';
  const isLive = roomState?.status === 'live';
  const isEnded = roomState?.status === 'ended' || room?.status === 'ended';
  const roomMode = roomState?.mode ?? room?.mode ?? 'moderated';
  const isFreeForAll = roomMode === 'free_for_all';
  const streamTimerReference = isLive
    ? roomState?.createdAt ?? room?.createdAt ?? null
    : null;
  const streamDuration = useStreamDuration(streamTimerReference);
  const participantCount = roomState
    ? Object.keys(roomState.participants).length
    : room?.participantCount ?? 0;
  const hostId = room?.host.id ?? '';
  const activeSpeakerIds =
    roomState?.stage.activeSpeakerParticipantIds.filter(
      (id) => !!roomState.participants[id] && id !== hostId,
    ) ?? [];
  const queuedParticipantIds =
    roomState?.stage.speakerQueueParticipantIds.filter(
      (id) => !!roomState.participants[id],
    ) ?? [];
  const audienceParticipantIds = roomState
    ? Object.values(roomState.participants)
        .map((participant) => participant.participantId)
        .filter(
          (id) =>
            id !== hostId &&
            !activeSpeakerIds.includes(id) &&
            !queuedParticipantIds.includes(id),
        )
    : [];
  const stageLimit = roomState?.stage.speakerLimit ?? null;
  const remainingSeats =
    stageLimit === null
      ? null
      : Math.max(stageLimit - activeSpeakerIds.length, 0);
  let waitingPrompt = 'Audience can join the queue';
  if (isFreeForAll && remainingSeats !== null) {
    waitingPrompt =
      remainingSeats === 0
        ? 'The stage is full right now'
        : `${remainingSeats} open stage spots`;
  } else if (queuedParticipantIds.length > 0) {
    waitingPrompt = `${queuedParticipantIds.length} in queue`;
  }
  const participantProfilesById = useMemo(() => {
    const nextProfiles = new Map(participantProfiles);

    if (room?.host) {
      nextProfiles.set(room.host.id, room.host);
    }

    return nextProfiles;
  }, [participantProfiles, room?.host]);
  const mentionSuggestions = useMemo(() => {
    if (!room?.host) {
      return [] as UserShortProfile[];
    }

    const suggestions: UserShortProfile[] = [room.host];

    participantIds.forEach((id) => {
      const profile = participantProfilesById.get(id);
      if (profile) {
        suggestions.push(profile);
      }
    });

    return suggestions;
  }, [participantIds, participantProfilesById, room?.host]);
  const audioPublisherIds = new Set(
    Object.values(roomState?.mediaPublications ?? {})
      .filter((publication) => publication.kind === 'audio')
      .map((publication) => publication.participantId),
  );
  const isParticipantMuted = (id: string, selfView: boolean): boolean =>
    selfView ? !isMicOn : !audioPublisherIds.has(id);
  const stageSpeakers = room?.host
    ? [
        {
          id: room.host.id,
          profile: buildDisplayProfile(room.host),
          stream: participantStreamsById.get(room.host.id) ?? null,
          selfView: room.host.id === participantId,
          isHost: true,
        },
        ...activeSpeakerIds.map((id) => ({
          id,
          profile: buildDisplayProfile(
            participantProfilesById.get(id) ?? buildParticipantProfile(id),
          ),
          stream: participantStreamsById.get(id) ?? null,
          selfView: id === participantId,
          isHost: false,
        })),
      ].map((speaker) => ({
        ...speaker,
        isMuted: isParticipantMuted(speaker.id, speaker.selfView),
      }))
    : [];
  const visibleStageSpeakers = stageSpeakers.filter(
    (speaker) => !speaker.selfView || !videoSettings.hideSelfView,
  );
  const stagePageCount = Math.max(
    1,
    Math.ceil(visibleStageSpeakers.length / MAX_STAGE_TILES_PER_PAGE),
  );
  const clampedStagePage = Math.min(stagePage, stagePageCount - 1);
  const stagePageStart = clampedStagePage * MAX_STAGE_TILES_PER_PAGE;
  const paginatedStageSpeakers = visibleStageSpeakers.slice(
    stagePageStart,
    stagePageStart + MAX_STAGE_TILES_PER_PAGE,
  );
  const stageGridColumnCount = getStageGridColumnCount(
    paginatedStageSpeakers.length,
  );
  const stageGridRowCount = Math.max(
    1,
    Math.ceil(paginatedStageSpeakers.length / stageGridColumnCount),
  );
  const showAudienceWaiting = isCreated && !isHost;

  useEffect(() => {
    if (isFreeForAll && activeTab === 'queue') {
      setActiveTab('audience');
    }
  }, [activeTab, isFreeForAll]);

  useEffect(() => {
    setStagePage((currentPage) => Math.min(currentPage, stagePageCount - 1));
  }, [stagePageCount]);

  if (!isAuthReady || isRoomLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          We couldn&apos;t load this standup
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {roomError?.message ?? 'This standup may no longer be available.'}
        </Typography>
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={handleLeave}
        >
          Back to standups
        </Button>
      </div>
    );
  }

  if (status === 'error' || status === 'closed') {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          {status === 'closed'
            ? 'Standup connection closed'
            : "We couldn't connect to this standup"}
        </Typography>
        {errorMessage ? (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {errorMessage}
          </Typography>
        ) : null}
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={handleLeave}
        >
          Back to standups
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-3 overflow-hidden p-3 tablet:p-4">
      <ReactionOverlay reactions={reactions} />

      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <LiveBadge isLive={!!isLive} />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title3}
            bold
            truncate
            className="min-w-0"
          >
            {room.topic}
          </Typography>
        </div>
        {roomState ? (
          <div className="flex items-center gap-4 text-text-tertiary typo-caption1">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5">
                <TimerIcon size={IconSize.XSmall} />
                <span className="tabular-nums text-text-secondary">
                  {formatStreamDuration(streamDuration)}
                </span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <UserIcon size={IconSize.XSmall} />
              <span className="font-bold text-text-primary">
                <AnimatedCount value={participantCount} />
              </span>
              <span>watching</span>
            </span>
          </div>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-label="Speakers"
          className="relative flex min-h-0 flex-col"
        >
          {stagePageCount > 1 ? (
            <div className="flex items-center justify-end gap-2 px-1.5 pb-3">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Page {clampedStagePage + 1} / {stagePageCount}
              </Typography>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                disabled={clampedStagePage === 0}
                onClick={() =>
                  setStagePage((currentPage) => Math.max(0, currentPage - 1))
                }
              >
                Prev
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                disabled={clampedStagePage >= stagePageCount - 1}
                onClick={() =>
                  setStagePage((currentPage) =>
                    Math.min(stagePageCount - 1, currentPage + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          ) : null}
          {paginatedStageSpeakers.length > 0 ? (
            <div
              className="grid min-h-0 flex-1 gap-3 overflow-hidden p-1.5 pb-24 tablet:pb-28"
              style={{
                gridTemplateColumns: `repeat(${stageGridColumnCount}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${stageGridRowCount}, minmax(0, 1fr))`,
              }}
            >
              {paginatedStageSpeakers.map((speaker) => {
                const canModerate = isHost && !speaker.isHost;

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
                      isMuted={speaker.isMuted}
                      onRemoveSpeaker={
                        canModerate
                          ? () =>
                              guardedModerationAction(
                                `tile-remove-${speaker.id}`,
                                () => removeSpeaker(speaker.id),
                              )
                          : undefined
                      }
                      onKick={
                        canModerate
                          ? () =>
                              guardedModerationAction(
                                `tile-kick-${speaker.id}`,
                                () => kickParticipant(speaker.id),
                              )
                          : undefined
                      }
                      isRemoving={
                        moderationBusy === `tile-remove-${speaker.id}`
                      }
                      isKicking={moderationBusy === `tile-kick-${speaker.id}`}
                      moderationDisabled={!!moderationBusy}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
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
                  {showAudienceWaiting
                    ? 'The host will bring people on stage when the standup starts.'
                    : waitingPrompt}
                </Typography>
              </div>
            </div>
          )}

          {showAudienceWaiting ? (
            <div className="absolute inset-x-0 top-0 flex justify-center p-3">
              <span className="rounded-10 bg-overlay-base-tertiary px-3 py-1.5 backdrop-blur">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Waiting for the host to start the standup…
                </Typography>
              </span>
            </div>
          ) : null}

          {isEnded ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-overlay-base-tertiary backdrop-blur">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
                <Typography type={TypographyType.Title3} bold>
                  This standup has ended
                </Typography>
                <Button variant={ButtonVariant.Primary} onClick={handleLeave}>
                  Back to standups
                </Button>
              </div>
            </div>
          ) : null}

          {roomState && !isEnded ? (
            <LiveRoomControls onLeave={handleLeave} />
          ) : null}
        </section>

        <aside
          aria-label="Standup side panel"
          className="flex min-h-0 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float"
        >
          <LiveRoomSidePanelTabs
            active={activeTab}
            tabs={[
              { id: 'chat', label: 'Chat' },
              ...(isFreeForAll
                ? []
                : [
                    {
                      id: 'queue' as const,
                      label: 'Queue',
                      count: queuedParticipantIds.length,
                    },
                  ]),
              {
                id: 'audience',
                label: 'Audience',
                count: audienceParticipantIds.length,
              },
            ]}
            onChange={setActiveTab}
          />
          <div className="min-h-0 flex-1">
            {activeTab === 'chat' ? (
              <LiveRoomChatPanel
                chatMessages={chatMessages}
                participantProfilesById={participantProfilesById}
                mentionSuggestions={mentionSuggestions}
                participantChatPermissions={roomState?.chatPermissions ?? {}}
                hostParticipantId={room.host.id}
                canChat={canChat}
                isLive={!!isLive}
                isEnded={!!isEnded}
                isLoggedIn={!!user}
                isHost={isHost}
                onSendMessage={handleSendChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
                onKickParticipant={handleKickChatParticipant}
                onSetParticipantChatEnabled={handleSetParticipantChatEnabled}
                onRequestLogin={handleChatLogin}
              />
            ) : (
              <LiveRoomQueuePanel
                tab={activeTab}
                mode={roomMode}
                activeSpeakerParticipantIds={activeSpeakerIds}
                queuedParticipantIds={queuedParticipantIds}
                audienceParticipantIds={audienceParticipantIds}
                participantsById={roomState?.participants ?? {}}
                participantProfilesById={participantProfilesById}
                isHost={isHost}
                stageLimit={stageLimit}
                moderationBusy={moderationBusy}
                guardedModerationAction={guardedModerationAction}
                promoteSpeaker={promoteSpeaker}
                removeSpeaker={removeSpeaker}
                kickParticipant={kickParticipant}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export const LiveRoom = ({ roomId }: LiveRoomProps): ReactElement => (
  <LiveRoomProvider roomId={roomId}>
    <LiveRoomInner roomId={roomId} />
  </LiveRoomProvider>
);

export default LiveRoom;
