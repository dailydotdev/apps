import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlBatchRequest } from '../batch';
import type { UserStack } from './userStack';
import { MAX_STACK_ITEMS, USER_STACK_FRAGMENT } from './userStack';
import type { HotTake } from './userHotTake';
import { HOT_TAKE_FRAGMENT } from './userHotTake';

export interface ProfileShowcase {
  userStack: Connection<UserStack>;
  hotTakes: Connection<HotTake>;
}

/**
 * The lists the profile's main column always renders, in one document.
 *
 * They were separate requests, all keyed on the same user, all mounting in the
 * same paint. Nothing here paginates in practice (the caps are low enough that
 * the first page is the whole list), so there is no lifecycle to keep them
 * apart, only extra round trips where one does.
 */
const PROFILE_SHOWCASE_QUERY = gql`
  query ProfileShowcase($userId: ID!, $stackFirst: Int, $first: Int) {
    userStack(userId: $userId, first: $stackFirst) {
      edges {
        node {
          ...UserStackFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    hotTakes(userId: $userId, first: $first) {
      edges {
        node {
          ...HotTakeFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${USER_STACK_FRAGMENT}
  ${HOT_TAKE_FRAGMENT}
`;

export const getProfileShowcase = (userId: string): Promise<ProfileShowcase> =>
  gqlBatchRequest<ProfileShowcase>(PROFILE_SHOWCASE_QUERY, {
    userId,
    stackFirst: MAX_STACK_ITEMS,
    first: 50,
  });
