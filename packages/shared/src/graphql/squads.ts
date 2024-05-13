import request, { gql } from 'graphql-request';
import { SOURCE_BASE_FRAGMENT, USER_SHORT_INFO_FRAGMENT } from './fragments';
import { graphqlUrl } from '../lib/config';
import { Connection } from './common';
import {
  Source,
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  SourceType,
  Squad,
} from './sources';
import { Post, ExternalLinkPreview } from './posts';
import { base64ToFile } from '../lib/base64';
import { EmptyResponse } from './emptyResponse';
import { generateStorageKey, StorageTopic } from '../lib/storage';

export type SquadForm = Pick<
  Squad,
  'name' | 'handle' | 'description' | 'image'
> & {
  preview?: Partial<ExternalLinkPreview>;
  file?: string;
  commentary: string;
  buttonText?: string;
  memberPostingRole?: SourceMemberRole;
  memberInviteRole?: SourceMemberRole;
  public?: boolean;
};

type SharedSquadInput = {
  name: string;
  handle: string;
  description: string;
  image?: File;
  memberPostingRole?: SourceMemberRole;
  memberInviteRole?: SourceMemberRole;
};

type EditSquadInput = SharedSquadInput & {
  sourceId: string;
};

type CreateSquadInput = SharedSquadInput;

type CreateSquadOutput = {
  createSquad: Squad;
};

type EditSquadOutput = {
  editSquad: Squad;
};

type PostToSquadProps = {
  id: string;
  sourceId?: string;
  commentary: string;
};

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

export const SQUAD_DIRECTORY_SOURCES = gql`
  query Sources($filterOpenSquads: Boolean) {
    sources(filterOpenSquads: $filterOpenSquads) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...SourceBaseInfo
          headerImage
          color
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
  ) {
    createSquad(
      name: $name
      handle: $handle
      description: $description
      image: $image
      memberPostingRole: $memberPostingRole
      memberInviteRole: $memberInviteRole
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
  ) {
    editSquad(
      sourceId: $sourceId
      name: $name
      handle: $handle
      description: $description
      image: $image
      memberPostingRole: $memberPostingRole
      memberInviteRole: $memberInviteRole
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

export const SQUAD_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      ...SourceBaseInfo
      referralUrl
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const SQUAD_STATIC_FIELDS_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      name
      public
      description
      image
      type
    }
  }
`;

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
            ...UserShortInfo
          }
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
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
      ...SourceBaseInfo
      referralUrl
    }
  }
  ${SOURCE_BASE_FRAGMENT}
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
  request(graphqlUrl, UPDATE_MEMBER_ROLE_MUTATION, args);

export const unblockSquadMember = (
  args: SquadMemberMutationProps,
): Promise<EmptyResponse> => request(graphqlUrl, UNBLOCK_MEMBER_MUTATION, args);

export const leaveSquad = (sourceId: string): Promise<void> =>
  request(graphqlUrl, LEAVE_SQUAD_MUTATION, {
    sourceId,
  });

export const deleteSquad = (sourceId: string): Promise<void> =>
  request(graphqlUrl, DELETE_SQUAD_MUTATION, {
    sourceId,
  });

export async function getSquad(handle: string): Promise<Squad> {
  const res = await request<SquadData>(graphqlUrl, SQUAD_QUERY, {
    handle: handle.toLowerCase(),
  });
  return res.source;
}

export async function getSquadMembers(id: string): Promise<SourceMember[]> {
  const res = await request<SquadEdgesData>(graphqlUrl, SQUAD_MEMBERS_QUERY, {
    id,
    first: 5,
  });
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
    const res = await request<SquadInvitation>(
      graphqlUrl,
      SQUAD_INVITATION_QUERY,
      { token },
    );

    return res.member;
  } catch (err) {
    return null;
  }
};

export const joinSquadInvitation = async (
  params: SquadInvitationProps,
): Promise<Squad> => {
  const res = await request<SquadData>(graphqlUrl, SQUAD_JOIN_MUTATION, params);

  return res.source;
};

export const checkExistingHandle = async (handle: string): Promise<boolean> => {
  const req = await request(graphqlUrl, SQUAD_HANDE_AVAILABILITY_QUERY, {
    handle: handle.toLocaleLowerCase(),
  });

  return req.sourceHandleExists;
};

export const addPostToSquad =
  (requestMethod: typeof request) =>
  (data: PostToSquadProps): Promise<Post> =>
    requestMethod(graphqlUrl, ADD_POST_TO_SQUAD_MUTATION, data);

export const updateSquadPost =
  (requestMethod: typeof request) =>
  (data: PostToSquadProps): Promise<Post> =>
    requestMethod(graphqlUrl, UPDATE_SQUAD_POST_MUTATION, data);

export async function createSquad(
  form: Omit<SquadForm, 'commentary'>,
): Promise<Squad> {
  const inputData: CreateSquadInput = {
    description: form?.description,
    handle: form.handle,
    name: form.name,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
    memberPostingRole: form.memberPostingRole,
    memberInviteRole: form.memberInviteRole,
  };
  const data = await request<CreateSquadOutput>(
    graphqlUrl,
    CREATE_SQUAD_MUTATION,
    inputData,
  );
  return data.createSquad;
}

type EditSquadForm = Pick<
  SquadForm,
  'name' | 'description' | 'handle' | 'file'
> & {
  memberPostingRole?: SourceMemberRole;
  memberInviteRole?: SourceMemberRole;
};

export async function editSquad(
  id: string,
  form: EditSquadForm,
): Promise<Squad> {
  const inputData: EditSquadInput = {
    sourceId: id,
    description: form.description,
    handle: form.handle,
    name: form.name,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
    memberPostingRole: form.memberPostingRole,
    memberInviteRole: form.memberInviteRole,
  };
  const data = await request<EditSquadOutput>(
    graphqlUrl,
    EDIT_SQUAD_MUTATION,
    inputData,
  );
  return data.editSquad;
}

export const collapsePinnedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await request(graphqlUrl, COLLAPSE_PINNED_POSTS_MUTATION, {
    sourceId,
  });

  return res.collapsePinnedPosts;
};

export const expandPinnedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await request(graphqlUrl, EXPAND_PINNED_POSTS_MUTATION, {
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
