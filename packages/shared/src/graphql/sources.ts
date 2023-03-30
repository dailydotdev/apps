import { gql } from 'graphql-request';
import { UserShortProfile } from '../lib/user';
import { Connection } from './common';

export enum SourceMemberRole {
  Member = 'member',
  Moderator = 'moderator',
  Owner = 'owner',
}

export enum SourcePermissions {
  View = 'view',
  Post = 'post',
  PostLimit = 'post_limit',
  PostDelete = 'post_delete',
  MemberRemove = 'member_remove',
  ModeratorAdd = 'moderator_add',
  ModeratorRemove = 'moderator_remove',
  InviteDisable = 'invite_disable',
  Leave = 'leave',
  Delete = 'delete',
  Edit = 'edit',
}

export interface SourceMember {
  role: SourceMemberRole;
  user: UserShortProfile;
  source: Squad;
  referralToken: string;
  permissions?: SourcePermissions[];
}

export enum SourceType {
  Machine = 'machine',
  Squad = 'squad',
}

export interface Squad extends Source {
  active: boolean;
  permalink: string;
  public: boolean;
  type: SourceType.Squad;
  owners?: string[];
  moderators?: string[];
  members?: Connection<SourceMember>;
  membersCount: number;
  description: string;
}

export interface Source {
  __typename?: string;
  id?: string;
  name: string;
  image: string;
  handle: string;
  type: SourceType;
  permalink: string;
  currentMember?: SourceMember;
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
