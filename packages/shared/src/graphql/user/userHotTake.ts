import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';

export interface UserHotTake {
  id: string;
  emoji: string;
  title: string;
  subtitle: string | null;
  position: number;
  createdAt: string;
  upvotes: number;
  upvoted?: boolean;
}

export interface AddUserHotTakeInput {
  emoji: string;
  title: string;
  subtitle?: string;
}

export interface UpdateUserHotTakeInput {
  emoji?: string;
  title?: string;
  subtitle?: string | null;
}

export interface ReorderUserHotTakeInput {
  id: string;
  position: number;
}

const USER_HOT_TAKE_FRAGMENT = gql`
  fragment UserHotTakeFragment on UserHotTake {
    id
    emoji
    title
    subtitle
    position
    createdAt
    upvotes
    upvoted
  }
`;

const USER_HOT_TAKES_QUERY = gql`
  query UserHotTakes($userId: ID!, $first: Int, $after: String) {
    userHotTakes(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...UserHotTakeFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${USER_HOT_TAKE_FRAGMENT}
`;

const ADD_USER_HOT_TAKE_MUTATION = gql`
  mutation AddUserHotTake($input: AddUserHotTakeInput!) {
    addUserHotTake(input: $input) {
      ...UserHotTakeFragment
    }
  }
  ${USER_HOT_TAKE_FRAGMENT}
`;

const UPDATE_USER_HOT_TAKE_MUTATION = gql`
  mutation UpdateUserHotTake($id: ID!, $input: UpdateUserHotTakeInput!) {
    updateUserHotTake(id: $id, input: $input) {
      ...UserHotTakeFragment
    }
  }
  ${USER_HOT_TAKE_FRAGMENT}
`;

const DELETE_USER_HOT_TAKE_MUTATION = gql`
  mutation DeleteUserHotTake($id: ID!) {
    deleteUserHotTake(id: $id) {
      _
    }
  }
`;

const REORDER_USER_HOT_TAKES_MUTATION = gql`
  mutation ReorderUserHotTakes($items: [ReorderUserHotTakeInput!]!) {
    reorderUserHotTakes(items: $items) {
      ...UserHotTakeFragment
    }
  }
  ${USER_HOT_TAKE_FRAGMENT}
`;

export const getUserHotTakes = async (
  userId: string,
  first = 50,
): Promise<Connection<UserHotTake>> => {
  const result = await gqlClient.request<{
    userHotTakes: Connection<UserHotTake>;
  }>(USER_HOT_TAKES_QUERY, { userId, first });
  return result.userHotTakes;
};

export const addUserHotTake = async (
  input: AddUserHotTakeInput,
): Promise<UserHotTake> => {
  const result = await gqlClient.request<{
    addUserHotTake: UserHotTake;
  }>(ADD_USER_HOT_TAKE_MUTATION, { input });
  return result.addUserHotTake;
};

export const updateUserHotTake = async (
  id: string,
  input: UpdateUserHotTakeInput,
): Promise<UserHotTake> => {
  const result = await gqlClient.request<{
    updateUserHotTake: UserHotTake;
  }>(UPDATE_USER_HOT_TAKE_MUTATION, { id, input });
  return result.updateUserHotTake;
};

export const deleteUserHotTake = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_USER_HOT_TAKE_MUTATION, { id });
};

export const reorderUserHotTakes = async (
  items: ReorderUserHotTakeInput[],
): Promise<UserHotTake[]> => {
  const result = await gqlClient.request<{
    reorderUserHotTakes: UserHotTake[];
  }>(REORDER_USER_HOT_TAKES_MUTATION, { items });
  return result.reorderUserHotTakes;
};
