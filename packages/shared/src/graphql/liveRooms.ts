import { gql } from 'graphql-request';
import type { UserShortProfile } from '../lib/user';
import { CONTENT_EMBED_FRAGMENT, USER_SHORT_INFO_FRAGMENT } from './fragments';
import type { ContentEmbed } from './posts';
import type { EmptyResponse } from './emptyResponse';

export enum LiveRoomMode {
  Moderated = 'moderated',
  FreeForAll = 'free_for_all',
}

export enum LiveRoomStatus {
  Created = 'created',
  Live = 'live',
  Ended = 'ended',
}

export enum LiveRoomParticipantRole {
  Host = 'host',
  Audience = 'audience',
}

export interface LiveRoom {
  id: string;
  createdAt: string;
  updatedAt: string;
  topic: string;
  mode: LiveRoomMode;
  status: LiveRoomStatus;
  startedAt: string | null;
  endedAt: string | null;
  scheduledStart: string | null;
  description: string | null;
  descriptionHtml?: string | null;
  subscribed: boolean;
  contentEmbeds?: ContentEmbed[];
  participantCount?: number | null;
  host: UserShortProfile;
}

export interface LiveRoomJoinToken {
  room: LiveRoom;
  role: LiveRoomParticipantRole;
  token: string;
}

export interface LiveRoomData {
  liveRoom: LiveRoom;
}

export interface CreateLiveRoomData {
  createLiveRoom: LiveRoomJoinToken;
}

export interface LiveRoomJoinTokenData {
  liveRoomJoinToken: LiveRoomJoinToken;
}

export interface EndLiveRoomData {
  endLiveRoom: LiveRoom;
}

export interface SubscribeToLiveRoomData {
  subscribeToLiveRoom: EmptyResponse;
}

export interface UnsubscribeFromLiveRoomData {
  unsubscribeFromLiveRoom: EmptyResponse;
}

export const LIVE_ROOM_FRAGMENT = gql`
  fragment LiveRoom on LiveRoom {
    id
    createdAt
    updatedAt
    topic
    mode
    status
    startedAt
    endedAt
    scheduledStart
    description
    subscribed
    host {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const LIVE_ROOM_DETAIL_FRAGMENT = gql`
  fragment LiveRoomDetail on LiveRoom {
    ...LiveRoom
    descriptionHtml
    contentEmbeds {
      ...ContentEmbedFragment
    }
  }
  ${LIVE_ROOM_FRAGMENT}
  ${CONTENT_EMBED_FRAGMENT}
`;

export const LIVE_ROOM_JOIN_TOKEN_FRAGMENT = gql`
  fragment LiveRoomJoinToken on LiveRoomJoinToken {
    room {
      ...LiveRoomDetail
    }
    role
    token
  }
  ${LIVE_ROOM_DETAIL_FRAGMENT}
`;

export const LIVE_ROOM_QUERY = gql`
  query LiveRoom($id: ID!) {
    liveRoom(id: $id) {
      ...LiveRoomDetail
    }
  }
  ${LIVE_ROOM_DETAIL_FRAGMENT}
`;

export const CREATE_LIVE_ROOM_MUTATION = gql`
  mutation CreateLiveRoom($input: CreateLiveRoomInput!) {
    createLiveRoom(input: $input) {
      ...LiveRoomJoinToken
    }
  }
  ${LIVE_ROOM_JOIN_TOKEN_FRAGMENT}
`;

export const LIVE_ROOM_JOIN_TOKEN_MUTATION = gql`
  mutation LiveRoomJoinToken($roomId: ID!) {
    liveRoomJoinToken(roomId: $roomId) {
      ...LiveRoomJoinToken
    }
  }
  ${LIVE_ROOM_JOIN_TOKEN_FRAGMENT}
`;

export const END_LIVE_ROOM_MUTATION = gql`
  mutation EndLiveRoom($roomId: ID!) {
    endLiveRoom(roomId: $roomId) {
      ...LiveRoom
    }
  }
  ${LIVE_ROOM_FRAGMENT}
`;

export const SUBSCRIBE_TO_LIVE_ROOM_MUTATION = gql`
  mutation SubscribeToLiveRoom($roomId: ID!) {
    subscribeToLiveRoom(roomId: $roomId) {
      _
    }
  }
`;

export const UNSUBSCRIBE_FROM_LIVE_ROOM_MUTATION = gql`
  mutation UnsubscribeFromLiveRoom($roomId: ID!) {
    unsubscribeFromLiveRoom(roomId: $roomId) {
      _
    }
  }
`;
