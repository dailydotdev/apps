import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQueries } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
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
import { AuthTriggers } from '../../lib/auth';
import { webappUrl } from '../../lib/constants';
import type { UserShortProfile } from '../../lib/user';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { BlockIcon, PlusUserIcon, RemoveUserIcon } from '../icons';
import { getUserShortInfo } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';

interface LiveRoomProps {
  roomId: string;
}

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
      className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4 overflow-hidden"
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
  participant: LiveRoomParticipantRecord;
  profile?: UserShortProfile;
  isHost: boolean;
  isBusy: boolean;
  onKick: (participantId: string) => Promise<void>;
}

const DebateQueueItem = ({
  participantId,
  participant,
  profile,
  isHost,
  isBusy,
  onKick,
}: DebateQueueItemProps): ReactElement => {
  const user = profile ?? buildParticipantProfile(participantId);

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-12 bg-surface-secondary px-3 py-2">
      <ProfilePicture user={user} size={ProfileImageSize.Small} />
      <div className="min-w-0 flex-1">
        <Typography type={TypographyType.Footnote} bold truncate>
          {userDisplayName(user)}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          truncate
        >
          {participant.role}
        </Typography>
      </div>
      {isHost ? (
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          icon={<BlockIcon />}
          loading={isBusy}
          aria-label={`Kick ${userDisplayName(user)}`}
          onClick={() => onKick(participantId)}
        />
      ) : null}
    </li>
  );
};

const renderQueueItem = ({
  debateBusy,
  isHost,
  kickParticipant,
  participant,
  participantId,
  profile,
  guardedDebateAction,
}: {
  debateBusy: string | null;
  isHost: boolean;
  kickParticipant: (targetParticipantId: string) => Promise<void>;
  participant: LiveRoomParticipantRecord | undefined;
  participantId: string;
  profile?: UserShortProfile;
  guardedDebateAction: (key: string, fn: () => Promise<void>) => Promise<void>;
}): ReactElement | null => {
  if (!participant) {
    return null;
  }

  return (
    <DebateQueueItem
      key={participantId}
      participantId={participantId}
      participant={participant}
      profile={profile}
      isHost={isHost}
      isBusy={debateBusy === `kick-${participantId}`}
      onKick={(targetId) =>
        guardedDebateAction(`kick-${targetId}`, () => kickParticipant(targetId))
      }
    />
  );
};

const LiveRoomInner = ({ roomId }: LiveRoomProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const {
    status,
    errorMessage,
    roomState,
    role,
    participantId,
    startRoom,
    promoteNextSpeaker,
    removeCurrentSpeaker,
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

  const handleStart = async (): Promise<void> => {
    try {
      await startRoom();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Could not start room');
    }
  };

  const [debateBusy, setDebateBusy] = useState<string | null>(null);

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

  const hostStream = useMemo(
    () =>
      buildParticipantStream(
        room?.host.id,
        remoteStreams,
        localStream,
        participantId,
      ),
    [room?.host.id, remoteStreams, localStream, participantId],
  );
  const debateParticipantIds = useMemo(() => {
    const ids = [
      roomState?.debate?.activeSpeakerParticipantId,
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

  if (!isAuthReady || (isLoggedIn && isRoomLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          Sign in to join this live room
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Live rooms are only available to signed-in members right now.
        </Typography>
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={() => showLogin({ trigger: AuthTriggers.MainButton })}
        >
          Sign in
        </Button>
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
  const activeSpeakerId = roomState?.debate?.activeSpeakerParticipantId ?? null;
  const activeSpeaker = activeSpeakerId
    ? roomState?.participants[activeSpeakerId]
    : null;
  const activeSpeakerStream = buildParticipantStream(
    activeSpeakerId,
    remoteStreams,
    localStream,
    participantId,
  );
  const queuedParticipantIds =
    roomState?.debate?.speakerQueueParticipantIds.filter(
      (id) => !!roomState.participants[id],
    ) ?? [];
  const activeSpeakerProfile = activeSpeakerId
    ? buildDisplayProfile(
        participantProfilesById.get(activeSpeakerId) ??
          buildParticipantProfile(activeSpeakerId),
      )
    : null;
  const hostProfile = buildDisplayProfile(room.host);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4">
      <ReactionOverlay reactions={reactions} />
      <header className="flex flex-col gap-1">
        <Typography type={TypographyType.Title2} bold>
          {room.topic}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Hosted by {userDisplayName(room.host)} &middot; {participantCount}{' '}
          participant
          {participantCount === 1 ? '' : 's'}
        </Typography>
      </header>

      <div className="grid gap-4 laptop:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <div className="grid gap-4 tablet:grid-cols-2">
          <LiveRoomVideoTile
            stream={hostStream}
            user={hostProfile}
            selfView={room.host.id === participantId}
            label={
              // eslint-disable-next-line no-nested-ternary
              isLive
                ? 'Host'
                : isCreated && isHost && hostStream
                ? 'Preview'
                : 'Host'
            }
          />
          {activeSpeaker && activeSpeakerProfile ? (
            <LiveRoomVideoTile
              stream={activeSpeakerStream}
              user={activeSpeakerProfile}
              selfView={activeSpeakerId === participantId}
              label="Active speaker"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-float p-4 text-center">
              <Typography type={TypographyType.Title3} bold>
                No active speaker
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Waiting for the next speaker
              </Typography>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Typography type={TypographyType.Title3} bold>
                Speaker queue
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {queuedParticipantIds.length} waiting
              </Typography>
            </div>
            {isHost ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                icon={<PlusUserIcon />}
                loading={debateBusy === 'promote'}
                disabled={
                  queuedParticipantIds.length === 0 ||
                  !!activeSpeakerId ||
                  !!debateBusy
                }
                onClick={() =>
                  guardedDebateAction('promote', promoteNextSpeaker)
                }
              >
                Promote
              </Button>
            ) : null}
          </div>

          {activeSpeakerId && isHost ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<RemoveUserIcon />}
                loading={debateBusy === 'remove-speaker'}
                disabled={!!debateBusy}
                onClick={() =>
                  guardedDebateAction('remove-speaker', removeCurrentSpeaker)
                }
              >
                Remove
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<BlockIcon />}
                loading={debateBusy === `kick-${activeSpeakerId}`}
                disabled={!!debateBusy}
                onClick={() =>
                  guardedDebateAction(`kick-${activeSpeakerId}`, () =>
                    kickParticipant(activeSpeakerId),
                  )
                }
              >
                Kick
              </Button>
            </div>
          ) : null}

          <ul
            className={classNames(
              'flex flex-col gap-2',
              queuedParticipantIds.length > 4 && 'max-h-72 overflow-y-auto',
            )}
          >
            {queuedParticipantIds.length ? (
              queuedParticipantIds.map((id) =>
                renderQueueItem({
                  debateBusy,
                  guardedDebateAction,
                  isHost,
                  kickParticipant,
                  participant: roomState?.participants[id],
                  participantId: id,
                  profile: participantProfilesById.get(id),
                }),
              )
            ) : (
              <li className="rounded-12 border border-border-subtlest-tertiary p-3 text-center">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Queue is empty
                </Typography>
              </li>
            )}
          </ul>
        </aside>
      </div>

      {isCreated && isHost ? (
        <Button variant={ButtonVariant.Primary} onClick={handleStart}>
          Go live
        </Button>
      ) : null}

      {isCreated && !isHost ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Waiting for the host to start the room…
        </Typography>
      ) : null}

      {isEnded ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Typography type={TypographyType.Title3} bold>
            This live room has ended
          </Typography>
          <Button variant={ButtonVariant.Primary} onClick={handleLeave}>
            Back to live rooms
          </Button>
        </div>
      ) : (
        <LiveRoomControls onLeave={handleLeave} />
      )}

      {status === 'connecting' ? (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Connecting…
        </Typography>
      ) : null}
    </div>
  );
};

export const LiveRoom = ({ roomId }: LiveRoomProps): ReactElement => (
  <LiveRoomProvider roomId={roomId}>
    <LiveRoomInner roomId={roomId} />
  </LiveRoomProvider>
);

export default LiveRoom;
