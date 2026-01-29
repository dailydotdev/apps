import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';

export interface HotTake {
  id: string;
  emoji: string;
  title: string;
  subtitle: string | null;
  position: number;
  createdAt: string;
  upvotes: number;
  upvoted?: boolean;
}

export interface AddHotTakeInput {
  emoji: string;
  title: string;
  subtitle?: string;
}

export interface UpdateHotTakeInput {
  emoji?: string;
  title?: string;
  subtitle?: string | null;
}

export interface ReorderHotTakeInput {
  id: string;
  position: number;
}

const HOT_TAKE_FRAGMENT = gql`
  fragment HotTakeFragment on HotTake {
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

const HOT_TAKES_QUERY = gql`
  query HotTakes($userId: ID!, $first: Int, $after: String) {
    hotTakes(userId: $userId, first: $first, after: $after) {
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
  ${HOT_TAKE_FRAGMENT}
`;

const ADD_HOT_TAKE_MUTATION = gql`
  mutation AddHotTake($input: AddHotTakeInput!) {
    addHotTake(input: $input) {
      ...HotTakeFragment
    }
  }
  ${HOT_TAKE_FRAGMENT}
`;

const UPDATE_HOT_TAKE_MUTATION = gql`
  mutation UpdateHotTake($id: ID!, $input: UpdateHotTakeInput!) {
    updateHotTake(id: $id, input: $input) {
      ...HotTakeFragment
    }
  }
  ${HOT_TAKE_FRAGMENT}
`;

const DELETE_HOT_TAKE_MUTATION = gql`
  mutation DeleteHotTake($id: ID!) {
    deleteHotTake(id: $id) {
      _
    }
  }
`;

const REORDER_HOT_TAKES_MUTATION = gql`
  mutation ReorderHotTakes($items: [ReorderHotTakeInput!]!) {
    reorderHotTakes(items: $items) {
      ...HotTakeFragment
    }
  }
  ${HOT_TAKE_FRAGMENT}
`;

export const getHotTakes = async (
  userId: string,
  first = 50,
): Promise<Connection<HotTake>> => {
  const result = await gqlClient.request<{
    hotTakes: Connection<HotTake>;
  }>(HOT_TAKES_QUERY, { userId, first });
  return result.hotTakes;
};

export const addHotTake = async (input: AddHotTakeInput): Promise<HotTake> => {
  const result = await gqlClient.request<{
    addHotTake: HotTake;
  }>(ADD_HOT_TAKE_MUTATION, { input });
  return result.addHotTake;
};

export const updateHotTake = async (
  id: string,
  input: UpdateHotTakeInput,
): Promise<HotTake> => {
  const result = await gqlClient.request<{
    updateHotTake: HotTake;
  }>(UPDATE_HOT_TAKE_MUTATION, { id, input });
  return result.updateHotTake;
};

export const deleteHotTake = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_HOT_TAKE_MUTATION, { id });
};

export const reorderHotTakes = async (
  items: ReorderHotTakeInput[],
): Promise<HotTake[]> => {
  const result = await gqlClient.request<{
    reorderHotTakes: HotTake[];
  }>(REORDER_HOT_TAKES_MUTATION, { items });
  return result.reorderHotTakes;
};
