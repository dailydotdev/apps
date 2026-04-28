import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup-client/lib/types';

export type LiveRoomStatusValue = 'created' | 'live' | 'ended';
export type LiveRoomParticipantRoleValue = 'host' | 'speaker' | 'audience';
export type MediaKindValue = 'audio' | 'video';

export interface LiveRoomParticipantRecord {
  participantId: string;
  role: LiveRoomParticipantRoleValue;
  sessionIds: string[];
  joinedAt: string;
  updatedAt: string;
}

export interface LiveRoomSessionRecord {
  sessionId: string;
  participantId: string;
  role: LiveRoomParticipantRoleValue;
  authKind?: 'authenticated' | 'anonymous';
  connectedAt: string;
  disconnectedAt: string | null;
  resumeExpiresAt: string | null;
}

export interface LiveRoomMediaPublicationRecord {
  publicationId: string;
  participantId: string;
  sessionId: string;
  kind: MediaKindValue;
  createdAt: string;
  updatedAt: string;
}

export interface LiveRoomDebateState {
  speakerQueueParticipantIds: string[];
  activeSpeakerParticipantIds: string[];
}

export interface LiveRoomState {
  roomId: string;
  status: LiveRoomStatusValue;
  version: number;
  participants: Record<string, LiveRoomParticipantRecord>;
  chatPermissions: Record<string, boolean>;
  sessions: Record<string, LiveRoomSessionRecord>;
  debate: LiveRoomDebateState | null;
  mediaPublications: Record<string, LiveRoomMediaPublicationRecord>;
  mediaRuntimeOwner: { instanceId: string; baseUrl: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveRoomChatMessage {
  messageId: string;
  participantId: string;
  body: string;
  createdAt: string;
}

export interface SessionReadyEvent {
  type: 'session.ready';
  roomId: string;
  participantId: string;
  role: LiveRoomParticipantRoleValue;
  sessionId: string;
  resumeToken: string;
}

export interface SnapshotEvent {
  type: 'snapshot';
  room: LiveRoomState;
}

export interface RoomUpdatedEvent {
  type: 'room.updated';
  room: LiveRoomState;
}

export interface ReactionSentEvent {
  type: 'reaction.sent';
  roomId: string;
  reaction: {
    participantId: string;
    key: string;
    createdAt: string;
  };
}

export interface ChatMessageSentEvent {
  type: 'chat.message.sent';
  roomId: string;
  message: LiveRoomChatMessage;
}

export interface ChatMessageDeletedEvent {
  type: 'chat.message.deleted';
  roomId: string;
  messageId: string;
  deletedAt: string;
}

export interface CommandSucceededEvent {
  type: 'command.succeeded';
  requestId: string;
  payload?: unknown;
}

export interface CommandFailedEvent {
  type: 'command.failed';
  requestId?: string;
  message: string;
}

export type LiveRoomServerEvent =
  | SessionReadyEvent
  | SnapshotEvent
  | RoomUpdatedEvent
  | ReactionSentEvent
  | ChatMessageSentEvent
  | ChatMessageDeletedEvent
  | CommandSucceededEvent
  | CommandFailedEvent;

export type MediaCapabilitiesPayload = RtpCapabilities;

export interface MediaTransportCreatePayload {
  transportId: string;
  direction: 'send' | 'recv';
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface MediaPublicationPayload {
  publicationId: string;
}

export interface MediaSubscriptionPayload {
  subscriptionId: string;
  publicationId: string;
  producerId: string;
  kind: MediaKindValue;
  rtpParameters: RtpParameters;
}

export type LiveRoomCommand =
  | { type: 'connection.ping' }
  | { type: 'room.start' }
  | { type: 'room.end' }
  | { type: 'chat.message.send'; body: string }
  | { type: 'chat.message.delete'; messageId: string }
  | {
      type: 'chat.privilege.set';
      targetParticipantId: string;
      canChat: boolean;
    }
  | { type: 'debate.queue.join' }
  | { type: 'debate.reaction.send'; key: string }
  | { type: 'debate.speaker.promote'; targetParticipantId: string }
  | { type: 'debate.speaker.remove'; targetParticipantId: string }
  | { type: 'debate.kick'; targetParticipantId: string }
  | { type: 'media.capabilities.get' }
  | { type: 'media.transport.create'; direction: 'send' | 'recv' }
  | {
      type: 'media.transport.connect';
      transportId: string;
      dtlsParameters: DtlsParameters;
    }
  | {
      type: 'media.publication.publish';
      transportId: string;
      kind: MediaKindValue;
      rtpParameters: RtpParameters;
    }
  | {
      type: 'media.subscription.create';
      transportId: string;
      publicationId: string;
      rtpCapabilities: RtpCapabilities;
    }
  | { type: 'media.subscription.resume'; subscriptionId: string }
  | { type: 'media.publication.stop'; publicationId: string };
