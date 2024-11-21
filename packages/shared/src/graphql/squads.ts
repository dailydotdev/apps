import { gql } from 'graphql-request';
import {
  SHARED_POST_INFO_FRAGMENT,
  SOURCE_BASE_FRAGMENT,
  SQUAD_BASE_FRAGMENT,
  USER_AUTHOR_FRAGMENT,
  USER_BASIC_INFO,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import { Connection, gqlClient } from './common';
import {
  BasicSourceMember,
  Source,
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  SourceType,
  Squad,
} from './sources';
import type { Post } from './posts';
import { EmptyResponse } from './emptyResponse';
import { generateStorageKey, StorageTopic } from '../lib/storage';
import { PrivacyOption } from '../components/squads/settings/SquadPrivacySection';
import { Author } from './comments';

interface BaseSquadForm
  extends Pick<
    Squad,
    | 'name'
    | 'handle'
    | 'description'
    | 'memberInviteRole'
    | 'memberPostingRole'
    | 'moderationRequired'
  > {
  categoryId?: string;
}

export interface SquadForm extends BaseSquadForm {
  status?: PrivacyOption;
  file?: File;
}

interface SharedSquadInput extends BaseSquadForm {
  image?: File;
  isPrivate?: boolean;
}

interface EditSquadInput extends SharedSquadInput {
  sourceId: string;
}

interface PostToSquadProps {
  id: string;
  sourceId?: string;
  commentary: string;
}

export const UPDATE_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateMemberRole($sourceId: ID!, $memberId: ID!, $role: String!) {
    updateMemberRole(sourceId: $sourceId, memberId: $memberId, role: $role) {
      _
    }
  }
`;

export const UNBLOCK_MEMBER_MUTATION = gql`
  mutation UnblockMember($sourceId: ID!, $memberId: ID!) {
    unblockMember(sourceId: $sourceId, memberId: $memberId) {
      _
    }
  }
`;

export const LEAVE_SQUAD_MUTATION = gql`
  mutation LeaveSource($sourceId: ID!) {
    leaveSource(sourceId: $sourceId) {
      _
    }
  }
`;

export const DELETE_SQUAD_MUTATION = gql`
  mutation DeleteSquad($sourceId: ID!) {
    deleteSource(sourceId: $sourceId) {
      _
    }
  }
`;

export const SOURCES_QUERY = gql`
  query Squads(
    $filterOpenSquads: Boolean
    $featured: Boolean
    $after: String
    $first: Int
    $categoryId: String
    $sortByMembersCount: Boolean
  ) {
    sources(
      filterOpenSquads: $filterOpenSquads
      featured: $featured
      after: $after
      first: $first
      categoryId: $categoryId
      sortByMembersCount: $sortByMembersCount
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...SourceBaseInfo
          flags {
            featured
            totalPosts
            totalViews
            totalUpvotes
          }
          headerImage
          color
          membersCount
          members {
            edges {
              node {
                user {
                  id
                  name
                  image
                  permalink
                  username
                  bio
                  reputation
                  companies {
                    name
                    image
                  }
                }
              }
            }
          }
          referralUrl
        }
      }
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const CREATE_SQUAD_MUTATION = gql`
  mutation CreateSquad(
    $name: String!
    $handle: String!
    $description: String
    $image: Upload
    $memberPostingRole: String
    $memberInviteRole: String
    $moderationRequired: Boolean
    $isPrivate: Boolean
    $categoryId: ID
  ) {
    createSquad(
      name: $name
      handle: $handle
      description: $description
      image: $image
      memberPostingRole: $memberPostingRole
      memberInviteRole: $memberInviteRole
      moderationRequired: $moderationRequired
      isPrivate: $isPrivate
      categoryId: $categoryId
    ) {
      ...SourceBaseInfo
      members {
        edges {
          node {
            referralToken
          }
        }
      }
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const EDIT_SQUAD_MUTATION = gql`
  mutation EditSquad(
    $sourceId: ID!
    $name: String!
    $handle: String!
    $description: String
    $image: Upload
    $memberPostingRole: String
    $memberInviteRole: String
    $moderationRequired: Boolean
    $isPrivate: Boolean
    $categoryId: ID
  ) {
    editSquad(
      sourceId: $sourceId
      name: $name
      handle: $handle
      description: $description
      image: $image
      memberPostingRole: $memberPostingRole
      memberInviteRole: $memberInviteRole
      moderationRequired: $moderationRequired
      isPrivate: $isPrivate
      categoryId: $categoryId
    ) {
      ...SourceBaseInfo
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const ADD_POST_TO_SQUAD_MUTATION = gql`
  mutation AddPostToSquad($id: ID!, $sourceId: ID!, $commentary: String) {
    sharePost(id: $id, sourceId: $sourceId, commentary: $commentary) {
      id
    }
  }
`;

export const UPDATE_SQUAD_POST_MUTATION = gql`
  mutation UpdateSquadPost($id: ID!, $commentary: String) {
    editSharePost(id: $id, commentary: $commentary) {
      id
    }
  }
`;

// this query should use UserShortInfo fragment once the createdAt issue is fixed.
// for the mean time, we should not include the said property on privilegedMembers.
export const SQUAD_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      ...SquadBaseInfo
      moderationPostCount
    }
  }
  ${SQUAD_BASE_FRAGMENT}
`;

export const SQUAD_STATIC_FIELDS_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      id
      name
      handle
      public
      description
      image
      type
      permalink
      moderationRequired
    }
  }
`;

export type SquadStaticData = Pick<
  Squad,
  | 'id'
  | 'name'
  | 'handle'
  | 'public'
  | 'description'
  | 'image'
  | 'type'
  | 'moderationRequired'
  | 'permalink'
>;

export const getSquadStaticFields = async (
  handle: string,
): Promise<SquadStaticData> => {
  const res = await gqlClient.request(SQUAD_STATIC_FIELDS_QUERY, { handle });

  return res.source;
};

export const SQUAD_HANDE_AVAILABILITY_QUERY = gql`
  query SourceHandleExists($handle: String!) {
    sourceHandleExists(handle: $handle)
  }
`;

export const SQUAD_MEMBERS_QUERY = gql`
  query SourceMembers(
    $id: ID!
    $after: String
    $first: Int
    $role: String
    $query: String
  ) {
    sourceMembers(
      sourceId: $id
      after: $after
      first: $first
      role: $role
      query: $query
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          role
          user {
            ...UserAuthor
          }
        }
      }
    }
  }
  ${USER_AUTHOR_FRAGMENT}
`;

export const BASIC_SQUAD_MEMBERS_QUERY = gql`
  query BasicSourceMembers($id: ID!, $first: Int) {
    sourceMembers(sourceId: $id, first: $first) {
      edges {
        node {
          user {
            ...UserBasicInfo
          }
        }
      }
    }
  }
  ${USER_BASIC_INFO}
`;

export const SQUAD_INVITATION_QUERY = gql`
  query SourceInvitationQuery($token: String!) {
    member: sourceMemberByToken(token: $token) {
      user {
        ...UserShortInfo
      }
      source {
        ...SourceBaseInfo
        members {
          edges {
            node {
              user {
                ...UserShortInfo
              }
            }
          }
        }
      }
    }
  }
  ${SOURCE_BASE_FRAGMENT}
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const SQUAD_JOIN_MUTATION = gql`
  mutation JoinSquad($sourceId: ID!, $token: String) {
    source: joinSource(sourceId: $sourceId, token: $token) {
      ...SquadBaseInfo
    }
  }
  ${SQUAD_BASE_FRAGMENT}
`;

export const COLLAPSE_PINNED_POSTS_MUTATION = gql`
  mutation CollapsePinnedPosts($sourceId: ID!) {
    collapsePinnedPosts(sourceId: $sourceId) {
      _
    }
  }
`;

export const EXPAND_PINNED_POSTS_MUTATION = gql`
  mutation ExpandPinnedPosts($sourceId: ID!) {
    expandPinnedPosts(sourceId: $sourceId) {
      _
    }
  }
`;

export const validateSourceHandle = (handle: string, source: Source): boolean =>
  source.handle === handle || source.handle === handle.toLowerCase();

export type SquadData = {
  source: Squad;
};

export interface SquadEdgesData {
  sourceMembers: Connection<SourceMember>;
}

export interface BasicSourceMembersData {
  sourceMembers: Connection<BasicSourceMember>;
}

interface SquadMemberMutationProps {
  sourceId: string;
  memberId: string;
}

interface UpdateSquadMemberRoleProps extends SquadMemberMutationProps {
  role: SourceMemberRole;
}

export const updateSquadMemberRole = (
  args: UpdateSquadMemberRoleProps,
): Promise<EmptyResponse> =>
  gqlClient.request(UPDATE_MEMBER_ROLE_MUTATION, args);

export const unblockSquadMember = (
  args: SquadMemberMutationProps,
): Promise<EmptyResponse> => gqlClient.request(UNBLOCK_MEMBER_MUTATION, args);

export const leaveSquad = (sourceId: string): Promise<void> =>
  gqlClient.request(LEAVE_SQUAD_MUTATION, {
    sourceId,
  });

export const deleteSquad = (sourceId: string): Promise<void> =>
  gqlClient.request(DELETE_SQUAD_MUTATION, {
    sourceId,
  });

export async function getSquad(handle: string): Promise<Squad> {
  const res = await gqlClient.request<SquadData>(SQUAD_QUERY, {
    handle: handle.toLowerCase(),
  });
  return res.source;
}

export async function getSquadMembers(
  id: string,
): Promise<BasicSourceMember[]> {
  const res = await gqlClient.request<BasicSourceMembersData>(
    BASIC_SQUAD_MEMBERS_QUERY,
    {
      id,
      first: 5,
    },
  );
  return res.sourceMembers.edges?.map((edge) => edge.node);
}

export interface SquadInvitation {
  member: SourceMember;
}

export interface SquadInvitationProps {
  token?: string;
  sourceId: string;
}

export const getSquadInvitation = async (
  token: string,
): Promise<SourceMember> => {
  try {
    const res = await gqlClient.request<SquadInvitation>(
      SQUAD_INVITATION_QUERY,
      {
        token,
      },
    );

    return res.member;
  } catch (err) {
    return null;
  }
};

export const joinSquadInvitation = async (
  params: SquadInvitationProps,
): Promise<Squad> => {
  const res = await gqlClient.request<SquadData>(SQUAD_JOIN_MUTATION, params);

  return res.source;
};

export const checkExistingHandle = async (handle: string): Promise<boolean> => {
  const req = await gqlClient.request(SQUAD_HANDE_AVAILABILITY_QUERY, {
    handle: handle.toLocaleLowerCase(),
  });

  return req.sourceHandleExists;
};

export const addPostToSquad =
  (requestMethod: typeof gqlClient.request) =>
  (data: PostToSquadProps): Promise<Post> =>
    requestMethod(ADD_POST_TO_SQUAD_MUTATION, data);

export const updateSquadPost =
  (requestMethod: typeof gqlClient.request) =>
  (data: PostToSquadProps): Promise<Post> =>
    requestMethod(UPDATE_SQUAD_POST_MUTATION, data);

const formToInput = (form: SquadForm): SharedSquadInput => ({
  description: form.description,
  handle: form.handle,
  name: form.name,
  image: form.file,
  memberPostingRole: form.memberPostingRole,
  memberInviteRole: form.memberInviteRole,
  categoryId: form.categoryId,
  moderationRequired: form.moderationRequired,
  isPrivate: form.status === PrivacyOption.Private,
});

export async function createSquad(form: SquadForm): Promise<Squad> {
  const inputData: SharedSquadInput = formToInput(form);
  const data = await gqlClient.request(CREATE_SQUAD_MUTATION, inputData);

  return data.createSquad;
}

interface EditSquadMutation {
  id: string;
  form: SquadForm;
}

export async function editSquad({
  id,
  form,
}: EditSquadMutation): Promise<Squad> {
  const inputData: EditSquadInput = { ...formToInput(form), sourceId: id };
  const data = await gqlClient.request(EDIT_SQUAD_MUTATION, inputData);

  return data.editSquad;
}

export const collapsePinnedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(COLLAPSE_PINNED_POSTS_MUTATION, {
    sourceId,
  });

  return res.collapsePinnedPosts;
};

export const expandPinnedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(EXPAND_PINNED_POSTS_MUTATION, {
    sourceId,
  });

  return res.expandPinnedPosts;
};

export const verifyPermission = (
  squad: Squad,
  permission: SourcePermissions,
): boolean => !!squad?.currentMember?.permissions?.includes(permission);

export const isSourcePublicSquad = (source: Source): boolean =>
  !!(source?.type === SourceType.Squad && source?.public);

export const SQUAD_COMMENT_JOIN_BANNER_KEY = generateStorageKey(
  StorageTopic.Squad,
  'comment_join_banner',
);

export enum SourcePostModerationStatus {
  Approved = 'approved',
  Rejected = 'rejected',
  Pending = 'pending',
}

type PostRequestContentProps = Pick<
  Post,
  | 'type'
  | 'title'
  | 'titleHtml'
  | 'content'
  | 'contentHtml'
  | 'image'
  | 'sharedPost'
  | 'createdAt'
>;

interface PostRequestContent extends PostRequestContentProps {
  createdBy: Author;
}

export interface SourcePostModeration extends Partial<PostRequestContent> {
  id: string;
  post?: Post;
  status: SourcePostModerationStatus;
  rejectionReason?: PostModerationReason;
  moderatorMessage?: string;
  source?: Source;
  externalLink?: string;
}

const SOURCE_POST_MODERATION_FRAGMENT = gql`
  fragment SourcePostModerationFragment on SourcePostModeration {
    id
    title
    status
    rejectionReason
    moderatorMessage
    type
    title
    titleHtml
    content
    contentHtml
    image
    createdAt
    externalLink
    source {
      ...SourceBaseInfo
    }
    createdBy {
      ...UserAuthor
    }
    moderatedBy {
      ...UserAuthor
    }
    sharedPost {
      ...SharedPostInfo
    }
    post {
      ...SharedPostInfo
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const SQUAD_PENDING_POSTS_QUERY = gql`
  query sourcePostModerations($sourceId: ID!, $status: [String]) {
    sourcePostModerations(sourceId: $sourceId, status: $status) {
      edges {
        node {
          ...SourcePostModerationFragment
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${SOURCE_POST_MODERATION_FRAGMENT}
`;

export const SQUAD_MODERATE_POST_MUTATION = gql`
  mutation ModerateSourcePost(
    $postIds: [ID]!
    $status: String
    $sourceId: ID!
    $rejectionReason: String
    $moderatorMessage: String
  ) {
    moderateSourcePosts(
      postIds: $postIds
      status: $status
      sourceId: $sourceId
      rejectionReason: $rejectionReason
      moderatorMessage: $moderatorMessage
    ) {
      ...SourcePostModerationFragment
    }
  }
  ${SOURCE_POST_MODERATION_FRAGMENT}
`;

export enum PostModerationReason {
  OffTopic = 'OFF_TOPIC',
  Violation = 'VIOLATION',
  Promotional = 'PROMOTIONAL',
  Duplicate = 'DUPLICATE',
  LowQuality = 'LOW_QUALITY',
  NSFW = 'NSFW',
  Spam = 'SPAM',
  Misinformation = 'MISINFORMATION',
  Copyright = 'COPYRIGHT',
  Other = 'OTHER',
}

export interface SquadPostModerationProps {
  postIds: string[];
  sourceId: Source['id'];
}

export interface SquadPostRejectionProps extends SquadPostModerationProps {
  reason: PostModerationReason;
  note?: string;
}

export const squadApproveMutation = ({
  postIds,
  sourceId,
}: SquadPostModerationProps): Promise<SourcePostModeration[]> => {
  return gqlClient
    .request<{
      moderateSourcePosts: SourcePostModeration[];
    }>(SQUAD_MODERATE_POST_MUTATION, {
      postIds,
      sourceId,
      status: SourcePostModerationStatus.Approved,
    })
    .then((res) => res.moderateSourcePosts);
};

export const squadRejectMutation = ({
  postIds,
  sourceId,
  reason,
  note,
}: SquadPostRejectionProps): Promise<SourcePostModeration[]> => {
  return gqlClient
    .request<{
      moderateSourcePosts: SourcePostModeration[];
    }>(SQUAD_MODERATE_POST_MUTATION, {
      postIds,
      sourceId,
      status: SourcePostModerationStatus.Rejected,
      rejectionReason: reason,
      moderatorMessage: note,
    })
    .then((res) => res.moderateSourcePosts);
};

const DELETE_PENDING_POST_MUTATION = gql`
  mutation DeleteSourcePostModeration($postId: ID!) {
    deleteSourcePostModeration(postId: $postId) {
      _
    }
  }
`;

export const deletePendingPostMutation = async (
  postId: string,
): Promise<void> => {
  return gqlClient.request(DELETE_PENDING_POST_MUTATION, { postId });
};
