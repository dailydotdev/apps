import { USER_FOLLOW_FRAGMENT } from './fragments';

export enum ContentPreferenceType {
  User = 'user',
}

export const USER_FOLLOWING_QUERY = `
  query UserFollowing($userId: ID!, $entity: ContentPreferenceType!, $after: String, $first: Int) {
    userFollowing(userId: $userId, entity: $entity, after: $after, first: $first) {
      ...UserFollow
    }
  }
  ${USER_FOLLOW_FRAGMENT}
`;

export const USER_FOLLOWERS_QUERY = `
  query UserFollowers($userId: ID!, $entity: ContentPreferenceType!, $after: String, $first: Int) {
    userFollowers(userId: $userId, entity: $entity, after: $after, first: $first) {
      ...UserFollow
    }
  }
  ${USER_FOLLOW_FRAGMENT}
`;
