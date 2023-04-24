import { gql } from 'graphql-request';
import { UserShortProfile } from '../lib/user';
import { Connection } from './common';

export enum SourceMemberRole {
  Member = 'member',
  Moderator = 'moderator',
  Admin = 'admin',
  Blocked = 'blocked',
}

export enum SourcePermissions {
  CommentDelete = 'comment_delete',
  View = 'view',
  ViewBlockedMembers = 'view_blocked_members',
  Post = 'post',
  PostLimit = 'post_limit',
  PostDelete = 'post_delete',
  MemberRoleUpdate = 'member_role_update',
  MemberRemove = 'member_remove',
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
  members?: Connection<SourceMember>;
  membersCount: number;
  description: string;
  memberPostingRole: SourceMemberRole;
}

export interface SourcePrivilegedMembers extends Pick<SourceMember, 'role'> {
  user: Pick<UserShortProfile, 'id'>;
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
  privilegedMembers?: SourcePrivilegedMembers[];
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
