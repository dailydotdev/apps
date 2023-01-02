import { gql } from 'graphql-request';
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
