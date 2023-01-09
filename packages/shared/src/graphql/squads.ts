import request, { gql } from 'graphql-request';
import { apiUrl } from '../lib/config';
import { UserShortProfile } from '../lib/user';
import { Edge } from './common';
import { Source } from './sources';

export interface Squad extends Source {
  active: boolean;
  handle: string | null;
  permalink: string;
  public: boolean;
  type: 'squad';
  description?: string;
}

export type Squads = {
  squads: Squad[];
};

export enum SquadMemberRole {
  Member = 'member',
  Owner = 'owner',
}

export type SquadMember = {
  role: SquadMemberRole;
  user: UserShortProfile;
};

export type CreateSquadInput = {
  name: string;
  handle: string;
  description: string;
  postId: string;
  commentary: string;
  image: File;
};

export type CreateSquadOutput = {
  createSquad: Squad;
};

export const CREATE_SQUAD_MUTATION = gql`
  mutation CreateSquad(
    $name: String!
    $handle: String!
    $description: String
    $postId: ID!
    $commentary: String!
    $image: Upload
  ) {
    createSquad(
      name: $name
      handle: $handle
      description: $description
      postId: $postId
      commentary: $commentary
      image: $image
    ) {
      active
      handle
      name
      permalink
      public
      type
      description
    }
  }
`;

export const ADD_POST_TO_SQUAD = gql`
  mutation AddPostToSquad($data: AddPostToSquadInput) {
    sharePost(data: $data) {
      Post!
    }
  }
`;

export const SQUAD_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      id
      active
      handle
      name
      permalink
      public
      type
      description
      image
    }
  }
`;

export const SQUAD_MEMBERS_QUERY = gql`
  query Source($id: ID!) {
    sourceMembers(first: 5, sourceId: $id) {
      edges {
        node {
          role
          user {
            id
            name
            image
            permalink
            username
            bio
          }
        }
      }
    }
  }
`;

export type SquadData = {
  source: Squad;
};

export type SquadEdgesData = {
  sourceMembers: {
    edges: Edge<SquadMember>[];
  };
};

export async function getSquad(handle: string): Promise<Squad> {
  const res = await request<SquadData>(`${apiUrl}/graphql`, SQUAD_QUERY, {
    handle,
  });
  return res.source;
}

export async function graphqlQuery<TReturn, TParameters>(
  query: string,
  parameters?: TParameters,
): Promise<TReturn> {
  const res = await request<TReturn>(`${apiUrl}/graphql`, query, parameters);
  return res;
}

export async function getSquadMembers(id: string): Promise<SquadMember[]> {
  const res = await request<SquadEdgesData>(
    `${apiUrl}/graphql`,
    SQUAD_MEMBERS_QUERY,
    { id },
  );
  return res.sourceMembers.edges?.map((edge) => edge.node);
}
