import { gql } from 'graphql-request';
import {
  CONTENT_PREFERENCE_FRAMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import type { UserShortProfile } from '../lib/user';
import type { Source } from './sources';

export enum ContentPreferenceType {
  User = 'user',
  Word = 'word',
  Source = 'source',
  Keyword = 'keyword',
}

export enum ContentPreferenceStatus {
  Follow = 'follow',
  Subscribed = 'subscribed',
}

type ContentPreferenceUser = Pick<
  UserShortProfile,
  'id' | 'name' | 'image' | 'username'
> & {
  contentPreference?: Pick<ContentPreference, 'status'>;
};

export type ContentPreference = {
  referenceId: string;
  user?: ContentPreferenceUser;
  source?: Source;
  referenceUser?: ContentPreferenceUser;
  type: ContentPreferenceType;
  createdAt: Date;
  status: ContentPreferenceStatus;
};

export const CONTENT_PREFERENCE_STATUS_QUERY = gql`
  query ContentPreferenceStatus($id: ID!, $entity: ContentPreferenceType!) {
    contentPreferenceStatus(id: $id, entity: $entity) {
      ...ContentPreferenceFragment
    }
  }
  ${CONTENT_PREFERENCE_FRAMENT}
`;

export const USER_FOLLOWING_QUERY = gql`
  query UserFollowing(
    $id: ID!
    $entity: ContentPreferenceType!
    $first: Int
    $after: String
    $feedId: String
  ) {
    userFollowing(
      userId: $id
      entity: $entity
      first: $first
      after: $after
      feedId: $feedId
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          referenceId
          source {
            id
            name
            type
            image
            handle
            description
          }
          referenceUser {
            ...UserShortInfo
            contentPreference {
              status
            }
          }
          type
          status
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const USER_FOLLOWERS_QUERY = gql`
  query UserFollowers(
    $id: ID!
    $entity: ContentPreferenceType!
    $first: Int
    $after: String
  ) {
    userFollowers(userId: $id, entity: $entity, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          referenceId
          user {
            ...UserShortInfo
            contentPreference {
              status
            }
          }
          type
          status
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const USER_BLOCKED_QUERY = gql`
  query UserBlocked(
    $entity: ContentPreferenceType!
    $first: Int
    $after: String
    $feedId: String
  ) {
    userBlocked(
      entity: $entity
      first: $first
      after: $after
      feedId: $feedId
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          referenceId
          type
          status
          referenceUser {
            ...UserShortInfo
            contentPreference {
              status
            }
          }
          source {
            id
            name
            type
            image
            handle
            description
          }
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const DEFAULT_FOLLOW_LIMIT = 20;
export const DEFAULT_BLOCKED_LIMIT = 200;

export const CONTENT_PREFERENCE_FOLLOW_MUTATION = gql`
  mutation Follow(
    $id: ID!
    $entity: ContentPreferenceType!
    $status: FollowStatus!
    $feedId: String
  ) {
    follow(id: $id, entity: $entity, status: $status, feedId: $feedId) {
      _
    }
  }
`;

export const CONTENT_PREFERENCE_UNFOLLOW_MUTATION = gql`
  mutation Unfollow(
    $id: ID!
    $entity: ContentPreferenceType!
    $feedId: String
  ) {
    unfollow(id: $id, entity: $entity, feedId: $feedId) {
      _
    }
  }
`;

export const CONTENT_PREFERENCE_BLOCK_MUTATION = gql`
  mutation Block($id: ID!, $entity: ContentPreferenceType!, $feedId: String) {
    block(id: $id, entity: $entity, feedId: $feedId) {
      _
    }
  }
`;

export const CONTENT_PREFERENCE_UNBLOCK_MUTATION = gql`
  mutation Unblock($id: ID!, $entity: ContentPreferenceType!, $feedId: String) {
    unblock(id: $id, entity: $entity, feedId: $feedId) {
      _
    }
  }
`;
