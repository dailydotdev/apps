import { useMemo } from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import type { LiveRoom as LiveRoomModel } from '../../graphql/liveRooms';
import type { UserShortProfile } from '../../lib/user';
import {
  buildDisplayProfile,
  buildParticipantProfile,
} from '../../components/liveRooms/liveRoomParticipants';
import type { LiveRoomStageSpeaker } from '../../components/liveRooms/LiveRoomStage';
import { useLiveRoomParticipantProfiles } from './useLiveRoomParticipantProfiles';
import { useLiveRoomParticipantStreams } from './useLiveRoomParticipantStreams';

const MAX_STAGE_TILES_PER_PAGE = 12;
const MOBILE_MAX_STAGE_TILES_PER_PAGE = 4;
const EMPTY_PARTICIPANT_IDS: string[] = [];

const getStageGridColumnCount = (count: number, isMobile: boolean): number => {
  if (count <= 1) {
    return 1;
  }
  if (isMobile) {
    return 2;
  }
  if (count <= 4) {
    return 2;
  }
  if (count <= 9) {
    return 3;
  }
  return 4;
};

interface UseLiveRoomStageModelProps {
  room?: LiveRoomModel;
  roomState: LiveRoomContextValue['roomState'];
  chatMessages: LiveRoomContextValue['chatMessages'];
  remoteStreams: LiveRoomContextValue['remoteStreams'];
  localStream: MediaStream | null;
  participantId: string | null;
  isMicOn: boolean;
  videoSettings: LiveRoomContextValue['videoSettings'];
  isMobile: boolean;
  stagePage: number;
}

export const useLiveRoomStageModel = ({
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
}: UseLiveRoomStageModelProps) => {
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
  const audioPublisherIds = useMemo(
    () =>
      new Set(
        Object.values(roomState?.mediaPublications ?? {})
          .filter((publication) => publication.kind === 'audio')
          .map((publication) => publication.participantId),
      ),
    [roomState?.mediaPublications],
  );
  const roomMode = roomState?.mode ?? room?.mode ?? 'moderated';
  const isFreeForAll = roomMode === 'free_for_all';
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

  const stageSpeakers: LiveRoomStageSpeaker[] = room?.host
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
        isMuted: speaker.selfView
          ? !isMicOn
          : !audioPublisherIds.has(speaker.id),
      }))
    : [];
  const visibleStageSpeakers = stageSpeakers.filter(
    (speaker) => !speaker.selfView || !videoSettings.hideSelfView,
  );
  const stageTilesPerPage = isMobile
    ? MOBILE_MAX_STAGE_TILES_PER_PAGE
    : MAX_STAGE_TILES_PER_PAGE;
  const stagePageCount = Math.max(
    1,
    Math.ceil(visibleStageSpeakers.length / stageTilesPerPage),
  );
  const clampedStagePage = Math.min(stagePage, stagePageCount - 1);
  const stagePageStart = clampedStagePage * stageTilesPerPage;
  const paginatedStageSpeakers = visibleStageSpeakers.slice(
    stagePageStart,
    stagePageStart + stageTilesPerPage,
  );
  const stageGridColumnCount = getStageGridColumnCount(
    paginatedStageSpeakers.length,
    isMobile,
  );
  const stageGridRowCount = Math.max(
    1,
    Math.ceil(paginatedStageSpeakers.length / stageGridColumnCount),
  );

  return {
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
  };
};
