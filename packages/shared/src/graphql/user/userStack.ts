import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';
import type { DatasetTool } from './userTool';

export interface UserStack {
  id: string;
  tool: DatasetTool;
  section: string;
  position: number;
  startedAt: string | null;
  icon: string | null;
  title: string | null;
  createdAt: string;
}

export interface AddUserStackInput {
  title: string;
  section: string;
  startedAt?: string;
}

export interface UpdateUserStackInput {
  section?: string;
  icon?: string;
  title?: string;
  startedAt?: string | null;
}

export interface ReorderUserStackInput {
  id: string;
  position: number;
}

const USER_STACK_FRAGMENT = gql`
  fragment UserStackFragment on UserStack {
    id
    section
    position
    startedAt
    icon
    title
    createdAt
    tool {
      id
      title
      faviconUrl
    }
  }
`;

const USER_STACK_QUERY = gql`
  query UserStack($userId: ID!, $first: Int, $after: String) {
    userStack(userId: $userId, first: $first, after: $after) {
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
  }
  ${USER_STACK_FRAGMENT}
`;

const ADD_USER_STACK_MUTATION = gql`
  mutation AddUserStack($input: AddUserStackInput!) {
    addUserStack(input: $input) {
      ...UserStackFragment
    }
  }
  ${USER_STACK_FRAGMENT}
`;

const UPDATE_USER_STACK_MUTATION = gql`
  mutation UpdateUserStack($id: ID!, $input: UpdateUserStackInput!) {
    updateUserStack(id: $id, input: $input) {
      ...UserStackFragment
    }
  }
  ${USER_STACK_FRAGMENT}
`;

const DELETE_USER_STACK_MUTATION = gql`
  mutation DeleteUserStack($id: ID!) {
    deleteUserStack(id: $id) {
      _
    }
  }
`;

const REORDER_USER_STACK_MUTATION = gql`
  mutation ReorderUserStack($items: [ReorderUserStackInput!]!) {
    reorderUserStack(items: $items) {
      ...UserStackFragment
    }
  }
  ${USER_STACK_FRAGMENT}
`;

export const getUserStack = async (
  userId: string,
  first = 50,
): Promise<Connection<UserStack>> => {
  const result = await gqlClient.request<{
    userStack: Connection<UserStack>;
  }>(USER_STACK_QUERY, { userId, first });
  return result.userStack;
};

// Re-export searchTools as searchStack for backwards compatibility
export { searchTools as searchStack } from './userTool';

export const addUserStack = async (
  input: AddUserStackInput,
): Promise<UserStack> => {
  const result = await gqlClient.request<{
    addUserStack: UserStack;
  }>(ADD_USER_STACK_MUTATION, { input });
  return result.addUserStack;
};

export const updateUserStack = async (
  id: string,
  input: UpdateUserStackInput,
): Promise<UserStack> => {
  const result = await gqlClient.request<{
    updateUserStack: UserStack;
  }>(UPDATE_USER_STACK_MUTATION, { id, input });
  return result.updateUserStack;
};

export const deleteUserStack = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_USER_STACK_MUTATION, { id });
};

export const reorderUserStack = async (
  items: ReorderUserStackInput[],
): Promise<UserStack[]> => {
  const result = await gqlClient.request<{
    reorderUserStack: UserStack[];
  }>(REORDER_USER_STACK_MUTATION, { items });
  return result.reorderUserStack;
};
