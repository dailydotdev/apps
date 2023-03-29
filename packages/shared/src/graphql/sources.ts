import { gql } from 'graphql-request';
import { UserShortProfile } from '../lib/user';
import { Connection } from './common';

export enum SourceMemberRole {
  Member = 'member',
  Owner = 'owner',
}

export interface SourceMember {
  role: SourceMemberRole;
  user: UserShortProfile;
  source: Source;
  referralToken: string;
}

export enum SourceType {
  Machine = 'machine',
  Squad = 'squad',
}

export interface Source {
  __typename?: string;
  id?: string;
  name: string;
  image: string;
  handle: string;
  type: SourceType;
  permalink: string;
  membersCount: number;
  description?: string;
  members?: Connection<SourceMember>;
  currentMember?: SourceMember;
  owners?: string[];
  moderators?: string[];
}

export type SourceData = { source: Source };

export const SOURCE_QUERY = gql`
  query Source($id: ID!) {
    source(id: $id) {
      id
      image
      name
    }
  }
`;
