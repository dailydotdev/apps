import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import type { ChatReactionAnalytics } from './LiveRoomChatReactions';
import { LiveRoomQueuePanel } from './LiveRoomQueuePanel';
import {
  LiveRoomProvider,
  useLiveRoom as useLiveRoomConnection,
  type LiveRoomReaction,
} from '../../contexts/LiveRoomContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { isDevelopment } from '../../lib/constants';
import { buildStandupAnalyticsExtra } from '../../lib/liveRoom/analytics';
import { getLiveRoomPrivilegeState } from '../../lib/liveRoom/privileges';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import type { LiveRoom as LiveRoomModel } from '../../graphql/liveRooms';
import { useLiveRoom as useLiveRoomQuery } from '../../hooks/liveRooms/useLiveRoom';
import { useLiveRoomParticipantProfiles } from '../../hooks/liveRooms/useLiveRoomParticipantProfiles';
import { useLiveRoomParticipantStreams } from '../../hooks/liveRooms/useLiveRoomParticipantStreams';
import { useStreamDuration } from '../../hooks/liveRooms/useStreamDuration';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { clearStoredLiveRoomResumeSession } from '../../lib/liveRoom/resumeSessionStorage';
import { UserIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserShortProfile } from '../../lib/user';
import Markdown from '../Markdown';
import { ContentEmbeds } from '../contentEmbeds/ContentEmbeds';
import { useLiveRoomSubscription } from '../../hooks/liveRooms/useLiveRoomSubscription';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import {
  buildDisplayProfile,
  buildParticipantProfile,
} from './liveRoomParticipants';
import {
  LiveRoomSidePanelTabs,
  type LiveRoomSidePanelTab,
} from './LiveRoomSidePanelTabs';
import { Separator } from '../cards/common/common';

interface LiveRoomProps {
  roomId: string;
}

const MAX_STAGE_TILES_PER_PAGE = 12;
const EMPTY_PARTICIPANT_IDS: string[] = [];

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

const useCountdownSeconds = (target: string | null | undefined): number => {
  const [seconds, setSeconds] = useState(() => {
    if (!target) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil((new Date(target).getTime() - Date.now()) / 1000),
    );
  });

  useEffect(() => {
    if (!target) {
      setSeconds(0);
      return undefined;
    }

    const update = (): void => {
      setSeconds(
        Math.max(
          0,
          Math.ceil((new Date(target).getTime() - Date.now()) / 1000),
        ),
      );
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return seconds;
};

const LiveBadge = ({ isLive }: { isLive: boolean }): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-8 px-2 py-0.5 typo-caption1',
      isLive
        ? 'bg-accent-ketchup-default text-white'
        : 'bg-accent-bacon-default text-white',
    )}
  >
    <span className="size-1.5 animate-pulse rounded-full bg-white" />
    <span className="font-bold uppercase tracking-wide">
      {isLive ? 'Live' : 'Lobby'}
    </span>
  </span>
);

const LiveRoomLobbyContent = ({
  room,
}: {
  room: LiveRoomModel;
}): ReactElement => (
  <div className="min-h-0 flex-1 overflow-y-auto p-1.5 pb-24 tablet:pb-28">
    <article className="mx-auto flex w-full max-w-[42rem] flex-col gap-5">
      {room.descriptionHtml ? (
        <Markdown
          content={room.descriptionHtml}
          className="break-words text-text-primary"
        />
      ) : (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          No agenda has been added yet.
        </Typography>
      )}
      <ContentEmbeds embeds={room.contentEmbeds} variant="post" />
    </article>
  </div>
);

const LiveRoomInner = ({ roomId }: LiveRoomProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isAuthReady, showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const pushNotifications = usePushNotificationContext();
  const {
    status,
    errorMessage,
    roomState,
    role,
    participantId,
    sendChatMessage,
    deleteChatMessage,
    sendChatMessageReaction,
    removeChatMessageReaction,
    grantCoHost,
    revokeCoHost,
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
  const privilegeState = getLiveRoomPrivilegeState(
    roomState,
    participantId,
    role,
  );
  const {
    data: room,
    error: roomError,
    isLoading: isRoomLoading,
  } = useLiveRoomQuery(roomId);
  const { subscribe, unsubscribe } = useLiveRoomSubscription(roomId);
  const lobbyCountdown = useCountdownSeconds(room?.scheduledStart);

  const { onAskConfirmation } = useExitConfirmation({
    message: 'Leave the standup? You will disconnect from the stream.',
    enabled: !isDevelopment,
    onValidateAction: () => status !== 'connected',
  });

  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LiveRoomSidePanelTab>('chat');
  const [stagePage, setStagePage] = useState(0);
  const lastLoggedRoomErrorRef = useRef<string | null>(null);
  const buildStandupExtra = useCallback(
    (extra: Record<string, unknown> = {}) =>
      buildStandupAnalyticsExtra(
        {
          roomId,
          authKind: user ? 'authenticated' : 'anonymous',
          role,
          roomStatus: roomState?.status ?? room?.status ?? null,
          roomMode: roomState?.mode ?? room?.mode ?? null,
          connectionStatus: status,
          participantId,
          isCoHost: privilegeState.isCoHost,
          hasLocalAudioTrack: !!localStream?.getAudioTracks()[0],
          hasLocalVideoTrack: !!localStream?.getVideoTracks()[0],
          videoQuality: videoSettings.quality,
          audioOnly: videoSettings.audioOnly,
          hideSelfView: videoSettings.hideSelfView,
        },
        extra,
      ),
    [
      roomId,
      user,
      role,
      roomState?.status,
      roomState?.mode,
      room?.status,
      room?.mode,
      status,
      participantId,
      privilegeState.isCoHost,
      localStream,
      videoSettings.quality,
      videoSettings.audioOnly,
      videoSettings.hideSelfView,
    ],
  );
  const logStandupAction = useCallback(
    (
      eventName: LogEvent,
      targetId: string,
      extra: Record<string, unknown> = {},
    ) => {
      logEvent({
        event_name: eventName,
        target_id: targetId,
        extra: buildStandupExtra(extra),
      });
    },
    [buildStandupExtra, logEvent],
  );

  const handleLeave = (): void => {
    onAskConfirmation(false);
    clearStoredLiveRoomResumeSession(roomId);
    router.push('/');
  };
  const handleNavigateBack = (surface: string): void => {
    logStandupAction(LogEvent.LeaveStandup, roomId, { surface });
    handleLeave();
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
      logStandupAction(LogEvent.SendStandupChatMessage, roomId, {
        surface: 'chat',
        messageLength: body.length,
      });
    } catch (error) {
      displayToast(error instanceof Error ? error.message : 'Message failed');
    }
  };

  const handleDeleteChatMessage = async (messageId: string): Promise<void> => {
    try {
      await deleteChatMessage(messageId);
      logStandupAction(LogEvent.DeleteStandupChatMessage, messageId, {
        surface: 'chat',
      });
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not delete message',
      );
    }
  };

  const handleSendChatMessageReaction = async (
    messageId: string,
    key: string,
    analytics: ChatReactionAnalytics,
  ): Promise<void> => {
    try {
      await sendChatMessageReaction(messageId, key);
      logStandupAction(LogEvent.SendStandupChatReaction, messageId, {
        surface: 'chat',
        reaction: key,
        ...analytics,
      });
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not react to message',
      );
    }
  };

  const handleRemoveChatMessageReaction = async (
    messageId: string,
    key: string,
    analytics: ChatReactionAnalytics,
  ): Promise<void> => {
    try {
      await removeChatMessageReaction(messageId, key);
      logStandupAction(LogEvent.RemoveStandupChatReaction, messageId, {
        surface: 'chat',
        reaction: key,
        ...analytics,
      });
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not remove reaction',
      );
    }
  };

  const handleSetParticipantChatEnabled = async (
    targetParticipantId: string,
    nextCanChat: boolean,
  ): Promise<void> => {
    try {
      await setParticipantChatEnabled(targetParticipantId, nextCanChat);
      logStandupAction(LogEvent.UpdateStandupChatAccess, targetParticipantId, {
        surface: 'chat',
        nextCanChat,
      });
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
      logStandupAction(LogEvent.KickStandupParticipant, targetParticipantId, {
        surface: 'chat',
      });
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Could not kick user',
      );
    }
  };

  const handleChatLogin = (): void => {
    showLogin({ trigger: AuthTriggers.MainButton });
  };
  const handlePromoteSpeaker = useCallback(
    async (targetParticipantId: string, surface: string): Promise<void> => {
      await promoteSpeaker(targetParticipantId);
      logStandupAction(LogEvent.PromoteStandupSpeaker, targetParticipantId, {
        surface,
      });
    },
    [logStandupAction, promoteSpeaker],
  );
  const handleRemoveSpeaker = useCallback(
    async (targetParticipantId: string, surface: string): Promise<void> => {
      await removeSpeaker(targetParticipantId);
      logStandupAction(LogEvent.RemoveStandupSpeaker, targetParticipantId, {
        surface,
      });
    },
    [logStandupAction, removeSpeaker],
  );
  const handleKickParticipant = useCallback(
    async (targetParticipantId: string, surface: string): Promise<void> => {
      await kickParticipant(targetParticipantId);
      logStandupAction(LogEvent.KickStandupParticipant, targetParticipantId, {
        surface,
      });
    },
    [kickParticipant, logStandupAction],
  );
  const handleGrantCoHost = useCallback(
    async (targetParticipantId: string, surface: string): Promise<void> => {
      await grantCoHost(targetParticipantId);
      logStandupAction(LogEvent.GrantStandupCoHost, targetParticipantId, {
        surface,
      });
    },
    [grantCoHost, logStandupAction],
  );
  const handleRevokeCoHost = useCallback(
    async (targetParticipantId: string, surface: string): Promise<void> => {
      await revokeCoHost(targetParticipantId);
      logStandupAction(LogEvent.RevokeStandupCoHost, targetParticipantId, {
        surface,
      });
    },
    [logStandupAction, revokeCoHost],
  );
  const handleTabChange = (tab: LiveRoomSidePanelTab): void => {
    if (tab === activeTab) {
      return;
    }

    logStandupAction(LogEvent.SwitchStandupPanelTab, tab, {
      surface: 'side_panel',
      previousTab: activeTab,
    });
    setActiveTab(tab);
  };
  const handleToggleSubscription = async (): Promise<void> => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.MainButton });
      return;
    }

    if (!room?.scheduledStart) {
      return;
    }

    try {
      if (room.subscribed) {
        await unsubscribe.mutateAsync();
        logStandupAction(LogEvent.UnsubscribeStandup, roomId, {
          surface: 'header',
        });
        displayToast('Lobby reminder removed');
        return;
      }

      await subscribe.mutateAsync();
      const shouldRequestPush =
        pushNotifications.isPushSupported && !pushNotifications.isSubscribed;
      let pushEnabled = pushNotifications.isSubscribed;
      if (shouldRequestPush) {
        pushEnabled = await pushNotifications.subscribe(
          NotificationPromptSource.StandupLobby,
        );
        logStandupAction(LogEvent.EnableStandupPush, roomId, {
          surface: 'header',
          enabled: pushEnabled,
        });
      }

      logStandupAction(LogEvent.SubscribeStandup, roomId, {
        surface: 'header',
        pushEnabled,
        pushPermissionRequested: shouldRequestPush,
      });
      displayToast(
        pushEnabled
          ? "We'll notify you when the standup goes live"
          : 'Reminder saved. Enable browser notifications to get a push.',
      );
    } catch (error) {
      displayToast(error instanceof Error ? error.message : 'Action failed');
    }
  };

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ViewStandup,
      target_id: roomId,
      extra: buildStandupExtra({ surface: 'page' }),
    }),
    { condition: !!room && !roomError && !isRoomLoading && isAuthReady },
  );

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
  const { hasHostPrivileges, isHost } = privilegeState;
  const isCreated = (roomState?.status ?? room?.status) === 'created';
  const isLive = (roomState?.status ?? room?.status) === 'live';
  const isEnded = roomState?.status === 'ended' || room?.status === 'ended';
  const roomMode = roomState?.mode ?? room?.mode ?? 'moderated';
  const isFreeForAll = roomMode === 'free_for_all';
  const streamTimerReference = isLive ? room?.startedAt ?? null : null;
  const streamDuration = useStreamDuration(streamTimerReference);
  const participantCount = roomState
    ? Object.keys(roomState.participants).length
    : room?.participantCount ?? 0;
  const hostId = room?.host.id ?? '';
  const coHostParticipantIds = roomState?.coHostParticipantIds ?? [];
  const activeSpeakerIds =
    roomState?.stage.activeSpeakerParticipantIds.filter(
      (id) => !!roomState.participants[id] && id !== hostId,
    ) ?? [];
  const queuedParticipantIds =
    roomState?.stage.speakerQueueParticipantIds.filter(
      (id) => !!roomState.participants[id],
    ) ?? [];
  const raisedHandParticipantIds =
    roomState?.stage.raisedHandParticipantIds ?? EMPTY_PARTICIPANT_IDS;
  const raisedHandQueuePositions = useMemo(() => {
    const positions = new Map<string, number>();
    if (!roomState) {
      return positions;
    }

    raisedHandParticipantIds.forEach((id) => {
      if (roomState.participants[id]) {
        positions.set(id, positions.size + 1);
      }
    });

    return positions;
  }, [raisedHandParticipantIds, roomState]);
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
          isCoHost: false,
          raisedHandQueuePosition: raisedHandQueuePositions.get(room.host.id),
        },
        ...activeSpeakerIds.map((id) => ({
          id,
          profile: buildDisplayProfile(
            participantProfilesById.get(id) ?? buildParticipantProfile(id),
          ),
          stream: participantStreamsById.get(id) ?? null,
          selfView: id === participantId,
          isHost: false,
          isCoHost: coHostParticipantIds.includes(id),
          raisedHandQueuePosition: raisedHandQueuePositions.get(id),
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
  const canSubscribeToLobby =
    isCreated && !!room?.scheduledStart && user?.id !== room?.host.id;
  const subscriptionBusy = subscribe.isPending || unsubscribe.isPending;

  useEffect(() => {
    if (isFreeForAll && activeTab === 'queue') {
      setActiveTab('audience');
    }
  }, [activeTab, isFreeForAll]);

  useEffect(() => {
    setStagePage((currentPage) => Math.min(currentPage, stagePageCount - 1));
  }, [stagePageCount]);

  useEffect(() => {
    if (!roomError) {
      lastLoggedRoomErrorRef.current = null;
      return;
    }

    const errorKey = `${roomId}:${roomError.message}`;
    if (lastLoggedRoomErrorRef.current === errorKey) {
      return;
    }
    lastLoggedRoomErrorRef.current = errorKey;

    logEvent({
      event_name: LogEvent.StandupError,
      target_id: 'room query',
      extra: buildStandupExtra({
        surface: 'page',
        source: 'room_query',
        message: roomError.message,
      }),
    });
  }, [buildStandupExtra, logEvent, roomError, roomId]);

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
          onClick={() => handleNavigateBack('load_error')}
        >
          Back home
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
          onClick={() => handleNavigateBack('connection_error')}
        >
          Back home
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
        <div className="flex flex-wrap items-center justify-end gap-3 text-text-tertiary typo-caption1">
          {canSubscribeToLobby ? (
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={
                room.subscribed
                  ? ButtonVariant.Secondary
                  : ButtonVariant.Primary
              }
              loading={subscriptionBusy}
              disabled={subscriptionBusy}
              onClick={() => handleToggleSubscription()}
            >
              {room.subscribed ? 'Unsubscribe' : 'Notify me'}
            </Button>
          ) : null}
          {roomState || room.scheduledStart ? (
            <span className="inline-flex flex-wrap items-center">
              {isLive ? (
                <span className="font-bold tabular-nums text-text-primary">
                  {formatStreamDuration(streamDuration)}
                </span>
              ) : null}
              {isCreated && room.scheduledStart ? (
                <span className="inline-flex items-center gap-1.5">
                  <span>Starting in</span>
                  <span className="font-bold tabular-nums text-text-primary">
                    {formatStreamDuration(lobbyCountdown)}
                  </span>
                </span>
              ) : null}
              {roomState && (isLive || (isCreated && room.scheduledStart)) ? (
                <Separator className="mx-2" />
              ) : null}
              {roomState ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-bold text-text-primary">
                    <AnimatedCount value={participantCount} />
                  </span>
                  <span>watching</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-label="Speakers"
          className="relative flex min-h-0 flex-col"
        >
          {!isCreated && stagePageCount > 1 ? (
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
          {isCreated ? <LiveRoomLobbyContent room={room} /> : null}
          {!isCreated && paginatedStageSpeakers.length > 0 ? (
            <div
              className="grid min-h-0 flex-1 gap-3 overflow-hidden p-1.5 pb-24 tablet:pb-28"
              style={{
                gridTemplateColumns: `repeat(${stageGridColumnCount}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${stageGridRowCount}, minmax(0, 1fr))`,
              }}
            >
              {paginatedStageSpeakers.map((speaker) => {
                const canModerate = hasHostPrivileges && !speaker.isHost;
                const canManageCoHosts = isHost && !speaker.isHost;

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
                      onGrantCoHost={
                        canManageCoHosts && !speaker.isCoHost
                          ? () =>
                              guardedModerationAction(
                                `tile-grant-cohost-${speaker.id}`,
                                () =>
                                  handleGrantCoHost(speaker.id, 'stage_tile'),
                              )
                          : undefined
                      }
                      onRevokeCoHost={
                        canManageCoHosts && speaker.isCoHost
                          ? () =>
                              guardedModerationAction(
                                `tile-revoke-cohost-${speaker.id}`,
                                () =>
                                  handleRevokeCoHost(speaker.id, 'stage_tile'),
                              )
                          : undefined
                      }
                      onRemoveSpeaker={
                        canModerate
                          ? () =>
                              guardedModerationAction(
                                `tile-remove-${speaker.id}`,
                                () =>
                                  handleRemoveSpeaker(speaker.id, 'stage_tile'),
                              )
                          : undefined
                      }
                      onKick={
                        canModerate
                          ? () =>
                              guardedModerationAction(
                                `tile-kick-${speaker.id}`,
                                () =>
                                  handleKickParticipant(
                                    speaker.id,
                                    'stage_tile',
                                  ),
                              )
                          : undefined
                      }
                      isRemoving={
                        moderationBusy === `tile-remove-${speaker.id}`
                      }
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
          ) : null}
          {!isCreated && paginatedStageSpeakers.length === 0 ? (
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
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-overlay-base-tertiary backdrop-blur">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
                <Typography type={TypographyType.Title3} bold>
                  This standup has ended
                </Typography>
                <Button
                  variant={ButtonVariant.Primary}
                  onClick={() => handleNavigateBack('ended_state')}
                >
                  Back home
                </Button>
              </div>
            </div>
          ) : null}

          {roomState && !isEnded ? (
            <LiveRoomControls roomId={roomId} onLeave={handleLeave} />
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
            onChange={handleTabChange}
          />
          <div className="min-h-0 flex-1">
            {activeTab === 'chat' ? (
              <LiveRoomChatPanel
                chatMessages={chatMessages}
                participantProfilesById={participantProfilesById}
                mentionSuggestions={mentionSuggestions}
                participantChatPermissions={roomState?.chatPermissions ?? {}}
                currentParticipantId={participantId}
                hostParticipantId={room.host.id}
                coHostParticipantIds={coHostParticipantIds}
                canChat={canChat}
                isLive={!!isLive}
                isEnded={!!isEnded}
                isLoggedIn={!!user}
                hasHostPrivileges={hasHostPrivileges}
                onSendMessage={handleSendChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
                onSendMessageReaction={handleSendChatMessageReaction}
                onRemoveMessageReaction={handleRemoveChatMessageReaction}
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
                coHostParticipantIds={coHostParticipantIds}
                canModerate={hasHostPrivileges}
                canManageCoHosts={isHost}
                stageLimit={stageLimit}
                moderationBusy={moderationBusy}
                guardedModerationAction={guardedModerationAction}
                grantCoHost={(targetParticipantId) =>
                  handleGrantCoHost(targetParticipantId, 'queue_panel')
                }
                revokeCoHost={(targetParticipantId) =>
                  handleRevokeCoHost(targetParticipantId, 'queue_panel')
                }
                promoteSpeaker={(targetParticipantId) =>
                  handlePromoteSpeaker(targetParticipantId, 'queue_panel')
                }
                removeSpeaker={(targetParticipantId) =>
                  handleRemoveSpeaker(targetParticipantId, 'queue_panel')
                }
                kickParticipant={(targetParticipantId) =>
                  handleKickParticipant(targetParticipantId, 'queue_panel')
                }
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
