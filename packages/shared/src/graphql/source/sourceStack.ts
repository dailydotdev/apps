import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';
import type { DatasetTool } from '../user/userStack';

export interface SourceStackCreatedBy {
  id: string;
  name: string;
  image: string;
}

export interface SourceStack {
  id: string;
  tool: DatasetTool;
  position: number;
  icon: string | null;
  title: string | null;
  createdAt: string;
  createdBy: SourceStackCreatedBy;
}

export interface AddSourceStackInput {
  title: string;
}

export interface UpdateSourceStackInput {
  icon?: string;
  title?: string;
}

export interface ReorderSourceStackInput {
  id: string;
  position: number;
}

const SOURCE_STACK_FRAGMENT = gql`
  fragment SourceStackFragment on SourceStack {
    id
    position
    icon
    title
    createdAt
    tool {
      id
      title
      faviconUrl
    }
    createdBy {
      id
      name
      image
    }
  }
`;

export const SOURCE_STACK_QUERY = gql`
  query SourceStack($sourceId: ID!, $first: Int, $after: String) {
    sourceStack(sourceId: $sourceId, first: $first, after: $after) {
      edges {
        node {
          ...SourceStackFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${SOURCE_STACK_FRAGMENT}
`;

const ADD_SOURCE_STACK_MUTATION = gql`
  mutation AddSourceStack($sourceId: ID!, $input: AddSourceStackInput!) {
    addSourceStack(sourceId: $sourceId, input: $input) {
      ...SourceStackFragment
    }
  }
  ${SOURCE_STACK_FRAGMENT}
`;

const UPDATE_SOURCE_STACK_MUTATION = gql`
  mutation UpdateSourceStack($id: ID!, $input: UpdateSourceStackInput!) {
    updateSourceStack(id: $id, input: $input) {
      ...SourceStackFragment
    }
  }
  ${SOURCE_STACK_FRAGMENT}
`;

const DELETE_SOURCE_STACK_MUTATION = gql`
  mutation DeleteSourceStack($id: ID!) {
    deleteSourceStack(id: $id) {
      _
    }
  }
`;

const REORDER_SOURCE_STACK_MUTATION = gql`
  mutation ReorderSourceStack(
    $sourceId: ID!
    $items: [ReorderSourceStackInput!]!
  ) {
    reorderSourceStack(sourceId: $sourceId, items: $items) {
      ...SourceStackFragment
    }
  }
  ${SOURCE_STACK_FRAGMENT}
`;

export const getSourceStack = async (
  sourceId: string,
  first = 100,
): Promise<Connection<SourceStack>> => {
  const result = await gqlClient.request<{
    sourceStack: Connection<SourceStack>;
  }>(SOURCE_STACK_QUERY, { sourceId, first });
  return result.sourceStack;
};

export const addSourceStack = async (
  sourceId: string,
  input: AddSourceStackInput,
): Promise<SourceStack> => {
  const result = await gqlClient.request<{
    addSourceStack: SourceStack;
  }>(ADD_SOURCE_STACK_MUTATION, { sourceId, input });
  return result.addSourceStack;
};

export const updateSourceStack = async (
  id: string,
  input: UpdateSourceStackInput,
): Promise<SourceStack> => {
  const result = await gqlClient.request<{
    updateSourceStack: SourceStack;
  }>(UPDATE_SOURCE_STACK_MUTATION, { id, input });
  return result.updateSourceStack;
};

export const deleteSourceStack = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_SOURCE_STACK_MUTATION, { id });
};

export const reorderSourceStack = async (
  sourceId: string,
  items: ReorderSourceStackInput[],
): Promise<SourceStack[]> => {
  const result = await gqlClient.request<{
    reorderSourceStack: SourceStack[];
  }>(REORDER_SOURCE_STACK_MUTATION, { sourceId, items });
  return result.reorderSourceStack;
};
