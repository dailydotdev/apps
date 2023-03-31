import request, { gql } from 'graphql-request';
import { SOURCE_BASE_FRAGMENT, USER_SHORT_INFO_FRAGMENT } from './fragments';
import { graphqlUrl } from '../lib/config';
import { Connection } from './common';
import { Source, SourceMember, Squad } from './sources';
import { Post, PostItem } from './posts';
import { base64ToFile } from '../lib/base64';

export type SquadForm = Pick<
  Squad,
  'name' | 'handle' | 'description' | 'image' | 'allowMemberPosting'
> & {
  url?: string;
  file?: string;
  commentary: string;
  post: PostItem;
  buttonText?: string;
  allowMemberPostingValue?: string;
};

type SharedSquadInput = {
  name: string;
  handle: string;
  description: string;
  image?: File;
  allowMemberPosting?: boolean;
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
  sourceId: string;
  commentary: string;
};

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

export const CREATE_SQUAD_MUTATION = gql`
  mutation CreateSquad(
    $name: String!
    $handle: String!
    $description: String
    $image: Upload
    $allowMemberPosting: Boolean
  ) {
    createSquad(
      name: $name
      handle: $handle
      description: $description
      image: $image
      allowMemberPosting: $allowMemberPosting
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
  ) {
    editSquad(
      sourceId: $sourceId
      name: $name
      handle: $handle
      description: $description
      image: $image
    ) {
      ...SourceBaseInfo
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const ADD_POST_TO_SQUAD_MUTATION = gql`
  mutation AddPostToSquad($id: ID!, $sourceId: ID!, $commentary: String!) {
    sharePost(id: $id, sourceId: $sourceId, commentary: $commentary) {
      id
    }
  }
`;

export const SQUAD_QUERY = gql`
  query Source($handle: ID!) {
    source(id: $handle) {
      ...SourceBaseInfo
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const SQUAD_HANDE_AVAILABILITY_QUERY = gql`
  query SourceHandleExists($handle: String!) {
    sourceHandleExists(handle: $handle)
  }
`;

export const SQUAD_MEMBERS_QUERY = gql`
  query SourceMembers($id: ID!, $after: String, $first: Int) {
    sourceMembers(sourceId: $id, after: $after, first: $first) {
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
  mutation JoinSquad($sourceId: ID!, $token: String!) {
    source: joinSource(sourceId: $sourceId, token: $token) {
      ...SourceBaseInfo
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const validateSourceHandle = (handle: string, source: Source): boolean =>
  source.handle === handle || source.handle === handle.toLowerCase();

export type SquadData = {
  source: Squad;
};

export interface SquadEdgesData {
  sourceMembers: Connection<SourceMember>;
}

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
  token: string;
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

export async function createSquad(form: SquadForm): Promise<Squad> {
  const inputData: CreateSquadInput = {
    description: form?.description,
    handle: form.handle,
    name: form.name,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
    allowMemberPosting: form.allowMemberPosting,
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
>;

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
  };
  const data = await request<EditSquadOutput>(
    graphqlUrl,
    EDIT_SQUAD_MUTATION,
    inputData,
  );
  return data.editSquad;
}
