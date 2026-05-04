import { useMemo, useRef } from 'react';
import type { RemoteMediaStream } from '../../contexts/LiveRoomContext';

interface CachedParticipantStream {
  signature: string;
  stream: MediaStream;
}

const getLiveTracks = (stream: MediaStream): MediaStreamTrack[] =>
  stream.getTracks().filter((track) => track.readyState === 'live');

const buildTrackSignature = (tracks: MediaStreamTrack[]): string =>
  tracks
    .map((track) => `${track.kind}:${track.id}:${track.readyState}`)
    .sort()
    .join('|');

const appendTracks = (
  tracksByParticipantId: Map<string, MediaStreamTrack[]>,
  participantId: string,
  tracks: MediaStreamTrack[],
): void => {
  if (tracks.length === 0) {
    return;
  }

  const currentTracks = tracksByParticipantId.get(participantId) ?? [];
  currentTracks.push(...tracks);
  tracksByParticipantId.set(participantId, currentTracks);
};

export const useLiveRoomParticipantStreams = (
  remoteStreams: RemoteMediaStream[],
  localStream: MediaStream | null,
  participantId: string | null,
): Map<string, MediaStream> => {
  const cacheRef = useRef<Map<string, CachedParticipantStream>>(new Map());

  return useMemo(() => {
    const tracksByParticipantId = new Map<string, MediaStreamTrack[]>();

    remoteStreams.forEach((entry) => {
      appendTracks(
        tracksByParticipantId,
        entry.participantId,
        getLiveTracks(entry.stream),
      );
    });

    const nextStreams = new Map<string, MediaStream>();
    const nextCache = new Map<string, CachedParticipantStream>();

    tracksByParticipantId.forEach((tracks, targetParticipantId) => {
      const signature = buildTrackSignature(tracks);
      const cached = cacheRef.current.get(targetParticipantId);
      const stream =
        cached?.signature === signature
          ? cached.stream
          : new MediaStream(tracks);

      nextStreams.set(targetParticipantId, stream);
      nextCache.set(targetParticipantId, { signature, stream });
    });

    if (localStream && participantId) {
      const localTracks = getLiveTracks(localStream);
      if (localTracks.length > 0) {
        nextStreams.set(participantId, localStream);
        nextCache.set(participantId, {
          signature: buildTrackSignature(localTracks),
          stream: localStream,
        });
      }
    }

    cacheRef.current = nextCache;

    return nextStreams;
  }, [localStream, participantId, remoteStreams]);
};
