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
  PostPin = 'post_pin',
  PostDelete = 'post_delete',
  MemberRoleUpdate = 'member_role_update',
  MemberRemove = 'member_remove',
  Invite = 'invite',
  Leave = 'leave',
  Delete = 'delete',
  Edit = 'edit',
  WelcomePostEdit = 'welcome_post_edit',
}

export interface SourceMember {
  role: SourceMemberRole;
  user: UserShortProfile;
  source: Squad;
  referralToken: string;
  permissions?: SourcePermissions[];
}

export interface SourceMemberSimple {
  image: string;
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
  members?: Connection<SourceMember> | Connection<SourceMemberSimple>;
  membersCount: number;
  description: string;
  memberPostingRole: SourceMemberRole;
  memberInviteRole: SourceMemberRole;
}

export interface PartialSquadWithRequiredFields extends Partial<Squad> {
  membersCount: number;
  permalink: string;
  id: string;
  name: string;
  currentMember?: SourceMember & Required<Pick<SourceMember, 'referralToken' | 'permissions'>>;
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

export const SOURCES_QUERY = gql`
  query Sources($filterOpenSquads: Boolean) {
    sources(filterOpenSquads: $filterOpenSquads) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          name
          permalink
          image
          public
          type
          handle
          description
          membersCount
          members {
            edges {
              node {
                user {
                  bio
                  id
                  image
                  username
                  permalink
                  name
                }
              }
            }
          }
          currentMember {
            user {
              id
            }
            permissions
            role
            referralToken
          }
        }
      }
    }
  }
`;
