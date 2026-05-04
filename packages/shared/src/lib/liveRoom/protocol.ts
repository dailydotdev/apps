import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup-client/types';

export type LiveRoomStatusValue = 'created' | 'live' | 'ended';
export type LiveRoomModeValue = 'moderated' | 'free_for_all';
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

export interface LiveRoomStageState {
  speakerQueueParticipantIds: string[];
  activeSpeakerParticipantIds: string[];
  raisedHandParticipantIds: string[];
  speakerLimit?: number | null;
}

export interface LiveRoomState {
  roomId: string;
  mode: LiveRoomModeValue;
  status: LiveRoomStatusValue;
  version: number;
  participants: Record<string, LiveRoomParticipantRecord>;
  coHostParticipantIds: string[];
  chatPermissions: Record<string, boolean>;
  sessions: Record<string, LiveRoomSessionRecord>;
  stage: LiveRoomStageState;
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

export interface LiveRoomChatMessageReaction {
  messageId: string;
  participantId: string;
  key: string;
  createdAt: string;
}

export interface LiveRoomRemovedChatMessageReaction {
  messageId: string;
  participantId: string;
  key: string;
  removedAt: string;
}

export interface SessionReadyEvent {
  type: 'session.ready';
  roomId: string;
  participantId: string;
  role: LiveRoomParticipantRoleValue;
  sessionId: string;
  resumeToken: string;
  resumeSessionTtlMs: number;
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

export interface ChatMessageReactionSentEvent {
  type: 'chat.message.reaction.sent';
  roomId: string;
  messageReaction: LiveRoomChatMessageReaction;
}

export interface ChatMessageReactionRemovedEvent {
  type: 'chat.message.reaction.removed';
  roomId: string;
  messageReaction: LiveRoomRemovedChatMessageReaction;
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
  | ChatMessageReactionSentEvent
  | ChatMessageReactionRemovedEvent
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

export interface MediaTransportIceRestartPayload {
  iceParameters: IceParameters;
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
  | { type: 'room.cohost.grant'; targetParticipantId: string }
  | { type: 'room.cohost.revoke'; targetParticipantId: string }
  | { type: 'chat.message.send'; body: string }
  | { type: 'chat.message.delete'; messageId: string }
  | { type: 'chat.message.reaction.send'; messageId: string; key: string }
  | { type: 'chat.message.reaction.remove'; messageId: string; key: string }
  | {
      type: 'chat.privilege.set';
      targetParticipantId: string;
      canChat: boolean;
    }
  | { type: 'stage.queue.join' }
  | { type: 'stage.hand.raise' }
  | { type: 'stage.hand.remove' }
  | { type: 'stage.reaction.send'; key: string }
  | { type: 'stage.speaker.join' }
  | { type: 'stage.speaker.leave' }
  | { type: 'stage.speaker.promote'; targetParticipantId: string }
  | { type: 'stage.speaker.remove'; targetParticipantId: string }
  | { type: 'stage.kick'; targetParticipantId: string }
  | { type: 'media.capabilities.get' }
  | { type: 'media.transport.create'; direction: 'send' | 'recv' }
  | {
      type: 'media.transport.outgoingBitrate.set';
      transportId: string;
      bitrate: number;
    }
  | {
      type: 'media.transport.connect';
      transportId: string;
      dtlsParameters: DtlsParameters;
    }
  | {
      type: 'media.transport.restartIce';
      transportId: string;
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
  | { type: 'media.subscription.pause'; subscriptionId: string }
  | {
      type: 'media.subscription.preferredSpatialLayer.set';
      subscriptionId: string;
      spatialLayer: number;
    }
  | { type: 'media.subscription.resume'; subscriptionId: string }
  | { type: 'media.publication.stop'; publicationId: string };
