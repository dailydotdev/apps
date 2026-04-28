import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQueries } from '@tanstack/react-query';
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
import {
  LiveRoomProvider,
  useLiveRoom as useLiveRoomConnection,
  type LiveRoomReaction,
  type RemoteMediaStream,
} from '../../contexts/LiveRoomContext';
import type { LiveRoomParticipantRecord } from '../../lib/liveRoom/protocol';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLiveRoom as useLiveRoomQuery } from '../../hooks/liveRooms/useLiveRoom';
import { useToastNotification } from '../../hooks/useToastNotification';
import { webappUrl } from '../../lib/constants';
import type { UserShortProfile } from '../../lib/user';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { Tooltip } from '../tooltip/Tooltip';
import {
  BlockIcon,
  DiscussIcon,
  PlusUserIcon,
  RemoveUserIcon,
  TimerIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { getUserShortInfo } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';

interface LiveRoomProps {
  roomId: string;
}

type SidePanelTab = 'chat' | 'queue';

const formatStreamDuration = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
};

const useStreamDuration = (isLive: boolean): number => {
  const startedAtRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) {
      startedAtRef.current = null;
      setElapsed(0);
      return undefined;
    }
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    const tick = () => {
      const start = startedAtRef.current;
      if (start === null) {
        return;
      }
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isLive]);

  return elapsed;
};

const AnimatedCount = ({ value }: { value: number }): ReactElement => (
  <span key={value} className="live-room-count-bump tabular-nums">
    {value}
  </span>
);

const buildParticipantStream = (
  targetParticipantId: string | null | undefined,
  remoteStreams: RemoteMediaStream[],
  localStream: MediaStream | null,
  participantId: string | null,
): MediaStream | null => {
  if (!targetParticipantId) {
    return null;
  }
  if (targetParticipantId === participantId) {
    return localStream;
  }
  const tracks: MediaStreamTrack[] = [];
  remoteStreams
    .filter((entry) => entry.participantId === targetParticipantId)
    .forEach((entry) => {
      entry.stream.getTracks().forEach((track) => tracks.push(track));
    });
  if (tracks.length === 0) {
    return null;
  }
  return new MediaStream(tracks);
};

const participantLabel = (participantId: string): string =>
  `Participant ${participantId.slice(0, 6)}`;

const userDisplayName = (user: Pick<UserShortProfile, 'username'>): string =>
  `@${user.username}`;

const buildParticipantProfile = (participantId: string): UserShortProfile => ({
  id: participantId,
  name: participantLabel(participantId),
  username: participantId,
  image: '',
  createdAt: '',
  reputation: 0,
  permalink: '#',
});

const buildDisplayProfile = (user: UserShortProfile): UserShortProfile => ({
  ...user,
  name: userDisplayName(user),
});

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

interface DebateQueueItemProps {
  participantId: string;
  profile?: UserShortProfile;
  subtitle?: string;
  leading?: ReactNode;
  actions?: ReactNode;
}

const DebateQueueItem = ({
  participantId,
  profile,
  subtitle,
  leading,
  actions,
}: DebateQueueItemProps): ReactElement => {
  const user = profile ?? buildParticipantProfile(participantId);

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
      {leading}
      <ProfilePicture user={user} size={ProfileImageSize.Small} />
      <div className="min-w-0 flex-1">
        <Typography type={TypographyType.Footnote} bold truncate>
          {userDisplayName(user)}
        </Typography>
        {subtitle ? (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            truncate
          >
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {actions}
    </li>
  );
};

interface SidePanelTabsProps {
  active: SidePanelTab;
  queueCount: number;
  onChange: (tab: SidePanelTab) => void;
}

const SidePanelTabs = ({
  active,
  queueCount,
  onChange,
}: SidePanelTabsProps): ReactElement => {
  const tabs: { id: SidePanelTab; label: string; count?: number }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'queue', label: 'Queue', count: queueCount },
  ];
  return (
    <div
      role="tablist"
      aria-label="Live room side panel"
      className="flex items-center gap-1 border-b border-border-subtlest-tertiary p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={classNames(
              'flex flex-1 items-center justify-center gap-2 rounded-10 px-3 py-2 transition-colors typo-callout',
              isActive
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={classNames(
                  'rounded-full px-1.5 typo-caption2',
                  isActive
                    ? 'bg-action-upvote-float text-action-upvote-default'
                    : 'bg-surface-float text-text-tertiary',
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

const LiveRoomChatPanel = ({
  reactions,
}: {
  reactions: LiveRoomReaction[];
}): ReactElement => (
  <div className="flex h-full flex-col">
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
      {reactions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
            <DiscussIcon size={IconSize.Small} />
          </span>
          <Typography type={TypographyType.Footnote} bold>
            No activity yet
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Reactions and chat appear here.
          </Typography>
        </div>
      ) : (
        reactions
          .slice()
          .reverse()
          .map((reaction) => (
            <div
              key={reaction.id}
              className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
            >
              <span className="text-xl leading-none">{reaction.emoji}</span>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {participantLabel(reaction.participantId)} reacted
              </Typography>
            </div>
          ))
      )}
    </div>
    <div className="border-t border-border-subtlest-tertiary p-3">
      <div className="flex w-full cursor-not-allowed items-center justify-between rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-2 text-text-quaternary">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Chat is coming soon
        </Typography>
      </div>
    </div>
  </div>
);

interface LiveRoomQueuePanelProps {
  activeSpeakerParticipantIds: string[];
  queuedParticipantIds: string[];
  participantsById: Record<string, LiveRoomParticipantRecord>;
  participantProfilesById: Map<string, UserShortProfile>;
  isHost: boolean;
  debateBusy: string | null;
  guardedDebateAction: (key: string, fn: () => Promise<void>) => Promise<void>;
  promoteSpeaker: (targetParticipantId: string) => Promise<void>;
  removeSpeaker: (targetParticipantId: string) => Promise<void>;
  kickParticipant: (targetParticipantId: string) => Promise<void>;
}

const LiveRoomQueuePanel = ({
  activeSpeakerParticipantIds,
  queuedParticipantIds,
  participantsById,
  participantProfilesById,
  isHost,
  debateBusy,
  guardedDebateAction,
  promoteSpeaker,
  removeSpeaker,
  kickParticipant,
}: LiveRoomQueuePanelProps): ReactElement => {
  const activeSpeakers = activeSpeakerParticipantIds
    .map((id) => participantsById[id])
    .filter(
      (participant): participant is LiveRoomParticipantRecord => !!participant,
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Typography type={TypographyType.Footnote} bold>
              On stage
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {activeSpeakers.length}
            </Typography>
          </div>
          {activeSpeakers.length === 0 ? (
            <div className="flex items-center gap-3 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-4 text-text-tertiary">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-float">
                <UserIcon size={IconSize.Small} />
              </span>
              <div className="min-w-0 flex-1">
                <Typography type={TypographyType.Footnote} bold>
                  No active speakers
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Promote someone from the queue to bring them on stage.
                </Typography>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {activeSpeakers.map((participant) => {
                const id = participant.participantId;
                return (
                  <DebateQueueItem
                    key={id}
                    participantId={id}
                    profile={participantProfilesById.get(id)}
                    actions={
                      isHost ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <Tooltip
                            content={`Remove ${userDisplayName(
                              participantProfilesById.get(id) ??
                                buildParticipantProfile(id),
                            )} from stage`}
                          >
                            <Button
                              type="button"
                              size={ButtonSize.XSmall}
                              variant={ButtonVariant.Tertiary}
                              icon={<RemoveUserIcon />}
                              loading={debateBusy === `remove-${id}`}
                              disabled={!!debateBusy}
                              aria-label={`Remove ${userDisplayName(
                                participantProfilesById.get(id) ??
                                  buildParticipantProfile(id),
                              )}`}
                              onClick={() =>
                                guardedDebateAction(`remove-${id}`, () =>
                                  removeSpeaker(id),
                                )
                              }
                            />
                          </Tooltip>
                          <Tooltip
                            content={`Kick ${userDisplayName(
                              participantProfilesById.get(id) ??
                                buildParticipantProfile(id),
                            )} from room`}
                          >
                            <Button
                              type="button"
                              size={ButtonSize.XSmall}
                              variant={ButtonVariant.Tertiary}
                              icon={<BlockIcon />}
                              loading={debateBusy === `kick-${id}`}
                              disabled={!!debateBusy}
                              aria-label={`Kick ${userDisplayName(
                                participantProfilesById.get(id) ??
                                  buildParticipantProfile(id),
                              )}`}
                              onClick={() =>
                                guardedDebateAction(`kick-${id}`, () =>
                                  kickParticipant(id),
                                )
                              }
                            />
                          </Tooltip>
                        </div>
                      ) : null
                    }
                  />
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Typography type={TypographyType.Footnote} bold>
              Queue
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {queuedParticipantIds.length}
            </Typography>
          </div>
          {queuedParticipantIds.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary p-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
                <UserIcon size={IconSize.Small} />
              </span>
              <Typography type={TypographyType.Footnote} bold>
                Queue is empty
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Audience members can request to speak.
              </Typography>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {queuedParticipantIds.map((id) => {
                const participant = participantsById[id];
                if (!participant) {
                  return null;
                }

                const profile =
                  participantProfilesById.get(id) ??
                  buildParticipantProfile(id);
                return (
                  <DebateQueueItem
                    key={id}
                    participantId={id}
                    profile={participantProfilesById.get(id)}
                    actions={
                      isHost ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <Tooltip
                            content={`Promote ${userDisplayName(
                              profile,
                            )} to speaker`}
                          >
                            <Button
                              type="button"
                              size={ButtonSize.XSmall}
                              variant={ButtonVariant.Primary}
                              icon={<PlusUserIcon />}
                              loading={debateBusy === `promote-${id}`}
                              disabled={!!debateBusy}
                              aria-label={`Promote ${userDisplayName(profile)}`}
                              onClick={() =>
                                guardedDebateAction(`promote-${id}`, () =>
                                  promoteSpeaker(id),
                                )
                              }
                            />
                          </Tooltip>
                          <Tooltip
                            content={`Kick ${userDisplayName(
                              profile,
                            )} from room`}
                          >
                            <Button
                              type="button"
                              size={ButtonSize.XSmall}
                              variant={ButtonVariant.Tertiary}
                              icon={<BlockIcon />}
                              loading={debateBusy === `kick-${id}`}
                              disabled={!!debateBusy}
                              aria-label={`Kick ${userDisplayName(profile)}`}
                              onClick={() =>
                                guardedDebateAction(`kick-${id}`, () =>
                                  kickParticipant(id),
                                )
                              }
                            />
                          </Tooltip>
                        </div>
                      ) : null
                    }
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

interface LiveBadgeProps {
  isLive: boolean;
}

const LiveBadge = ({ isLive }: LiveBadgeProps): ReactElement => (
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
  const { isAuthReady } = useAuthContext();
  const {
    status,
    errorMessage,
    roomState,
    role,
    participantId,
    promoteSpeaker,
    removeSpeaker,
    kickParticipant,
    localStream,
    remoteStreams,
    reactions,
  } = useLiveRoomConnection();
  const {
    data: room,
    error: roomError,
    isLoading: isRoomLoading,
  } = useLiveRoomQuery(roomId);

  const handleLeave = (): void => {
    router.push(`${webappUrl}live`);
  };

  const [debateBusy, setDebateBusy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('chat');
  const streamDuration = useStreamDuration(roomState?.status === 'live');

  const guardedDebateAction = async (
    key: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    if (debateBusy) {
      return;
    }
    setDebateBusy(key);
    try {
      await fn();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setDebateBusy(null);
    }
  };

  const debateParticipantIds = useMemo(() => {
    const ids = [
      ...(roomState?.debate?.activeSpeakerParticipantIds ?? []),
      ...(roomState?.debate?.speakerQueueParticipantIds ?? []),
    ].filter((id): id is string => !!id && id !== room?.host.id);

    return [...new Set(ids)];
  }, [room?.host.id, roomState?.debate]);
  const participantProfileQueries = useQueries({
    queries: debateParticipantIds.map((id) => ({
      queryKey: generateQueryKey(
        RequestKey.Profile,
        undefined,
        'live-room-participant',
        id,
      ),
      queryFn: () => getUserShortInfo(id),
      staleTime: ONE_MINUTE,
    })),
  });
  const participantProfilesById = new Map<string, UserShortProfile>();
  debateParticipantIds.forEach((id, index) => {
    const profile = participantProfileQueries[index]?.data;
    if (profile) {
      participantProfilesById.set(id, profile);
    }
  });

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
          We couldn&apos;t load this live room
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {roomError?.message ?? 'The room may no longer be available.'}
        </Typography>
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={handleLeave}
        >
          Back to live rooms
        </Button>
      </div>
    );
  }

  if (status === 'error' || status === 'closed') {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          {status === 'closed'
            ? 'Live room connection closed'
            : "We couldn't connect to this live room"}
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
          Back to live rooms
        </Button>
      </div>
    );
  }

  const isHost = role === 'host';
  const isCreated = roomState?.status === 'created';
  const isLive = roomState?.status === 'live';
  const isEnded = roomState?.status === 'ended' || room.status === 'ended';
  const participantCount = roomState
    ? Object.keys(roomState.participants).length
    : 0;
  const activeSpeakerIds =
    roomState?.debate?.activeSpeakerParticipantIds.filter(
      (id) => !!roomState.participants[id] && id !== room.host.id,
    ) ?? [];
  const queuedParticipantIds =
    roomState?.debate?.speakerQueueParticipantIds.filter(
      (id) => !!roomState.participants[id],
    ) ?? [];
  const hostProfile = buildDisplayProfile(room.host);

  const stageSpeakers: {
    id: string;
    profile: UserShortProfile;
    stream: MediaStream | null;
    selfView: boolean;
    isHost: boolean;
  }[] = [];
  const hostStream = buildParticipantStream(
    room.host.id,
    remoteStreams,
    localStream,
    participantId,
  );
  stageSpeakers.push({
    id: room.host.id,
    profile: hostProfile,
    stream: hostStream,
    selfView: room.host.id === participantId,
    isHost: true,
  });
  activeSpeakerIds.forEach((activeSpeakerId) => {
    stageSpeakers.push({
      id: activeSpeakerId,
      profile: buildDisplayProfile(
        participantProfilesById.get(activeSpeakerId) ??
          buildParticipantProfile(activeSpeakerId),
      ),
      stream: buildParticipantStream(
        activeSpeakerId,
        remoteStreams,
        localStream,
        participantId,
      ),
      selfView: activeSpeakerId === participantId,
      isHost: false,
    });
  });

  const showAudienceWaiting = isCreated && !isHost;

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
          <div className="flex flex-1 flex-wrap content-start gap-3 overflow-y-auto pb-24 tablet:pb-28">
            {stageSpeakers.map((speaker) => {
              const canModerate = isHost && !speaker.isHost;
              return (
                <div
                  key={speaker.id}
                  className="flex min-w-[18rem] flex-1 basis-[20rem]"
                >
                  <LiveRoomVideoTile
                    stream={speaker.stream}
                    user={speaker.profile}
                    selfView={speaker.selfView}
                    isHost={speaker.isHost}
                    onRemoveSpeaker={
                      canModerate
                        ? () =>
                            guardedDebateAction(
                              `tile-remove-${speaker.id}`,
                              () => removeSpeaker(speaker.id),
                            )
                        : undefined
                    }
                    onKick={
                      canModerate
                        ? () =>
                            guardedDebateAction(
                              `tile-kick-${speaker.id}`,
                              () => kickParticipant(speaker.id),
                            )
                        : undefined
                    }
                    isRemoving={
                      debateBusy === `tile-remove-${speaker.id}`
                    }
                    isKicking={debateBusy === `tile-kick-${speaker.id}`}
                    moderationDisabled={!!debateBusy}
                  />
                </div>
              );
            })}
            {stageSpeakers.length === 1 ? (
              <div className="flex min-w-[18rem] flex-1 basis-[20rem] items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
                    <UserIcon size={IconSize.Small} />
                  </span>
                  <Typography type={TypographyType.Footnote} bold>
                    Waiting for the next speaker
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    {queuedParticipantIds.length > 0
                      ? `${queuedParticipantIds.length} in queue`
                      : 'Audience can join the queue'}
                  </Typography>
                </div>
              </div>
            ) : null}
          </div>

          {showAudienceWaiting ? (
            <div className="absolute inset-x-0 top-0 flex justify-center p-3">
              <span className="rounded-10 bg-overlay-base-tertiary px-3 py-1.5 backdrop-blur">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Waiting for the host to start the room…
                </Typography>
              </span>
            </div>
          ) : null}

          {isEnded ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-overlay-base-tertiary backdrop-blur">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
                <Typography type={TypographyType.Title3} bold>
                  This live room has ended
                </Typography>
                <Button variant={ButtonVariant.Primary} onClick={handleLeave}>
                  Back to live rooms
                </Button>
              </div>
            </div>
          ) : null}

          {roomState && !isEnded ? (
            <LiveRoomControls onLeave={handleLeave} />
          ) : null}
        </section>

        <aside
          aria-label="Live room side panel"
          className="flex min-h-0 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float"
        >
          <SidePanelTabs
            active={activeTab}
            queueCount={queuedParticipantIds.length}
            onChange={setActiveTab}
          />
          <div className="min-h-0 flex-1">
            {activeTab === 'chat' ? (
              <LiveRoomChatPanel reactions={reactions} />
            ) : (
              <LiveRoomQueuePanel
                activeSpeakerParticipantIds={activeSpeakerIds}
                queuedParticipantIds={queuedParticipantIds}
                participantsById={roomState?.participants ?? {}}
                participantProfilesById={participantProfilesById}
                isHost={isHost}
                debateBusy={debateBusy}
                guardedDebateAction={guardedDebateAction}
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
