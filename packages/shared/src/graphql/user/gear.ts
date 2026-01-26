import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';

export interface DatasetGear {
  id: string;
  name: string;
}

export interface Gear {
  id: string;
  gear: DatasetGear;
  position: number;
}

export interface AddGearInput {
  name: string;
}

export interface ReorderGearInput {
  id: string;
  position: number;
}

const GEAR_FRAGMENT = gql`
  fragment GearFragment on Gear {
    id
    position
    gear {
      id
      name
    }
  }
`;

const GEAR_QUERY = gql`
  query Gear($userId: ID!, $first: Int, $after: String) {
    gear(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...GearFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${GEAR_FRAGMENT}
`;

const AUTOCOMPLETE_GEAR_QUERY = gql`
  query AutocompleteGear($query: String!) {
    autocompleteGear(query: $query) {
      id
      name
    }
  }
`;

const ADD_GEAR_MUTATION = gql`
  mutation AddGear($input: AddGearInput!) {
    addGear(input: $input) {
      ...GearFragment
    }
  }
  ${GEAR_FRAGMENT}
`;

const DELETE_GEAR_MUTATION = gql`
  mutation DeleteGear($id: ID!) {
    deleteGear(id: $id) {
      _
    }
  }
`;

const REORDER_GEAR_MUTATION = gql`
  mutation ReorderGear($items: [ReorderGearInput!]!) {
    reorderGear(items: $items) {
      ...GearFragment
    }
  }
  ${GEAR_FRAGMENT}
`;

export const getGear = async (
  userId: string,
  first = 50,
): Promise<Connection<Gear>> => {
  const result = await gqlClient.request<{
    gear: Connection<Gear>;
  }>(GEAR_QUERY, { userId, first });
  return result.gear;
};

export const searchGear = async (query: string): Promise<DatasetGear[]> => {
  const result = await gqlClient.request<{
    autocompleteGear: DatasetGear[];
  }>(AUTOCOMPLETE_GEAR_QUERY, { query });
  return result.autocompleteGear;
};

export const addGear = async (input: AddGearInput): Promise<Gear> => {
  const result = await gqlClient.request<{
    addGear: Gear;
  }>(ADD_GEAR_MUTATION, { input });
  return result.addGear;
};

export const deleteGear = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_GEAR_MUTATION, { id });
};

export const reorderGear = async (
  items: ReorderGearInput[],
): Promise<Gear[]> => {
  const result = await gqlClient.request<{
    reorderGear: Gear[];
  }>(REORDER_GEAR_MUTATION, { items });
  return result.reorderGear;
};
