import { gql } from 'graphql-request';
import {
  CONTENT_PREFERENCE_FRAMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import { UserShortProfile } from '../lib/user';

export enum ContentPreferenceType {
  User = 'user',
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
  ) {
    userFollowing(userId: $id, entity: $entity, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          referenceId
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

export const DEFAULT_FOLLOW_LIMIT = 20;

export const CONTENT_PREFERENCE_FOLLOW_MUTATION = gql`
  mutation Follow(
    $id: ID!
    $entity: ContentPreferenceType!
    $status: FollowStatus!
  ) {
    follow(id: $id, entity: $entity, status: $status) {
      _
    }
  }
`;

export const CONTENT_PREFERENCE_UNFOLLOW_MUTATION = gql`
  mutation Unfollow($id: ID!, $entity: ContentPreferenceType!) {
    unfollow(id: $id, entity: $entity) {
      _
    }
  }
`;
