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
  ConnectionState,
  Consumer,
  Device as MediasoupDevice,
  Producer,
  Transport,
} from 'mediasoup-client/types';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import {
  LIVE_ROOM_JOIN_TOKEN_MUTATION,
  type LiveRoomJoinToken,
  type LiveRoomJoinTokenData,
} from '../graphql/liveRooms';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from './AuthContext';
import { useLogContext } from './LogContext';
import {
  buildLiveRoomWsUrl,
  LiveRoomConnection,
} from '../lib/liveRoom/connection';
import { buildStandupAnalyticsExtra } from '../lib/liveRoom/analytics';
import { getLiveRoomPrivilegeState } from '../lib/liveRoom/privileges';
import { LogEvent } from '../lib/log';
import {
  clearStoredLiveRoomResumeSession,
  readStoredLiveRoomResumeSession,
  touchStoredLiveRoomResumeSession,
  type StoredLiveRoomResumeSession,
  writeStoredLiveRoomResumeSession,
} from '../lib/liveRoom/resumeSessionStorage';
import { storageWrapper } from '../lib/storageWrapper';
import type {
  ChatMessageDeletedEvent,
  ChatMessageSentEvent,
  LiveRoomCommand,
  LiveRoomChatMessage,
  LiveRoomParticipantRoleValue,
  LiveRoomState,
  MediaCapabilitiesPayload,
  MediaPublicationPayload,
  MediaSubscriptionPayload,
  MediaTransportIceRestartPayload,
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

export interface LiveRoomMicSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface LiveRoomMicSettingSupport {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export type LiveRoomVideoQuality = 'auto' | 'data_saver' | 'high';

export interface LiveRoomVideoSettings {
  audioOnly: boolean;
  quality: LiveRoomVideoQuality;
  hideSelfView: boolean;
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
  kind: 'audio' | 'video';
  paused: boolean;
  preferredSpatialLayer?: number;
  subscriptionId?: string;
  consumer?: Consumer;
  stream: MediaStream;
  close: () => void;
  token?: symbol;
}

type MediaTransportDirection = 'send' | 'recv';

export interface LiveRoomContextValue {
  status: LiveRoomConnectionStatus;
  errorMessage: string | null;
  roomState: LiveRoomState | null;
  role: LiveRoomParticipantRoleValue | null;
  participantId: string | null;

  startRoom: () => Promise<void>;
  endRoom: () => Promise<void>;
  joinSpeakerQueue: () => Promise<void>;
  joinStage: () => Promise<void>;
  leaveStage: () => Promise<void>;
  sendReaction: (emoji: string) => Promise<void>;
  sendChatMessage: (body: string) => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  grantCoHost: (targetParticipantId: string) => Promise<void>;
  revokeCoHost: (targetParticipantId: string) => Promise<void>;
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
  micSettings: LiveRoomMicSettings;
  micSettingSupport: LiveRoomMicSettingSupport;
  setMicSetting: (
    setting: keyof LiveRoomMicSettings,
    enabled: boolean,
  ) => Promise<void>;
  videoSettings: LiveRoomVideoSettings;
  setVideoSetting: <K extends keyof LiveRoomVideoSettings>(
    setting: K,
    value: LiveRoomVideoSettings[K],
  ) => void;

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

const defaultMicSettings: LiveRoomMicSettings = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const defaultMicSettingSupport: LiveRoomMicSettingSupport = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const liveRoomMicSettingsStorageKey = 'live-room-mic-settings';
const liveRoomVideoSettingsStorageKey = 'live-room-video-settings';

const defaultVideoSettings: LiveRoomVideoSettings = {
  audioOnly: false,
  quality: 'auto',
  hideSelfView: false,
};

const videoQualityValues: LiveRoomVideoQuality[] = [
  'auto',
  'data_saver',
  'high',
];

const readStoredMicSettings = (): LiveRoomMicSettings => {
  const storedValue = storageWrapper.getItem(liveRoomMicSettingsStorageKey);
  if (!storedValue) {
    return defaultMicSettings;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<LiveRoomMicSettings>;

    return {
      echoCancellation:
        typeof parsed.echoCancellation === 'boolean'
          ? parsed.echoCancellation
          : defaultMicSettings.echoCancellation,
      noiseSuppression:
        typeof parsed.noiseSuppression === 'boolean'
          ? parsed.noiseSuppression
          : defaultMicSettings.noiseSuppression,
      autoGainControl:
        typeof parsed.autoGainControl === 'boolean'
          ? parsed.autoGainControl
          : defaultMicSettings.autoGainControl,
    };
  } catch {
    return defaultMicSettings;
  }
};

const readStoredVideoSettings = (): LiveRoomVideoSettings => {
  const storedValue = storageWrapper.getItem(liveRoomVideoSettingsStorageKey);
  if (!storedValue) {
    return defaultVideoSettings;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<LiveRoomVideoSettings>;

    return {
      audioOnly:
        typeof parsed.audioOnly === 'boolean'
          ? parsed.audioOnly
          : defaultVideoSettings.audioOnly,
      quality: videoQualityValues.includes(
        parsed.quality as LiveRoomVideoQuality,
      )
        ? (parsed.quality as LiveRoomVideoQuality)
        : defaultVideoSettings.quality,
      hideSelfView:
        typeof parsed.hideSelfView === 'boolean'
          ? parsed.hideSelfView
          : defaultVideoSettings.hideSelfView,
    };
  } catch {
    return defaultVideoSettings;
  }
};

const toDeviceInfo = (device: MediaDeviceInfo): LiveRoomDeviceInfo => ({
  deviceId: device.deviceId,
  label: device.label || `Device ${device.deviceId.slice(0, 6) || 'default'}`,
});

const buildAudioConstraints = (
  deviceId: string | null,
  micSettings: LiveRoomMicSettings,
  micSettingSupport: LiveRoomMicSettingSupport,
): MediaTrackConstraints => {
  const constraints: MediaTrackConstraints = deviceId
    ? { deviceId: { exact: deviceId } }
    : {};

  if (micSettingSupport.echoCancellation) {
    constraints.echoCancellation = micSettings.echoCancellation;
  }

  if (micSettingSupport.noiseSuppression) {
    constraints.noiseSuppression = micSettings.noiseSuppression;
  }

  if (micSettingSupport.autoGainControl) {
    constraints.autoGainControl = micSettings.autoGainControl;
  }

  return constraints;
};

const buildConstraints = (
  kind: 'audio' | 'video',
  deviceId: string | null,
  micSettings: LiveRoomMicSettings,
  micSettingSupport: LiveRoomMicSettingSupport,
): MediaStreamConstraints => {
  const constraint: MediaTrackConstraints = deviceId
    ? { deviceId: { exact: deviceId } }
    : {};

  if (kind === 'video') {
    return { video: constraint };
  }

  return {
    audio: buildAudioConstraints(deviceId, micSettings, micSettingSupport),
  };
};

const videoSimulcastEncodings = [
  { rid: 'low', scaleResolutionDownBy: 4, maxBitrate: 150_000 },
  { rid: 'medium', scaleResolutionDownBy: 2, maxBitrate: 500_000 },
  { rid: 'high', scaleResolutionDownBy: 1, maxBitrate: 1_500_000 },
] as const;

const videoQualitySpatialLayer: Record<LiveRoomVideoQuality, number> = {
  auto: 1,
  data_saver: 0,
  high: 2,
};

const videoQualityOutgoingBitrateLimit: Record<LiveRoomVideoQuality, number> = {
  auto: 1_500_000,
  data_saver: 500_000,
  high: 2_500_000,
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const LiveRoomProvider = ({
  roomId,
  children,
}: LiveRoomProviderProps): ReactElement => {
  const { user, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
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
  const [micSettings, setMicSettings] = useState<LiveRoomMicSettings>(
    readStoredMicSettings,
  );
  const [videoSettings, setVideoSettings] = useState<LiveRoomVideoSettings>(
    readStoredVideoSettings,
  );
  const [micSettingSupport, setMicSettingSupport] =
    useState<LiveRoomMicSettingSupport>(defaultMicSettingSupport);
  const [sendTransportReady, setSendTransportReady] = useState(false);
  const [recvTransportReady, setRecvTransportReady] = useState(false);
  const [connectionGeneration, setConnectionGeneration] = useState(0);
  const [reactions, setReactions] = useState<LiveRoomReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveRoomChatEntry[]>([]);
  const [storedResumeSession, setStoredResumeSession] =
    useState<StoredLiveRoomResumeSession | null>(() =>
      readStoredLiveRoomResumeSession(roomId),
    );
  const [resumeSessionTtlMs, setResumeSessionTtlMs] = useState<number | null>(
    null,
  );

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
  const audioOnlyRef = useRef(videoSettings.audioOnly);
  const videoQualityRef = useRef(videoSettings.quality);
  const mediaRestartInFlightRef = useRef<
    Record<MediaTransportDirection, boolean>
  >({
    send: false,
    recv: false,
  });
  const mediaRebuildQueuedRef = useRef(false);
  const currentRole =
    (participantId && roomState?.participants[participantId]?.role) || role;
  const privilegeState = getLiveRoomPrivilegeState(
    roomState,
    participantId,
    currentRole,
  );
  const canPublish = !!currentRole && PUBLISH_ROLES.includes(currentRole);
  const canChat =
    !!user &&
    roomState?.status === 'live' &&
    !!participantId &&
    (roomState.chatPermissions[participantId] ?? true);
  const buildStandupExtra = useCallback(
    (extra: Record<string, unknown> = {}) =>
      buildStandupAnalyticsExtra(
        {
          roomId,
          authKind: user ? 'authenticated' : 'anonymous',
          role: currentRole,
          roomStatus: roomState?.status ?? null,
          roomMode: roomState?.mode ?? null,
          connectionStatus: status,
          participantId,
          isCoHost: privilegeState.isCoHost,
          hasLocalAudioTrack: !!localTracksRef.current.audio,
          hasLocalVideoTrack: !!localTracksRef.current.video,
          videoQuality: videoSettings.quality,
          audioOnly: videoSettings.audioOnly,
          hideSelfView: videoSettings.hideSelfView,
          isResuming: !!storedResumeSession,
        },
        extra,
      ),
    [
      roomId,
      user,
      currentRole,
      roomState?.status,
      roomState?.mode,
      status,
      participantId,
      privilegeState.isCoHost,
      videoSettings.quality,
      videoSettings.audioOnly,
      videoSettings.hideSelfView,
      storedResumeSession,
    ],
  );
  const logStandupError = useCallback(
    (
      targetId: string,
      message: string,
      extra: Record<string, unknown> = {},
    ) => {
      logEvent({
        event_name: LogEvent.StandupError,
        target_id: targetId,
        extra: buildStandupExtra({
          message,
          ...extra,
        }),
      });
    },
    [buildStandupExtra, logEvent],
  );
  const logStandupErrorRef = useRef(logStandupError);
  const sendTransportReadyRef = useRef(sendTransportReady);
  const recvTransportReadyRef = useRef(recvTransportReady);

  useEffect(() => {
    logStandupErrorRef.current = logStandupError;
  }, [logStandupError]);

  useEffect(() => {
    sendTransportReadyRef.current = sendTransportReady;
  }, [sendTransportReady]);

  useEffect(() => {
    recvTransportReadyRef.current = recvTransportReady;
  }, [recvTransportReady]);

  const sendConnectionCommand = useCallback(
    async <T,>(
      operation: string,
      payload: LiveRoomCommand,
      extra: Record<string, unknown> = {},
    ): Promise<T> => {
      const connection = connectionRef.current;
      if (!connection) {
        const error = new Error('Not connected');
        logStandupErrorRef.current('websocket command', error.message, {
          source: 'command',
          operation,
          ...extra,
        });
        throw error;
      }

      try {
        return await connection.send<T>(payload);
      } catch (error) {
        const message = getErrorMessage(error, `Failed to ${operation}`);
        logStandupErrorRef.current('websocket command', message, {
          source: 'command',
          operation,
          ...extra,
        });
        throw error instanceof Error ? error : new Error(message);
      }
    },
    [],
  );

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
    mediaRestartInFlightRef.current.send = false;
    mediaRestartInFlightRef.current.recv = false;
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

  const queueMediaRebuild = useCallback(() => {
    if (mediaRebuildQueuedRef.current || status !== 'connected') {
      return;
    }

    mediaRebuildQueuedRef.current = true;
    window.setTimeout(() => {
      mediaRebuildQueuedRef.current = false;
      closeMediaSession();
      setConnectionGeneration((current) => current + 1);
    }, 0);
  }, [closeMediaSession, status]);

  const setRemoteSubscriptionPaused = useCallback(
    async (publicationId: string, paused: boolean) => {
      const connection = connectionRef.current;
      const handle = subscriptionsRef.current.get(publicationId);
      if (
        !connection ||
        !handle?.subscriptionId ||
        !handle.consumer ||
        handle.paused === paused
      ) {
        return;
      }

      if (paused) {
        await connection.send({
          type: 'media.subscription.pause',
          subscriptionId: handle.subscriptionId,
        });
        handle.consumer.pause();
      } else {
        await connection.send({
          type: 'media.subscription.resume',
          subscriptionId: handle.subscriptionId,
        });
        handle.consumer.resume();
      }

      handle.paused = paused;
    },
    [],
  );

  const setRemoteSubscriptionPreferredSpatialLayer = useCallback(
    async (publicationId: string, spatialLayer: number) => {
      const connection = connectionRef.current;
      const handle = subscriptionsRef.current.get(publicationId);
      if (
        !connection ||
        handle?.kind !== 'video' ||
        !handle.subscriptionId ||
        handle.preferredSpatialLayer === spatialLayer
      ) {
        return;
      }

      await connection.send({
        type: 'media.subscription.preferredSpatialLayer.set',
        subscriptionId: handle.subscriptionId,
        spatialLayer,
      });

      handle.preferredSpatialLayer = spatialLayer;
    },
    [],
  );

  const setRecvTransportOutgoingBitrateLimit = useCallback(
    async (bitrate: number) => {
      const connection = connectionRef.current;
      const recvTransport = recvTransportRef.current;
      if (!connection || !recvTransport) {
        return;
      }

      await connection.send({
        type: 'media.transport.outgoingBitrate.set',
        transportId: recvTransport.id,
        bitrate,
      });
    },
    [],
  );

  const restartTransportIce = useCallback(
    async (
      direction: MediaTransportDirection,
      transportId: string,
    ): Promise<void> => {
      if (mediaRestartInFlightRef.current[direction]) {
        return;
      }

      const connection = connectionRef.current;
      const transport =
        direction === 'send'
          ? sendTransportRef.current
          : recvTransportRef.current;
      if (
        !connection ||
        !transport ||
        transport.closed ||
        transport.id !== transportId
      ) {
        return;
      }

      mediaRestartInFlightRef.current[direction] = true;
      try {
        const restart = await connection.send<MediaTransportIceRestartPayload>({
          type: 'media.transport.restartIce',
          transportId,
        });
        const currentTransport =
          direction === 'send'
            ? sendTransportRef.current
            : recvTransportRef.current;
        if (
          !currentTransport ||
          currentTransport.closed ||
          currentTransport.id !== transportId
        ) {
          return;
        }

        await currentTransport.restartIce({
          iceParameters: restart.iceParameters,
        });
      } catch {
        queueMediaRebuild();
      } finally {
        mediaRestartInFlightRef.current[direction] = false;
      }
    },
    [queueMediaRebuild],
  );

  const attachTransportHealthHandlers = useCallback(
    (direction: MediaTransportDirection, transport: Transport) => {
      transport.on(
        'connectionstatechange',
        (connectionState: ConnectionState) => {
          if (connectionState === 'disconnected') {
            restartTransportIce(direction, transport.id).catch(() => undefined);
            return;
          }

          if (connectionState === 'failed' || connectionState === 'closed') {
            queueMediaRebuild();
          }
        },
      );
    },
    [queueMediaRebuild, restartTransportIce],
  );

  const { data: joinToken, error: joinError } = useQuery<
    LiveRoomJoinToken,
    Error
  >({
    queryKey: generateQueryKey(RequestKey.LiveRooms, user, 'join', roomId),
    queryFn: () => fetchJoinToken(roomId),
    enabled: isAuthReady && !!roomId && !storedResumeSession,
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
      logStandupErrorRef.current('join token fetch', joinError.message, {
        source: 'join_token',
      });
    }
  }, [joinError]);

  useEffect(() => {
    setStoredResumeSession(readStoredLiveRoomResumeSession(roomId));
  }, [roomId]);

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
    } catch (error) {
      logStandupErrorRef.current(
        'device enumerate',
        getErrorMessage(error, 'Failed to enumerate devices'),
        { source: 'device_list' },
      );
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

  useEffect(() => {
    storageWrapper.setItem(
      liveRoomMicSettingsStorageKey,
      JSON.stringify(micSettings),
    );
  }, [micSettings]);

  useEffect(() => {
    storageWrapper.setItem(
      liveRoomVideoSettingsStorageKey,
      JSON.stringify(videoSettings),
    );
  }, [videoSettings]);

  useEffect(() => {
    audioOnlyRef.current = videoSettings.audioOnly;
  }, [videoSettings.audioOnly]);

  useEffect(() => {
    videoQualityRef.current = videoSettings.quality;
  }, [videoSettings.quality]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    const supported = navigator.mediaDevices.getSupportedConstraints?.();
    if (!supported) {
      return;
    }

    setMicSettingSupport({
      echoCancellation: supported.echoCancellation ?? false,
      noiseSuppression: supported.noiseSuppression ?? false,
      autoGainControl: supported.autoGainControl ?? false,
    });
  }, []);

  // Open the websocket once we have a fresh join token or a cached resume token.
  useEffect(() => {
    if (!storedResumeSession && !joinToken) {
      return undefined;
    }

    const wsUrl = buildLiveRoomWsUrl(process.env.NEXT_PUBLIC_SUBS_URL ?? '');
    if (!wsUrl) {
      setStatus('error');
      setErrorMessage('Standup websocket URL is not configured');
      logStandupErrorRef.current(
        'websocket config',
        'Standup websocket URL is not configured',
        { source: 'connection_config' },
      );
      return undefined;
    }

    const connection = new LiveRoomConnection({
      url: wsUrl,
      ...(storedResumeSession
        ? { resumeToken: storedResumeSession.resumeToken }
        : { token: joinToken?.token ?? '' }),
    });
    connectionRef.current = connection;
    setStatus('connecting');
    setErrorMessage(null);
    const openingWithResume = !!storedResumeSession;
    let sessionReady = false;

    const offReady = connection.onSessionReady((event) => {
      sessionReady = true;
      setRole(event.role);
      setParticipantId(event.participantId);
      setResumeSessionTtlMs(event.resumeSessionTtlMs);
      setStatus('connected');
      setConnectionGeneration((current) => current + 1);
      const nextStoredSession = {
        roomId: event.roomId,
        participantId: event.participantId,
        resumeToken: event.resumeToken,
        ttlMs: event.resumeSessionTtlMs,
        updatedAt: Date.now(),
      };
      writeStoredLiveRoomResumeSession(nextStoredSession);
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
      if (openingWithResume && !sessionReady) {
        clearStoredLiveRoomResumeSession(roomId);
        setStoredResumeSession(null);
        setStatus('idle');
        setErrorMessage(null);
        return;
      }
      setStatus('closed');
      setErrorMessage(reason || 'Standup connection closed');
    });
    const offError = connection.onError((error) => {
      if (openingWithResume && !sessionReady) {
        return;
      }
      setStatus('error');
      setErrorMessage(error.message);
      logStandupErrorRef.current('websocket error', error.message, {
        source: 'connection',
      });
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
  }, [
    joinToken,
    pushChatMessage,
    pushReaction,
    removeChatMessage,
    roomId,
    storedResumeSession,
  ]);

  useEffect(() => {
    if (status !== 'connected' || !resumeSessionTtlMs) {
      return undefined;
    }

    touchStoredLiveRoomResumeSession(roomId);
    const intervalMs = Math.max(1_000, Math.floor(resumeSessionTtlMs / 2));
    const interval = window.setInterval(() => {
      touchStoredLiveRoomResumeSession(roomId);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [resumeSessionTtlMs, roomId, status]);

  useEffect(() => {
    if (roomState?.status === 'ended') {
      clearStoredLiveRoomResumeSession(roomId);
      return;
    }

    if (participantId && roomState && !roomState.participants[participantId]) {
      clearStoredLiveRoomResumeSession(roomId);
    }
  }, [participantId, roomId, roomState]);

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
    if (
      deviceRef.current ||
      recvTransportRef.current ||
      sendTransportRef.current
    ) {
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
      attachTransportHealthHandlers('recv', recvTransport);
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
        attachTransportHealthHandlers('send', sendTransport);
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
          err.message === 'Standup connection closed')
      ) {
        return;
      }
      logStandupErrorRef.current('media init', err.message, {
        source: 'media_init',
        connectionGeneration,
        recvTransportReady: recvTransportReadyRef.current,
        sendTransportReady: sendTransportReadyRef.current,
      });
      setStatus('error');
      setErrorMessage(err.message);
    });

    return () => {
      cancelled = true;
      closeMediaSession(true);
    };
  }, [
    attachTransportHealthHandlers,
    canPublish,
    closeMediaSession,
    connectionGeneration,
    status,
  ]);

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
        kind: publication.kind,
        paused: publication.kind === 'video' && audioOnlyRef.current,
        preferredSpatialLayer:
          publication.kind === 'video'
            ? videoQualitySpatialLayer[videoQualityRef.current]
            : undefined,
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
          const removeSubscription = () => {
            subscriptionsRef.current.delete(publication.publicationId);
            setRemoteStreams((prev) =>
              prev.filter(
                (entry) => entry.publicationId !== publication.publicationId,
              ),
            );
          };
          closeConsumer = () => consumer.close();
          consumer.on('transportclose', removeSubscription);
          consumer.on('trackended', removeSubscription);
          const preferredSpatialLayer =
            publication.kind === 'video'
              ? videoQualitySpatialLayer[videoQualityRef.current]
              : undefined;
          if (preferredSpatialLayer !== undefined) {
            await connection.send({
              type: 'media.subscription.preferredSpatialLayer.set',
              subscriptionId: sub.subscriptionId,
              spatialLayer: preferredSpatialLayer,
            });
          }
          const shouldStartPaused =
            publication.kind === 'video' && audioOnlyRef.current;
          if (shouldStartPaused) {
            consumer.pause();
          } else {
            await connection.send({
              type: 'media.subscription.resume',
              subscriptionId: sub.subscriptionId,
            });
          }
          const current = subscriptionsRef.current.get(
            publication.publicationId,
          );
          if (!current || current.token !== token) {
            closeConsumer();
            return;
          }
          const stream = new MediaStream([consumer.track]);
          const handle = {
            consumer,
            kind: publication.kind,
            paused: shouldStartPaused,
            preferredSpatialLayer,
            subscriptionId: sub.subscriptionId,
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
          const message = getErrorMessage(err, 'Failed to subscribe to media');
          logStandupErrorRef.current('media subscribe', message, {
            source: 'subscription_create',
            kind: publication.kind,
            publicationId: publication.publicationId,
            targetParticipantId: publication.participantId,
          });
          setErrorMessage(message);
        }
      })();
    });
  }, [roomState, participantId, recvTransportReady]);

  useEffect(() => {
    const syncRemoteVideoSubscriptions = async () => {
      const entries = [...subscriptionsRef.current.entries()].filter(
        ([, handle]) => handle.kind === 'video',
      );

      await Promise.all(
        entries.map(([publicationId]) =>
          setRemoteSubscriptionPaused(publicationId, videoSettings.audioOnly),
        ),
      );

      await Promise.all(
        entries.map(([publicationId]) =>
          setRemoteSubscriptionPreferredSpatialLayer(
            publicationId,
            videoQualitySpatialLayer[videoSettings.quality],
          ),
        ),
      );
    };

    syncRemoteVideoSubscriptions().catch((err) => {
      const message = getErrorMessage(
        err,
        'Failed to update remote video subscriptions',
      );
      logStandupErrorRef.current('media settings sync', message, {
        source: 'remote_video_subscriptions',
      });
      setErrorMessage(message);
    });
  }, [
    recvTransportReady,
    setRemoteSubscriptionPaused,
    setRemoteSubscriptionPreferredSpatialLayer,
    videoSettings.audioOnly,
    videoSettings.quality,
  ]);

  useEffect(() => {
    setRecvTransportOutgoingBitrateLimit(
      videoQualityOutgoingBitrateLimit[videoSettings.quality],
    ).catch((err) => {
      const message = getErrorMessage(
        err,
        'Failed to update remote video quality',
      );
      logStandupErrorRef.current('media settings sync', message, {
        source: 'remote_video_quality',
      });
      setErrorMessage(message);
    });
  }, [
    recvTransportReady,
    setRecvTransportOutgoingBitrateLimit,
    videoSettings.quality,
  ]);

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
        const producer = await sendTransport.produce(
          kind === 'video'
            ? { track, encodings: [...videoSimulcastEncodings] }
            : { track },
        );
        producersRef.current.set(kind, producer);
        setPublishingFlag(kind, true);
        producer.on('transportclose', () => {
          producersRef.current.delete(kind);
          setPublishingFlag(kind, false);
        });
        producer.on('trackended', () => {
          producersRef.current.delete(kind);
          setPublishingFlag(kind, false);
        });
      } catch (err) {
        const message = getErrorMessage(err, `Failed to publish ${kind}`);
        logStandupErrorRef.current(`media publish ${kind}`, message, {
          source: 'publish_local_track',
          kind,
        });
        setErrorMessage(message);
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
    async (
      kind: 'audio' | 'video',
      deviceId: string | null,
      nextMicSettings: LiveRoomMicSettings = micSettings,
    ) => {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
          throw new Error('Media devices are not available');
        }
        const stream = await navigator.mediaDevices.getUserMedia(
          buildConstraints(kind, deviceId, nextMicSettings, micSettingSupport),
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
            const message = getErrorMessage(
              err,
              `Failed to update ${kind} track`,
            );
            logStandupErrorRef.current(`media replace ${kind}`, message, {
              source: 'capture_replace',
              kind,
              requestedDeviceId: deviceId,
            });
            setErrorMessage(message);
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
      } catch (error) {
        const message = getErrorMessage(error, `Failed to capture ${kind}`);
        logStandupErrorRef.current(`media capture ${kind}`, message, {
          source: 'capture',
          kind,
          requestedDeviceId: deviceId,
        });
        throw error instanceof Error ? error : new Error(message);
      }
    },
    [
      refreshDeviceList,
      refreshLocalStream,
      publishLocalTrack,
      unpublishKind,
      canPublish,
      roomState?.status,
      micSettings,
      micSettingSupport,
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

  const setMicSetting = useCallback(
    async (setting: keyof LiveRoomMicSettings, enabled: boolean) => {
      if (!micSettingSupport[setting] || micSettings[setting] === enabled) {
        return;
      }

      const previousSettings = micSettings;
      const nextSettings: LiveRoomMicSettings = {
        ...micSettings,
        [setting]: enabled,
      };
      setMicSettings(nextSettings);

      if (!isMicOn) {
        return;
      }

      try {
        await startCapture('audio', selectedMicId, nextSettings);
      } catch (err) {
        setMicSettings(previousSettings);
        throw err;
      }
    },
    [isMicOn, micSettingSupport, micSettings, selectedMicId, startCapture],
  );

  const setVideoSetting = useCallback(
    <K extends keyof LiveRoomVideoSettings>(
      setting: K,
      value: LiveRoomVideoSettings[K],
    ) => {
      setVideoSettings((current) => {
        if (current[setting] === value) {
          return current;
        }

        return {
          ...current,
          [setting]: value,
        };
      });
    },
    [],
  );

  const startRoom = useCallback(async () => {
    await sendConnectionCommand('start room', { type: 'room.start' });
  }, [sendConnectionCommand]);

  const endRoom = useCallback(async () => {
    await sendConnectionCommand('end room', { type: 'room.end' });
  }, [sendConnectionCommand]);

  const joinSpeakerQueue = useCallback(async () => {
    await sendConnectionCommand('join speaker queue', {
      type: 'stage.queue.join',
    });
  }, [sendConnectionCommand]);

  const joinStage = useCallback(async () => {
    await sendConnectionCommand('join stage', { type: 'stage.speaker.join' });
  }, [sendConnectionCommand]);

  const leaveStage = useCallback(async () => {
    await sendConnectionCommand('leave stage', { type: 'stage.speaker.leave' });
  }, [sendConnectionCommand]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      await sendConnectionCommand(
        'send reaction',
        { type: 'stage.reaction.send', key: emoji },
        { emoji },
      );
    },
    [sendConnectionCommand],
  );

  const sendChatMessage = useCallback(
    async (body: string) => {
      await sendConnectionCommand(
        'send chat message',
        { type: 'chat.message.send', body },
        { messageLength: body.length },
      );
    },
    [sendConnectionCommand],
  );

  const deleteChatMessage = useCallback(
    async (messageId: string) => {
      await sendConnectionCommand(
        'delete chat message',
        { type: 'chat.message.delete', messageId },
        { messageId },
      );
    },
    [sendConnectionCommand],
  );

  const setParticipantChatEnabled = useCallback(
    async (targetParticipantId: string, nextCanChat: boolean) => {
      await sendConnectionCommand(
        'set participant chat access',
        {
          type: 'chat.privilege.set',
          targetParticipantId,
          canChat: nextCanChat,
        },
        { targetParticipantId, nextCanChat },
      );
    },
    [sendConnectionCommand],
  );

  const grantCoHost = useCallback(
    async (targetParticipantId: string) => {
      await sendConnectionCommand(
        'grant co-host',
        {
          type: 'room.cohost.grant',
          targetParticipantId,
        },
        { targetParticipantId },
      );
    },
    [sendConnectionCommand],
  );

  const revokeCoHost = useCallback(
    async (targetParticipantId: string) => {
      await sendConnectionCommand(
        'revoke co-host',
        {
          type: 'room.cohost.revoke',
          targetParticipantId,
        },
        { targetParticipantId },
      );
    },
    [sendConnectionCommand],
  );

  const promoteSpeaker = useCallback(
    async (targetParticipantId: string) => {
      await sendConnectionCommand(
        'promote speaker',
        {
          type: 'stage.speaker.promote',
          targetParticipantId,
        },
        { targetParticipantId },
      );
    },
    [sendConnectionCommand],
  );

  const removeSpeaker = useCallback(
    async (targetParticipantId: string) => {
      await sendConnectionCommand(
        'remove speaker',
        {
          type: 'stage.speaker.remove',
          targetParticipantId,
        },
        { targetParticipantId },
      );
    },
    [sendConnectionCommand],
  );

  const kickParticipant = useCallback(
    async (targetParticipantId: string) => {
      await sendConnectionCommand(
        'kick participant',
        {
          type: 'stage.kick',
          targetParticipantId,
        },
        { targetParticipantId },
      );
    },
    [sendConnectionCommand],
  );

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
      joinStage,
      leaveStage,
      sendReaction,
      sendChatMessage,
      deleteChatMessage,
      grantCoHost,
      revokeCoHost,
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
      micSettings,
      micSettingSupport,
      setMicSetting,
      videoSettings,
      setVideoSetting,
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
      joinStage,
      leaveStage,
      sendReaction,
      sendChatMessage,
      deleteChatMessage,
      grantCoHost,
      revokeCoHost,
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
      micSettings,
      micSettingSupport,
      setMicSetting,
      videoSettings,
      setVideoSetting,
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
