import { gql } from 'graphql-request';
import type { UserShortProfile } from '../lib/user';
import type { Connection } from './common';
import { gqlClient } from './common';
import {
  SOURCE_CATEGORY_FRAGMENT,
  SOURCE_DIRECTORY_INFO_FRAGMENT,
} from './fragments';
import type { ContentPreference } from './contentPreference';
import { RequestKey, StaleTime } from '../lib/query';

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
  PostRequest = 'post_request',
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
  ConnectSlack = 'connect_slack',
  ModeratePost = 'moderate_post',
  BoostSquad = 'boost_squad',
}

export type SourceMemberFlag = Partial<{
  hideFeedPosts: boolean;
  collapsePinnedPosts: boolean;
  hasUnreadPosts: boolean;
}>;

export interface SourceMember {
  role: SourceMemberRole;
  user: UserShortProfile;
  source: Squad;
  referralToken: string;
  permissions?: SourcePermissions[];
  flags?: SourceMemberFlag;
}

export interface BasicSourceMember {
  user: {
    id: string;
    name: string;
    image: string;
    permalink: string;
  };
}

export enum SourceType {
  Machine = 'machine',
  Squad = 'squad',
  User = 'user',
}

export const isSourceUserSource = (source?: Source): boolean =>
  source?.type === SourceType.User;

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
  moderationRequired: boolean;
  referralUrl?: string;
  category?: SourceCategory;
  moderationPostCount: number;
  hasUnreadPosts: boolean;
}

interface SourceFlags {
  featured: boolean;
  totalPosts: number;
  totalViews: number;
  totalUpvotes: number;
  totalAwards: number;
  campaignId?: string;
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
  contentPreference?: ContentPreference;
}

export type SourceTooltip = Pick<
  Source,
  'id' | 'name' | 'image' | 'handle' | 'permalink' | 'description' | 'flags'
> & {
  membersCount?: number;
  type?: SourceType;
};

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

export interface SourceCategory {
  id: string;
  slug: string;
  title: string;
  createdAt: Date;
}

export const SOURCE_CATEGORIES_QUERY = gql`
  query SourceCategories($first: Int, $after: String) {
    categories: sourceCategories(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...SourceCategoryFragment
        }
      }
    }
  }
  ${SOURCE_CATEGORY_FRAGMENT}
`;

export interface SourceCategoryData {
  categories: Connection<SourceCategory>;
}

export const sourceQueryOptions = ({ sourceId }: { sourceId: string }) => {
  return {
    queryKey: [RequestKey.Source, null, sourceId],
    queryFn: async () => {
      const res = await gqlClient.request<SourceData>(SOURCE_QUERY, {
        id: sourceId,
      });

      return res.source;
    },
    staleTime: StaleTime.OneHour,
    enabled: !!sourceId,
  };
};
