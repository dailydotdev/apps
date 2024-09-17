import { gql } from 'graphql-request';

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
      referenceId
      type
      createdAt
      status
    }
  }
`;

export const USER_FOLLOWING_QUERY = gql`
  query UserFollowing($id: ID!, $entity: ContentPreferenceType!) {
    userFollowing(userId: $id, entity: $entity) {
      edges {
        node {
          user {
            id
          }
          referenceId
          status
        }
      }
    }
  }
`;

export const USER_FOLLOWERS_QUERY = gql`
  query UserFollowers($id: ID!, $entity: ContentPreferenceType!) {
    userFollowers(userId: $id, entity: $entity) {
      edges {
        node {
          user {
            id
          }
          referenceId
          status
        }
      }
    }
  }
`;
