import { gql } from 'graphql-request';
import type { UserShortProfile } from '../lib/user';
import type { Connection } from './common';
import { SOURCE_DIRECTORY_INFO_FRAGMENT } from './fragments';

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

export type SourceMemberFlag = Partial<{
  hideFeedPosts: boolean;
  collapsePinnedPosts: boolean;
}>;

export interface SourceMember {
  role: SourceMemberRole;
  user: UserShortProfile;
  source: Squad;
  referralToken: string;
  permissions?: SourcePermissions[];
  flags?: SourceMemberFlag;
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
  members?: Connection<SourceMember>;
  membersCount: number;
  description: string;
  memberPostingRole: SourceMemberRole;
  memberInviteRole: SourceMemberRole;
  referralUrl?: string;
  banner?: string;
  borderColor?: string;
}

interface SourceFlags {
  featured: boolean;
  totalPosts: number;
  totalViews: number;
  totalUpvotes: number;
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
  privilegedMembers?: SourceMember[];
  public: boolean;
  headerImage?: string;
  color?: string;
  description?: string;
  flags?: SourceFlags;
  createdAt?: Date;
}

export type SourceData = { source: Source };

export const SOURCE_QUERY = gql`
  query Source($id: ID!) {
    source(id: $id) {
      ...SourceDirectoryInfo
      type
    }
  }
  ${SOURCE_DIRECTORY_INFO_FRAGMENT}
`;

export const SOURCE_DIRECTORY_QUERY = gql`
  query SourceDirectory {
    trendingSources {
      ...SourceDirectoryInfo
    }
    popularSources {
      ...SourceDirectoryInfo
    }
    mostRecentSources {
      ...SourceDirectoryInfo
    }
    topVideoSources {
      ...SourceDirectoryInfo
    }
  }
  ${SOURCE_DIRECTORY_INFO_FRAGMENT}
`;

export const SOURCE_RELATED_TAGS_QUERY = gql`
  query RelatedTags($sourceId: ID!) {
    relatedTags(sourceId: $sourceId) {
      tags: hits {
        name
      }
    }
  }
`;

export const SOURCES_BY_TAG_QUERY = gql`
  query SourcesByTag($tag: String!, $first: Int) {
    sourcesByTag(tag: $tag, first: $first) {
      edges {
        node {
          ...SourceDirectoryInfo
        }
      }
    }
  }
  ${SOURCE_DIRECTORY_INFO_FRAGMENT}
`;

export const SIMILAR_SOURCES_QUERY = gql`
  query SimilarSources($sourceId: ID!, $first: Int) {
    similarSources(sourceId: $sourceId, first: $first) {
      edges {
        node {
          ...SourceDirectoryInfo
        }
      }
    }
  }
  ${SOURCE_DIRECTORY_INFO_FRAGMENT}
`;

export enum PublicSquadRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface PublicSquadRequest {
  id?: string;
  requestorId?: string;
  sourceId?: string;
  status?: PublicSquadRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
