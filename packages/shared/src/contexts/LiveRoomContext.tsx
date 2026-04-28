import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Device as MediasoupDevice,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import {
  LIVE_ROOM_JOIN_TOKEN_MUTATION,
  type LiveRoomJoinToken,
  type LiveRoomJoinTokenData,
} from '../graphql/liveRooms';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from './AuthContext';
import {
  buildLiveRoomWsUrl,
  LiveRoomConnection,
} from '../lib/liveRoom/connection';
import type {
  ChatMessageDeletedEvent,
  ChatMessageSentEvent,
  LiveRoomChatMessage,
  LiveRoomParticipantRoleValue,
  LiveRoomState,
  MediaCapabilitiesPayload,
  MediaPublicationPayload,
  MediaSubscriptionPayload,
  MediaTransportCreatePayload,
  ReactionSentEvent,
} from '../lib/liveRoom/protocol';

export type LiveRoomConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'closed'
  | 'error';

export interface RemoteMediaStream {
  participantId: string;
  publicationId: string;
  kind: 'audio' | 'video';
  stream: MediaStream;
}

export interface LiveRoomDeviceInfo {
  deviceId: string;
  label: string;
}

export interface LiveRoomReaction {
  id: string;
  participantId: string;
  emoji: string;
  createdAt: string;
  lane: number;
}

export type LiveRoomChatEntry = LiveRoomChatMessage;

interface RemoteSubscriptionHandle {
  stream: MediaStream;
  close: () => void;
  token?: symbol;
}

export interface LiveRoomContextValue {
  status: LiveRoomConnectionStatus;
  errorMessage: string | null;
  roomState: LiveRoomState | null;
  role: LiveRoomParticipantRoleValue | null;
  participantId: string | null;

  startRoom: () => Promise<void>;
  endRoom: () => Promise<void>;
  joinSpeakerQueue: () => Promise<void>;
  sendReaction: (emoji: string) => Promise<void>;
  sendChatMessage: (body: string) => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  setParticipantChatEnabled: (
    targetParticipantId: string,
    canChat: boolean,
  ) => Promise<void>;
  promoteSpeaker: (targetParticipantId: string) => Promise<void>;
  removeSpeaker: (targetParticipantId: string) => Promise<void>;
  kickParticipant: (targetParticipantId: string) => Promise<void>;
  canChat: boolean;

  canPublish: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isCameraPublishing: boolean;
  isMicPublishing: boolean;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;

  cameras: LiveRoomDeviceInfo[];
  microphones: LiveRoomDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
  selectCamera: (deviceId: string) => Promise<void>;
  selectMic: (deviceId: string) => Promise<void>;

  localStream: MediaStream | null;
  remoteStreams: RemoteMediaStream[];
  reactions: LiveRoomReaction[];
  chatMessages: LiveRoomChatEntry[];
}

const LiveRoomContext = createContext<LiveRoomContextValue | null>(null);

export const useLiveRoom = (): LiveRoomContextValue => {
  const ctx = useContext(LiveRoomContext);
  if (!ctx) {
    throw new Error('useLiveRoom must be used inside LiveRoomProvider');
  }
  return ctx;
};

const PUBLISH_ROLES: LiveRoomParticipantRoleValue[] = ['host', 'speaker'];
const REACTION_LIFETIME_MS = 2200;
const CHAT_HISTORY_LIMIT = 200;

interface LiveRoomProviderProps {
  roomId: string;
  children: ReactNode;
}

const fetchJoinToken = async (roomId: string): Promise<LiveRoomJoinToken> => {
  const data = await gqlClient.request<LiveRoomJoinTokenData>(
    LIVE_ROOM_JOIN_TOKEN_MUTATION,
    { roomId },
  );
  return data.liveRoomJoinToken;
};

const toDeviceInfo = (device: MediaDeviceInfo): LiveRoomDeviceInfo => ({
  deviceId: device.deviceId,
  label: device.label || `Device ${device.deviceId.slice(0, 6) || 'default'}`,
});

const buildConstraints = (
  kind: 'audio' | 'video',
  deviceId: string | null,
): MediaStreamConstraints => {
  const constraint: MediaTrackConstraints = deviceId
    ? { deviceId: { exact: deviceId } }
    : {};
  return kind === 'video' ? { video: constraint } : { audio: constraint };
};

export const LiveRoomProvider = ({
  roomId,
  children,
}: LiveRoomProviderProps): ReactElement => {
  const { user, isAuthReady } = useAuthContext();
  const [status, setStatus] = useState<LiveRoomConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<LiveRoomState | null>(null);
  const [role, setRole] = useState<LiveRoomParticipantRoleValue | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteMediaStream[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraPublishing, setIsCameraPublishing] = useState(false);
  const [isMicPublishing, setIsMicPublishing] = useState(false);
  const [cameras, setCameras] = useState<LiveRoomDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<LiveRoomDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedMicId, setSelectedMicId] = useState<string | null>(null);
  const [sendTransportReady, setSendTransportReady] = useState(false);
  const [recvTransportReady, setRecvTransportReady] = useState(false);
  const [connectionGeneration, setConnectionGeneration] = useState(0);
  const [reactions, setReactions] = useState<LiveRoomReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveRoomChatEntry[]>([]);

  const connectionRef = useRef<LiveRoomConnection | null>(null);
  const deviceRef = useRef<MediasoupDevice | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<'audio' | 'video', Producer>>(new Map());
  const localTracksRef = useRef<{
    audio: MediaStreamTrack | null;
    video: MediaStreamTrack | null;
  }>({ audio: null, video: null });
  const subscriptionsRef = useRef<Map<string, RemoteSubscriptionHandle>>(
    new Map(),
  );
  const currentRole =
    (participantId && roomState?.participants[participantId]?.role) || role;
  const canPublish = !!currentRole && PUBLISH_ROLES.includes(currentRole);
  const canChat =
    !!user &&
    roomState?.status === 'live' &&
    !!participantId &&
    (roomState.chatPermissions[participantId] ?? true);

  const pushReaction = useCallback((event: ReactionSentEvent) => {
    const createdAtMs = new Date(event.reaction.createdAt).getTime();
    const stableCreatedAt = Number.isNaN(createdAtMs)
      ? Date.now()
      : createdAtMs;
    const id = `${event.reaction.participantId}-${
      event.reaction.createdAt
    }-${Math.random().toString(36).slice(2)}`;
    const reaction: LiveRoomReaction = {
      id,
      participantId: event.reaction.participantId,
      emoji: event.reaction.key,
      createdAt: event.reaction.createdAt,
      lane: stableCreatedAt % 5,
    };
    setReactions((current) => [...current, reaction]);
    window.setTimeout(() => {
      setReactions((current) => current.filter((item) => item.id !== id));
    }, REACTION_LIFETIME_MS);
  }, []);

  const pushChatMessage = useCallback((event: ChatMessageSentEvent) => {
    setChatMessages((current) => {
      const next = [...current, event.message];

      if (next.length <= CHAT_HISTORY_LIMIT) {
        return next;
      }

      return next.slice(next.length - CHAT_HISTORY_LIMIT);
    });
  }, []);

  const removeChatMessage = useCallback((event: ChatMessageDeletedEvent) => {
    setChatMessages((current) =>
      current.filter((message) => message.messageId !== event.messageId),
    );
  }, []);

  useEffect(() => {
    setChatMessages([]);
  }, [roomId]);

  const closeMediaSession = useCallback((notifyServer = false) => {
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    sendTransportRef.current = null;
    recvTransportRef.current = null;
    deviceRef.current = null;
    setSendTransportReady(false);
    setRecvTransportReady(false);
    producersRef.current.forEach((producer) => {
      if (notifyServer) {
        connectionRef.current
          ?.send({
            type: 'media.publication.stop',
            publicationId: producer.id,
          })
          .catch(() => undefined);
      }

      producer.close();
    });
    producersRef.current.clear();
    subscriptionsRef.current.forEach(({ close }) => close());
    subscriptionsRef.current.clear();
    setRemoteStreams([]);
    setIsCameraPublishing(false);
    setIsMicPublishing(false);
  }, []);

  const stopLocalCapture = useCallback(() => {
    localTracksRef.current.audio?.stop();
    localTracksRef.current.video?.stop();
    localTracksRef.current.audio = null;
    localTracksRef.current.video = null;
    setLocalStream(null);
    setIsCameraOn(false);
    setIsMicOn(false);
  }, []);

  const { data: joinToken, error: joinError } = useQuery<
    LiveRoomJoinToken,
    Error
  >({
    queryKey: generateQueryKey(RequestKey.LiveRooms, user, 'join', roomId),
    queryFn: () => fetchJoinToken(roomId),
    enabled: isAuthReady && !!roomId,
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (joinError) {
      setStatus('error');
      setErrorMessage(joinError.message);
    }
  }, [joinError]);

  const refreshLocalStream = useCallback(() => {
    const tracks: MediaStreamTrack[] = [];
    if (localTracksRef.current.audio) {
      tracks.push(localTracksRef.current.audio);
    }
    if (localTracksRef.current.video) {
      tracks.push(localTracksRef.current.video);
    }
    setLocalStream(tracks.length ? new MediaStream(tracks) : null);
  }, []);

  const refreshDeviceList = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const nextCameras = list
        .filter((d) => d.kind === 'videoinput')
        .map(toDeviceInfo);
      const nextMics = list
        .filter((d) => d.kind === 'audioinput')
        .map(toDeviceInfo);
      setCameras(nextCameras);
      setMicrophones(nextMics);
      setSelectedCameraId((prev) => {
        if (prev && nextCameras.some((d) => d.deviceId === prev)) {
          return prev;
        }
        return nextCameras[0]?.deviceId ?? null;
      });
      setSelectedMicId((prev) => {
        if (prev && nextMics.some((d) => d.deviceId === prev)) {
          return prev;
        }
        return nextMics[0]?.deviceId ?? null;
      });
    } catch {
      // ignore
    }
  }, []);

  // Enumerate devices on mount and when device list changes (plug/unplug).
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return undefined;
    }
    refreshDeviceList();
    const handler = () => refreshDeviceList();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handler);
    };
  }, [refreshDeviceList]);

  // Open the websocket once we have a join token.
  useEffect(() => {
    if (!joinToken) {
      return undefined;
    }

    const wsUrl = buildLiveRoomWsUrl(process.env.NEXT_PUBLIC_SUBS_URL ?? '');
    if (!wsUrl) {
      setStatus('error');
      setErrorMessage('Live room websocket URL is not configured');
      return undefined;
    }

    const connection = new LiveRoomConnection({
      url: wsUrl,
      token: joinToken.token,
    });
    connectionRef.current = connection;
    setStatus('connecting');
    setErrorMessage(null);

    const offReady = connection.onSessionReady((event) => {
      setRole(event.role);
      setParticipantId(event.participantId);
      setStatus('connected');
      setConnectionGeneration((current) => current + 1);
    });
    const offSnapshot = connection.onSnapshot((event) => {
      setRoomState(event.room);
    });
    const offUpdated = connection.onRoomUpdated((event) => {
      setRoomState(event.room);
    });
    const offReaction = connection.onReactionSent((event) => {
      pushReaction(event);
    });
    const offChatMessage = connection.onChatMessage((event) => {
      pushChatMessage(event);
    });
    const offChatDeleted = connection.onChatMessageDeleted((event) => {
      removeChatMessage(event);
    });
    const offClose = connection.onClose(({ reason }) => {
      setStatus('closed');
      setErrorMessage(reason || 'Live room connection closed');
    });
    const offError = connection.onError((error) => {
      setStatus('error');
      setErrorMessage(error.message);
    });

    connection.open();

    return () => {
      offReady();
      offSnapshot();
      offUpdated();
      offReaction();
      offChatMessage();
      offChatDeleted();
      offClose();
      offError();
      connection.close();
      connectionRef.current = null;
    };
  }, [joinToken, pushChatMessage, pushReaction, removeChatMessage]);

  useEffect(() => {
    return () => {
      closeMediaSession(true);
      stopLocalCapture();
    };
  }, [closeMediaSession, stopLocalCapture]);

  useEffect(() => {
    if (status !== 'closed' && status !== 'error') {
      return;
    }

    closeMediaSession();
    stopLocalCapture();
  }, [closeMediaSession, status, stopLocalCapture]);

  useEffect(() => {
    if (canPublish) {
      return;
    }

    stopLocalCapture();
  }, [canPublish, stopLocalCapture]);

  // Initialize the mediasoup Device and transports once we are connected.
  useEffect(() => {
    if (status !== 'connected') {
      return undefined;
    }
    const connection = connectionRef.current;
    if (!connection) {
      return undefined;
    }

    let cancelled = false;
    const init = async () => {
      const { Device } = await import('mediasoup-client');
      const device = new Device();
      const routerRtpCapabilities =
        await connection.send<MediaCapabilitiesPayload>({
          type: 'media.capabilities.get',
        });
      if (cancelled) {
        return;
      }
      await device.load({ routerRtpCapabilities });
      if (cancelled) {
        return;
      }
      deviceRef.current = device;

      const recvOptions = await connection.send<MediaTransportCreatePayload>({
        type: 'media.transport.create',
        direction: 'recv',
      });
      if (cancelled) {
        return;
      }
      const recvTransport = device.createRecvTransport({
        id: recvOptions.transportId,
        iceParameters: recvOptions.iceParameters,
        iceCandidates: recvOptions.iceCandidates,
        dtlsParameters: recvOptions.dtlsParameters,
      });
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        connection
          .send({
            type: 'media.transport.connect',
            transportId: recvTransport.id,
            dtlsParameters,
          })
          .then(() => callback())
          .catch((err: Error) => errback(err));
      });
      recvTransportRef.current = recvTransport;
      setRecvTransportReady(true);

      if (canPublish) {
        const sendOptions = await connection.send<MediaTransportCreatePayload>({
          type: 'media.transport.create',
          direction: 'send',
        });
        if (cancelled) {
          return;
        }
        const sendTransport = device.createSendTransport({
          id: sendOptions.transportId,
          iceParameters: sendOptions.iceParameters,
          iceCandidates: sendOptions.iceCandidates,
          dtlsParameters: sendOptions.dtlsParameters,
        });
        sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          connection
            .send({
              type: 'media.transport.connect',
              transportId: sendTransport.id,
              dtlsParameters,
            })
            .then(() => callback())
            .catch((err: Error) => errback(err));
        });
        sendTransport.on(
          'produce',
          ({ kind, rtpParameters }, callback, errback) => {
            connection
              .send<MediaPublicationPayload>({
                type: 'media.publication.publish',
                transportId: sendTransport.id,
                kind: kind as 'audio' | 'video',
                rtpParameters,
              })
              .then((payload) => callback({ id: payload.publicationId }))
              .catch((err: Error) => errback(err));
          },
        );
        sendTransportRef.current = sendTransport;
        setSendTransportReady(true);
      }
    };

    init().catch((err: Error) => {
      if (cancelled) {
        return;
      }
      if (
        connection.resumeToken &&
        (err.message === 'LiveRoom connection is not open' ||
          err.message === 'Live room connection closed')
      ) {
        return;
      }
      setStatus('error');
      setErrorMessage(err.message);
    });

    return () => {
      cancelled = true;
      closeMediaSession(true);
    };
  }, [canPublish, closeMediaSession, connectionGeneration, status]);

  // Reconcile remote subscriptions with the room state's mediaPublications.
  useEffect(() => {
    const connection = connectionRef.current;
    const recvTransport = recvTransportRef.current;
    const device = deviceRef.current;
    if (!connection || !recvTransport || !device || !roomState) {
      return;
    }

    const publications = Object.values(roomState.mediaPublications);
    const wantedIds = new Set(
      publications
        .filter((pub) => pub.participantId !== participantId)
        .map((pub) => pub.publicationId),
    );

    subscriptionsRef.current.forEach((handle, publicationId) => {
      if (!wantedIds.has(publicationId)) {
        handle.close();
        subscriptionsRef.current.delete(publicationId);
        setRemoteStreams((prev) =>
          prev.filter((entry) => entry.publicationId !== publicationId),
        );
      }
    });

    publications.forEach((publication) => {
      if (publication.participantId === participantId) {
        return;
      }
      if (subscriptionsRef.current.has(publication.publicationId)) {
        return;
      }

      const token = Symbol(publication.publicationId);
      const placeholder: RemoteSubscriptionHandle = {
        stream: new MediaStream(),
        close: () => undefined,
        token,
      };
      subscriptionsRef.current.set(publication.publicationId, placeholder);

      (async () => {
        let closeConsumer: (() => void) | null = null;
        try {
          const sub = await connection.send<MediaSubscriptionPayload>({
            type: 'media.subscription.create',
            transportId: recvTransport.id,
            publicationId: publication.publicationId,
            rtpCapabilities: device.rtpCapabilities,
          });
          const consumer = await recvTransport.consume({
            id: sub.subscriptionId,
            producerId: sub.producerId,
            kind: sub.kind,
            rtpParameters: sub.rtpParameters,
            // Force the same streamId for audio + video consumers from the
            // same peer so libwebrtc syncs them as a single logical stream.
            streamId: `${publication.participantId}-audio-video`,
          });
          closeConsumer = () => consumer.close();
          await connection.send({
            type: 'media.subscription.resume',
            subscriptionId: sub.subscriptionId,
          });
          const current = subscriptionsRef.current.get(
            publication.publicationId,
          );
          if (!current || current.token !== token) {
            closeConsumer();
            return;
          }
          const stream = new MediaStream([consumer.track]);
          const handle = {
            stream,
            close: closeConsumer,
            token,
          };
          subscriptionsRef.current.set(publication.publicationId, handle);
          setRemoteStreams((prev) => [
            ...prev.filter(
              (entry) => entry.publicationId !== publication.publicationId,
            ),
            {
              participantId: publication.participantId,
              publicationId: publication.publicationId,
              kind: publication.kind,
              stream,
            },
          ]);
        } catch (err) {
          closeConsumer?.();
          subscriptionsRef.current.delete(publication.publicationId);
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to subscribe to media',
          );
        }
      })();
    });
  }, [roomState, participantId, recvTransportReady]);

  const setPublishingFlag = useCallback(
    (kind: 'audio' | 'video', value: boolean) => {
      if (kind === 'video') {
        setIsCameraPublishing(value);
      } else {
        setIsMicPublishing(value);
      }
    },
    [],
  );

  const publishLocalTrack = useCallback(
    async (kind: 'audio' | 'video') => {
      const sendTransport = sendTransportRef.current;
      const track = localTracksRef.current[kind];
      if (!sendTransport || !track) {
        return;
      }
      if (producersRef.current.has(kind)) {
        return;
      }
      try {
        const producer = await sendTransport.produce({ track });
        producersRef.current.set(kind, producer);
        setPublishingFlag(kind, true);
        producer.on('trackended', () => {
          producersRef.current.delete(kind);
          setPublishingFlag(kind, false);
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : `Failed to publish ${kind}`,
        );
      }
    },
    [setPublishingFlag],
  );

  const unpublishKind = useCallback(
    async (kind: 'audio' | 'video') => {
      const producer = producersRef.current.get(kind);
      if (!producer) {
        return;
      }
      producersRef.current.delete(kind);
      setPublishingFlag(kind, false);
      try {
        await connectionRef.current?.send({
          type: 'media.publication.stop',
          publicationId: producer.id,
        });
      } catch {
        // ignore — producer is already closed locally
      }
      producer.close();
    },
    [setPublishingFlag],
  );

  // Auto-publish local tracks once both the send transport is ready and the
  // room is live.
  useEffect(() => {
    if (!sendTransportReady) {
      return;
    }
    if (roomState?.status !== 'live') {
      return;
    }
    if (localTracksRef.current.audio && !producersRef.current.has('audio')) {
      publishLocalTrack('audio').catch(() => undefined);
    }
    if (localTracksRef.current.video && !producersRef.current.has('video')) {
      publishLocalTrack('video').catch(() => undefined);
    }
  }, [
    sendTransportReady,
    roomState?.status,
    publishLocalTrack,
    isCameraOn,
    isMicOn,
  ]);

  const startCapture = useCallback(
    async (kind: 'audio' | 'video', deviceId: string | null) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error('Media devices are not available');
      }
      const stream = await navigator.mediaDevices.getUserMedia(
        buildConstraints(kind, deviceId),
      );
      const track =
        kind === 'video'
          ? stream.getVideoTracks()[0]
          : stream.getAudioTracks()[0];
      if (!track) {
        throw new Error(`No ${kind} track available`);
      }
      const previous = localTracksRef.current[kind];
      const producer = producersRef.current.get(kind);
      if (producer) {
        try {
          await producer.replaceTrack({ track });
        } catch (err) {
          track.stop();
          setErrorMessage(
            err instanceof Error
              ? err.message
              : `Failed to update ${kind} track`,
          );
          return;
        }
      }
      localTracksRef.current[kind] = track;
      track.addEventListener('ended', () => {
        if (localTracksRef.current[kind] !== track) {
          return;
        }
        localTracksRef.current[kind] = null;
        refreshLocalStream();
        if (kind === 'video') {
          setIsCameraOn(false);
        } else {
          setIsMicOn(false);
        }
        unpublishKind(kind).catch(() => undefined);
      });
      previous?.stop();
      refreshLocalStream();
      // Refresh device list to capture labels now that we have permission.
      refreshDeviceList();
      if (producer) {
        return;
      }
      // Otherwise, publish if room is live and transport is ready.
      if (
        sendTransportRef.current &&
        roomState?.status === 'live' &&
        canPublish
      ) {
        await publishLocalTrack(kind);
      }
    },
    [
      refreshDeviceList,
      refreshLocalStream,
      publishLocalTrack,
      unpublishKind,
      canPublish,
      roomState?.status,
    ],
  );

  const stopCapture = useCallback(
    async (kind: 'audio' | 'video') => {
      await unpublishKind(kind);
      const track = localTracksRef.current[kind];
      if (track) {
        track.stop();
        localTracksRef.current[kind] = null;
      }
      refreshLocalStream();
    },
    [refreshLocalStream, unpublishKind],
  );

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await stopCapture('video');
      setIsCameraOn(false);
      return;
    }
    await startCapture('video', selectedCameraId);
    setIsCameraOn(true);
  }, [isCameraOn, selectedCameraId, startCapture, stopCapture]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      await stopCapture('audio');
      setIsMicOn(false);
      return;
    }
    await startCapture('audio', selectedMicId);
    setIsMicOn(true);
  }, [isMicOn, selectedMicId, startCapture, stopCapture]);

  const selectCamera = useCallback(
    async (deviceId: string) => {
      setSelectedCameraId(deviceId);
      if (isCameraOn) {
        await startCapture('video', deviceId);
      }
    },
    [isCameraOn, startCapture],
  );

  const selectMic = useCallback(
    async (deviceId: string) => {
      setSelectedMicId(deviceId);
      if (isMicOn) {
        await startCapture('audio', deviceId);
      }
    },
    [isMicOn, startCapture],
  );

  const startRoom = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'room.start' });
  }, []);

  const endRoom = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'room.end' });
  }, []);

  const joinSpeakerQueue = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'debate.queue.join' });
  }, []);

  const sendReaction = useCallback(async (emoji: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'debate.reaction.send', key: emoji });
  }, []);

  const sendChatMessage = useCallback(async (body: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'chat.message.send', body });
  }, []);

  const deleteChatMessage = useCallback(async (messageId: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({ type: 'chat.message.delete', messageId });
  }, []);

  const setParticipantChatEnabled = useCallback(
    async (targetParticipantId: string, nextCanChat: boolean) => {
      const connection = connectionRef.current;
      if (!connection) {
        throw new Error('Not connected');
      }
      await connection.send({
        type: 'chat.privilege.set',
        targetParticipantId,
        canChat: nextCanChat,
      });
    },
    [],
  );

  const promoteSpeaker = useCallback(async (targetParticipantId: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({
      type: 'debate.speaker.promote',
      targetParticipantId,
    });
  }, []);

  const removeSpeaker = useCallback(async (targetParticipantId: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({
      type: 'debate.speaker.remove',
      targetParticipantId,
    });
  }, []);

  const kickParticipant = useCallback(async (targetParticipantId: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      throw new Error('Not connected');
    }
    await connection.send({
      type: 'debate.kick',
      targetParticipantId,
    });
  }, []);

  const value = useMemo<LiveRoomContextValue>(
    () => ({
      status,
      errorMessage,
      roomState,
      role: currentRole,
      participantId,
      startRoom,
      endRoom,
      joinSpeakerQueue,
      sendReaction,
      sendChatMessage,
      deleteChatMessage,
      setParticipantChatEnabled,
      promoteSpeaker,
      removeSpeaker,
      kickParticipant,
      canChat,
      canPublish,
      isCameraOn,
      isMicOn,
      isCameraPublishing,
      isMicPublishing,
      toggleCamera,
      toggleMic,
      cameras,
      microphones,
      selectedCameraId,
      selectedMicId,
      selectCamera,
      selectMic,
      localStream,
      remoteStreams,
      reactions,
      chatMessages,
    }),
    [
      status,
      errorMessage,
      roomState,
      currentRole,
      participantId,
      startRoom,
      endRoom,
      joinSpeakerQueue,
      sendReaction,
      sendChatMessage,
      deleteChatMessage,
      setParticipantChatEnabled,
      promoteSpeaker,
      removeSpeaker,
      kickParticipant,
      canChat,
      canPublish,
      isCameraOn,
      isMicOn,
      isCameraPublishing,
      isMicPublishing,
      toggleCamera,
      toggleMic,
      cameras,
      microphones,
      selectedCameraId,
      selectedMicId,
      selectCamera,
      selectMic,
      localStream,
      remoteStreams,
      reactions,
      chatMessages,
    ],
  );

  return (
    <LiveRoomContext.Provider value={value}>
      {children}
    </LiveRoomContext.Provider>
  );
};
