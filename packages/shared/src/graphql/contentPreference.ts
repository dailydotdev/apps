import { gql } from 'graphql-request';
import { CONTENT_PREFERENCE_FRAMENT, USER_FOLLOW_FRAGMENT } from './fragments';

export enum ContentPreferenceType {
  User = 'user',
}

export enum ContentPreferenceStatus {
  Follow = 'follow',
  Subscribed = 'subscribed',
}

export type ContentPreference = {
  userId: string;
  referenceId: string;
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
      ...UserFollow
    }
  }
  ${USER_FOLLOW_FRAGMENT}
`;

export const USER_FOLLOWERS_QUERY = gql`
  query UserFollowers(
    $id: ID!
    $entity: ContentPreferenceType!
    $first: Int
    $after: String
  ) {
    userFollowers(userId: $id, entity: $entity, first: $first, after: $after) {
      ...UserFollow
    }
  }
  ${USER_FOLLOW_FRAGMENT}
`;

export const DEFAULT_FOLLOW_LIMIT = 20;
