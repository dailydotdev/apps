import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { useSwipeable } from 'react-swipeable';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { Loader } from '../Loader';
import { LiveRoomChatPanel } from './LiveRoomChatPanel';
import type { ChatReactionAnalytics } from './LiveRoomChatReactions';
import { LiveRoomQueuePanel } from './LiveRoomQueuePanel';
import {
  LiveRoomProvider,
  useLiveRoom as useLiveRoomConnection,
} from '../../contexts/LiveRoomContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { isDevelopment } from '../../lib/constants';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { getLiveRoomPrivilegeState } from '../../lib/liveRoom/privileges';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { useLiveRoom as useLiveRoomQuery } from '../../hooks/liveRooms/useLiveRoom';
import { useStreamDuration } from '../../hooks/liveRooms/useStreamDuration';
import { useCountdownSeconds } from '../../hooks/liveRooms/useCountdownSeconds';
import { useLiveRoomStandupAnalytics } from '../../hooks/liveRooms/useLiveRoomStandupAnalytics';
import { useLiveRoomStageModel } from '../../hooks/liveRooms/useLiveRoomStageModel';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { useViewSize, ViewSize } from '../../hooks';
import { clearStoredLiveRoomResumeSession } from '../../lib/liveRoom/resumeSessionStorage';
import { useLiveRoomSubscription } from '../../hooks/liveRooms/useLiveRoomSubscription';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { usePushNotificationMutation } from '../../hooks/notifications/usePushNotificationMutation';
import {
  LiveRoomSidePanelTabs,
  type LiveRoomSidePanelTab,
} from './LiveRoomSidePanelTabs';
import { LiveRoomControls } from './LiveRoomControls';
import { LiveRoomHeader } from './LiveRoomHeader';
import { LiveRoomLobby } from './LiveRoomLobby';
import lobbyStyles from './LiveRoomLobby.module.css';
import { LiveRoomReactionOverlay } from './LiveRoomReactionOverlay';
import { LiveRoomStage } from './LiveRoomStage';

interface LiveRoomProps {
  roomId: string;
}

const LiveRoomInner = ({ roomId }: LiveRoomProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isAuthReady, showLogin, user } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isMobile = !isTablet;
  const { isPushSupported, isSubscribed: isPushEnabled } =
    usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();
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
    toggleMic,
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
  const [focusedSpeakerIndex, setFocusedSpeakerIndex] = useState<number | null>(
    null,
  );
  const [hasUnseenQueueJoins, setHasUnseenQueueJoins] = useState(false);
  const previousQueueLengthRef = useRef<number | null>(null);
  const lastLoggedRoomErrorRef = useRef<string | null>(null);
  const { buildStandupExtra, logStandupAction } = useLiveRoomStandupAnalytics({
    roomId,
    user,
    role,
    roomStatus: roomState?.status ?? room?.status ?? null,
    roomMode: roomState?.mode ?? room?.mode ?? null,
    connectionStatus: status,
    participantId,
    isCoHost: privilegeState.isCoHost,
    localStream,
    videoSettings,
  });

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
  const handleToggleSelfTileMute = useCallback(async (): Promise<void> => {
    try {
      await toggleMic();
      logStandupAction(LogEvent.ChangeStandupSettings, 'mic', {
        surface: 'stage_tile',
        value: !isMicOn,
      });
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Failed to update mic',
      );
    }
  }, [displayToast, isMicOn, logStandupAction, toggleMic]);
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
  const handleTabChange = (
    tab: LiveRoomSidePanelTab,
    source: 'tab_click' | 'swipe' = 'tab_click',
  ): void => {
    if (tab === activeTab) {
      return;
    }

    logStandupAction(LogEvent.SwitchStandupPanelTab, tab, {
      surface: 'side_panel',
      previousTab: activeTab,
      source,
    });
    setActiveTab(tab);
  };
  const standupShareLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return `${window.location.origin}/standups/${roomId}`;
  }, [roomId]);
  const standupShareText = room
    ? `Join me for "${room.topic}", a live developer standup on daily.dev`
    : 'Join this developer standup on daily.dev';
  const [, shareOrCopyStandup] = useShareOrCopyLink({
    link: standupShareLink,
    text: standupShareText,
    logObject: (provider) => ({
      event_name: LogEvent.ShareStandup,
      target_id: roomId,
      extra: buildStandupExtra({
        surface: 'lobby_hero',
        provider,
      }),
    }),
  });
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
          surface: 'lobby_hero',
        });
        displayToast('Lobby reminder removed');
        return;
      }

      await subscribe.mutateAsync();
      const shouldRequestPush = isPushSupported && !isPushEnabled;
      let pushEnabled = isPushEnabled;
      if (shouldRequestPush) {
        pushEnabled = await onEnablePush(NotificationPromptSource.StandupLobby);
      }

      logStandupAction(LogEvent.SubscribeStandup, roomId, {
        surface: 'lobby_hero',
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

  const { hasHostPrivileges, isHost } = privilegeState;
  const isCreated = (roomState?.status ?? room?.status) === 'created';
  const isLive = (roomState?.status ?? room?.status) === 'live';
  const isEnded = roomState?.status === 'ended' || room?.status === 'ended';
  const streamTimerReference = isLive ? room?.startedAt ?? null : null;
  const streamDuration = useStreamDuration(streamTimerReference);
  const participantCount = roomState
    ? Object.keys(roomState.participants).length
    : room?.participantCount ?? 0;
  const {
    participantProfilesById,
    mentionSuggestions,
    roomMode,
    isFreeForAll,
    activeSpeakerIds,
    queuedParticipantIds,
    audienceParticipantIds,
    coHostParticipantIds,
    stageLimit,
    waitingPrompt,
    stagePageCount,
    clampedStagePage,
    visibleStageSpeakers,
    paginatedStageSpeakers,
    stagePageStart,
    stageTilesPerPage,
    stageGridColumnCount,
    stageGridRowCount,
  } = useLiveRoomStageModel({
    room,
    roomState,
    chatMessages,
    remoteStreams,
    localStream,
    participantId,
    isMicOn,
    videoSettings,
    isMobile,
    stagePage,
  });
  const canSubscribeToLobby =
    isCreated && !!room?.scheduledStart && user?.id !== room?.host.id;
  const subscriptionBusy = subscribe.isPending || unsubscribe.isPending;

  useEffect(() => {
    if (isFreeForAll && activeTab === 'queue') {
      setActiveTab('audience');
    }
  }, [activeTab, isFreeForAll]);

  useEffect(() => {
    if (!roomState) {
      return;
    }
    const queueLength = queuedParticipantIds.length;
    const previousLength = previousQueueLengthRef.current;
    previousQueueLengthRef.current = queueLength;

    if (queueLength === 0) {
      setHasUnseenQueueJoins(false);
      return;
    }
    if (previousLength === null) {
      return;
    }
    if (!hasHostPrivileges || isFreeForAll) {
      return;
    }
    if (activeTab === 'queue') {
      return;
    }
    if (queueLength <= previousLength) {
      return;
    }
    setHasUnseenQueueJoins(true);
  }, [
    roomState,
    queuedParticipantIds.length,
    hasHostPrivileges,
    isFreeForAll,
    activeTab,
  ]);

  useEffect(() => {
    if (activeTab === 'queue') {
      setHasUnseenQueueJoins(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setStagePage((currentPage) => Math.min(currentPage, stagePageCount - 1));
  }, [stagePageCount]);

  useEffect(() => {
    if (
      focusedSpeakerIndex !== null &&
      focusedSpeakerIndex >= visibleStageSpeakers.length
    ) {
      setFocusedSpeakerIndex(null);
    }
  }, [focusedSpeakerIndex, visibleStageSpeakers.length]);

  const focusSpeaker = (globalIndex: number): void => {
    const speaker = visibleStageSpeakers[globalIndex];
    if (!speaker) {
      return;
    }
    logStandupAction(LogEvent.FocusStandupSpeaker, speaker.id, {
      surface: 'stage_tile',
      action: 'open',
      source: 'tap',
      isSelf: !!speaker.selfView,
      position: globalIndex,
      totalSpeakers: visibleStageSpeakers.length,
    });
    setFocusedSpeakerIndex(globalIndex);
  };
  const unfocusSpeaker = (): void => {
    if (focusedSpeakerIndex === null) {
      return;
    }
    const speaker = visibleStageSpeakers[focusedSpeakerIndex];
    logStandupAction(LogEvent.FocusStandupSpeaker, speaker?.id ?? '', {
      surface: 'stage_tile',
      action: 'close',
      source: 'backdrop',
      position: focusedSpeakerIndex,
      totalSpeakers: visibleStageSpeakers.length,
    });
    setFocusedSpeakerIndex(null);
  };
  const handleSpeakerFocusNavigate = (delta: 1 | -1): void => {
    if (focusedSpeakerIndex === null || visibleStageSpeakers.length === 0) {
      return;
    }
    const total = visibleStageSpeakers.length;
    const nextIndex = (((focusedSpeakerIndex + delta) % total) + total) % total;
    const nextSpeaker = visibleStageSpeakers[nextIndex];
    logStandupAction(LogEvent.FocusStandupSpeaker, nextSpeaker?.id ?? '', {
      surface: 'stage_tile',
      action: 'navigate',
      source: delta === 1 ? 'swipe_next' : 'swipe_prev',
      isSelf: !!nextSpeaker?.selfView,
      position: nextIndex,
      totalSpeakers: total,
    });
    setStagePage(Math.floor(nextIndex / stageTilesPerPage));
    setFocusedSpeakerIndex(nextIndex);
  };

  const sidePanelTabs: {
    id: LiveRoomSidePanelTab;
    label: string;
    count?: number;
  }[] = [
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
  ];
  const sidePanelTabIds = sidePanelTabs.map((tab) => tab.id);
  const activeTabIndex = sidePanelTabIds.indexOf(activeTab);
  const navigateSidePanelTab = (delta: 1 | -1): void => {
    const nextIndex = activeTabIndex + delta;
    if (nextIndex < 0 || nextIndex >= sidePanelTabIds.length) {
      return;
    }
    handleTabChange(sidePanelTabIds[nextIndex], 'swipe');
  };
  const sidePanelSwipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateSidePanelTab(1),
    onSwipedRight: () => navigateSidePanelTab(-1),
    trackTouch: true,
    trackMouse: false,
  });

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

    logStandupAction(LogEvent.StandupError, 'room query', {
      surface: 'page',
      source: 'room_query',
      message: roomError.message,
    });
  }, [logStandupAction, roomError, roomId]);

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

  const chatPanelNode = (
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
  );

  if (isCreated) {
    return (
      <div className="relative isolate flex flex-1 flex-col overflow-hidden tablet:gap-3 tablet:p-4">
        <span aria-hidden="true" className={lobbyStyles.lobbyBackground}>
          <span className={lobbyStyles.pulseRing} />
          <span
            className={`${lobbyStyles.pulseRing} ${lobbyStyles.pulseRingDelay1}`}
          />
          <span
            className={`${lobbyStyles.pulseRing} ${lobbyStyles.pulseRingDelay2}`}
          />
          <span
            className={`${lobbyStyles.pulseRing} ${lobbyStyles.pulseRingDelay3}`}
          />
          <span
            className={`${lobbyStyles.pulseRing} ${lobbyStyles.pulseRingDelay4}`}
          />
        </span>
        <LiveRoomReactionOverlay reactions={reactions} />
        <LiveRoomLobby
          room={room}
          lobbyCountdown={lobbyCountdown}
          participantCount={participantCount}
          showParticipantCount={!!roomState}
          canSubscribeToLobby={canSubscribeToLobby}
          subscribed={room.subscribed}
          subscriptionBusy={subscriptionBusy}
          onToggleSubscription={handleToggleSubscription}
          isHost={isHost}
          onNavigateBack={handleNavigateBack}
          onShare={shareOrCopyStandup}
          audienceParticipantIds={audienceParticipantIds}
          participantProfilesById={participantProfilesById}
          chatPanel={chatPanelNode}
          hostControls={
            hasHostPrivileges && roomState ? (
              <LiveRoomControls roomId={roomId} onLeave={handleLeave} />
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden tablet:gap-3 tablet:p-4">
      <LiveRoomReactionOverlay reactions={reactions} />

      <LiveRoomHeader
        title={room.topic}
        isLive={!!isLive}
        isCreated={!!isCreated}
        scheduledStart={room.scheduledStart}
        streamDuration={streamDuration}
        lobbyCountdown={lobbyCountdown}
        participantCount={participantCount}
        showParticipantCount={!!roomState}
        canSubscribeToLobby={canSubscribeToLobby}
        subscribed={room.subscribed}
        subscriptionBusy={subscriptionBusy}
        onToggleSubscription={handleToggleSubscription}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] tablet:grid-rows-none tablet:gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <LiveRoomStage
          roomId={roomId}
          isEnded={!!isEnded}
          stagePageCount={stagePageCount}
          clampedStagePage={clampedStagePage}
          setStagePage={setStagePage}
          stageGridColumnCount={stageGridColumnCount}
          stageGridRowCount={stageGridRowCount}
          speakers={paginatedStageSpeakers}
          stagePageStart={stagePageStart}
          focusedSpeakerIndex={focusedSpeakerIndex}
          waitingPrompt={waitingPrompt}
          hasHostPrivileges={hasHostPrivileges}
          isHost={isHost}
          moderationBusy={moderationBusy}
          onFocusSpeaker={focusSpeaker}
          onUnfocusSpeaker={unfocusSpeaker}
          onSpeakerFocusNavigate={handleSpeakerFocusNavigate}
          guardedModerationAction={guardedModerationAction}
          onGrantCoHost={handleGrantCoHost}
          onRevokeCoHost={handleRevokeCoHost}
          onRemoveSpeaker={handleRemoveSpeaker}
          onKickParticipant={handleKickParticipant}
          onToggleSelfMute={handleToggleSelfTileMute}
          onNavigateBack={handleNavigateBack}
          showControls={!!roomState}
          onLeave={handleLeave}
        />

        <aside
          aria-label="Standup side panel"
          className="flex h-[40dvh] min-h-0 flex-col overflow-hidden rounded-none border-x-0 border-b-0 border-t border-border-subtlest-tertiary bg-surface-float tablet:h-auto tablet:rounded-16 tablet:border-x tablet:border-b"
        >
          <LiveRoomSidePanelTabs
            active={activeTab}
            tabs={sidePanelTabs}
            onChange={handleTabChange}
            attentionTabId="queue"
            hasAttention={hasUnseenQueueJoins}
          />
          <div {...sidePanelSwipeHandlers} className="min-h-0 flex-1">
            {activeTab === 'chat' ? (
              chatPanelNode
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
