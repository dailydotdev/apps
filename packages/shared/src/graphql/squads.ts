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

export const CREATE_SQUAD_MUTATION = gql`
  mutation CreateSquad($data: CreateSquadInput, $upload: Upload) {
    createSquad(data: $data, upload: $upload) {
      id
      name
      image
      handle
      description
      permalink
    }
  }
`;
