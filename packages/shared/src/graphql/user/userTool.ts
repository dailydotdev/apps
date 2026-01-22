import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';

export interface DatasetTool {
  id: string;
  title: string;
  faviconUrl: string | null;
}

export interface UserTool {
  id: string;
  tool: DatasetTool;
  category: string;
  position: number;
  createdAt: string;
}

export interface AddUserToolInput {
  title: string;
  category: string;
}

export interface UpdateUserToolInput {
  category?: string;
}

export interface ReorderUserToolInput {
  id: string;
  position: number;
}

const USER_TOOL_FRAGMENT = gql`
  fragment UserToolFragment on UserTool {
    id
    category
    position
    createdAt
    tool {
      id
      title
      faviconUrl
    }
  }
`;

const USER_TOOLS_QUERY = gql`
  query UserTools($userId: ID!, $first: Int, $after: String) {
    userTools(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...UserToolFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${USER_TOOL_FRAGMENT}
`;

const AUTOCOMPLETE_TOOLS_QUERY = gql`
  query AutocompleteTools($query: String!) {
    autocompleteTools(query: $query) {
      id
      title
      faviconUrl
    }
  }
`;

const ADD_USER_TOOL_MUTATION = gql`
  mutation AddUserTool($input: AddUserToolInput!) {
    addUserTool(input: $input) {
      ...UserToolFragment
    }
  }
  ${USER_TOOL_FRAGMENT}
`;

const UPDATE_USER_TOOL_MUTATION = gql`
  mutation UpdateUserTool($id: ID!, $input: UpdateUserToolInput!) {
    updateUserTool(id: $id, input: $input) {
      ...UserToolFragment
    }
  }
  ${USER_TOOL_FRAGMENT}
`;

const DELETE_USER_TOOL_MUTATION = gql`
  mutation DeleteUserTool($id: ID!) {
    deleteUserTool(id: $id) {
      _
    }
  }
`;

const REORDER_USER_TOOLS_MUTATION = gql`
  mutation ReorderUserTools($items: [ReorderUserToolInput!]!) {
    reorderUserTools(items: $items) {
      ...UserToolFragment
    }
  }
  ${USER_TOOL_FRAGMENT}
`;

export const getUserTools = async (
  userId: string,
  first = 50,
): Promise<Connection<UserTool>> => {
  const result = await gqlClient.request<{
    userTools: Connection<UserTool>;
  }>(USER_TOOLS_QUERY, { userId, first });
  return result.userTools;
};

export const searchTools = async (query: string): Promise<DatasetTool[]> => {
  const result = await gqlClient.request<{
    autocompleteTools: DatasetTool[];
  }>(AUTOCOMPLETE_TOOLS_QUERY, { query });
  return result.autocompleteTools;
};

export const addUserTool = async (
  input: AddUserToolInput,
): Promise<UserTool> => {
  const result = await gqlClient.request<{
    addUserTool: UserTool;
  }>(ADD_USER_TOOL_MUTATION, { input });
  return result.addUserTool;
};

export const updateUserTool = async (
  id: string,
  input: UpdateUserToolInput,
): Promise<UserTool> => {
  const result = await gqlClient.request<{
    updateUserTool: UserTool;
  }>(UPDATE_USER_TOOL_MUTATION, { id, input });
  return result.updateUserTool;
};

export const deleteUserTool = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_USER_TOOL_MUTATION, { id });
};

export const reorderUserTools = async (
  items: ReorderUserToolInput[],
): Promise<UserTool[]> => {
  const result = await gqlClient.request<{
    reorderUserTools: UserTool[];
  }>(REORDER_USER_TOOLS_MUTATION, { items });
  return result.reorderUserTools;
};
