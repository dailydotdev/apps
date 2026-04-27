import { gql } from 'graphql-request';
import type { UserShortProfile } from '../lib/user';
import { USER_SHORT_INFO_FRAGMENT } from './fragments';

export enum LiveRoomMode {
  Debate = 'debate',
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
  host: UserShortProfile;
}

export interface LiveRoomJoinToken {
  room: LiveRoom;
  role: LiveRoomParticipantRole;
  token: string;
}

export interface ActiveLiveRoomsData {
  activeLiveRooms: LiveRoom[];
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
    host {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const LIVE_ROOM_JOIN_TOKEN_FRAGMENT = gql`
  fragment LiveRoomJoinToken on LiveRoomJoinToken {
    room {
      ...LiveRoom
    }
    role
    token
  }
  ${LIVE_ROOM_FRAGMENT}
`;

export const ACTIVE_LIVE_ROOMS_QUERY = gql`
  query ActiveLiveRooms {
    activeLiveRooms {
      ...LiveRoom
    }
  }
  ${LIVE_ROOM_FRAGMENT}
`;

export const LIVE_ROOM_QUERY = gql`
  query LiveRoom($id: ID!) {
    liveRoom(id: $id) {
      ...LiveRoom
    }
  }
  ${LIVE_ROOM_FRAGMENT}
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
