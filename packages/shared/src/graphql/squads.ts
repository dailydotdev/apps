import request, { gql } from 'graphql-request';
import { USER_SHORT_INFO_FRAGMENT } from './users';
import { apiUrl } from '../lib/config';
import { UserShortProfile } from '../lib/user';
import { Connection, Edge } from './common';
import { Source, SourceData, SOURCE_QUERY } from './sources';
import { Post, PostItem } from './posts';
import { base64ToFile } from '../lib/base64';

export interface Squad extends Source {
  active: boolean;
  permalink: string;
  public: boolean;
  type: 'squad';
  description?: string;
  membersCount: number;
  members?: Connection<SquadMember>;
  currentMember?: SquadMember;
}

export type Squads = {
  squads: Squad[];
};

export type SquadForm = Pick<Squad, 'name' | 'handle' | 'description'> & {
  file?: string;
  commentary: string;
  post: PostItem;
  buttonText?: string;
};

export enum SquadMemberRole {
  Member = 'member',
  Owner = 'owner',
}

export type SquadMember = {
  role: SquadMemberRole;
  user: UserShortProfile;
  source: Squad;
  referralToken: string;
};

type SharedSquadInput = {
  name: string;
  handle: string;
  description: string;
  image?: File;
};

type EditSquadInput = SharedSquadInput & {
  sourceId: string;
};

type CreateSquadInput = SharedSquadInput & {
  postId: string;
  commentary: string;
};

type CreateSquadOutput = {
  createSquad: Squad;
};

type EditSquadOutput = {
  editSquad: Squad;
};

type SquadMembershipsOutput = {
  mySourceMemberships: {
    members: Edge<Pick<SquadMember, 'source'>>[];
  };
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
    $postId: ID!
    $commentary: String!
    $image: Upload
  ) {
    createSquad(
      name: $name
      handle: $handle
      description: $description
      postId: $postId
      commentary: $commentary
      image: $image
    ) {
      active
      handle
      name
      permalink
      public
      type
      description
      members {
        edges {
          node {
            referralToken
          }
        }
      }
    }
  }
`;

const SOURCE_BASE_FRAGMENT = gql`
  fragment SourceBaseFragment on Source {
    id
    active
    handle
    name
    permalink
    public
    type
    description
    image
    membersCount
    currentMember {
      role
      referralToken
    }
  }
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
      active
      handle
      name
      permalink
      public
      type
      description
    }
  }
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
      ...SourceBaseFragment
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const SQUAD_HANDE_AVAILABILITY_QUERY = gql`
  query SourceHandleExists($handle: String!) {
    sourceHandleExists(handle: $handle)
  }
`;

export const SQUAD_MEMBERSHIPS_QUERY = gql`
  query Source {
    mySourceMemberships {
      members: edges {
        node {
          source {
            active
            handle
            id
            image
            name
            permalink
            public
            type
          }
        }
      }
    }
  }
`;

export const SQUAD_MEMBERS_QUERY = gql`
  query Source($id: ID!) {
    sourceMembers(first: 5, sourceId: $id) {
      edges {
        node {
          role
          user {
            ...UserShortInfoFragment
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
        ...UserShortInfoFragment
      }
      source {
        ...SourceBaseFragment
        members {
          edges {
            node {
              user {
                ...UserShortInfoFragment
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
    joinSource(sourceId: $sourceId, token: $token) {
      ...SourceBaseFragment
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

export const validateSourceId = (id: string, source: Squad): boolean =>
  source.id === id || source.handle === id.toLowerCase();

export type SquadData = {
  source: Squad;
};

export interface SquadEdgesData {
  sourceMembers: Connection<SquadMember>;
}

export const leaveSquad = (sourceId: string): Promise<void> =>
  request(`${apiUrl}/graphql`, LEAVE_SQUAD_MUTATION, {
    sourceId,
  });

export const deleteSquad = (sourceId: string): Promise<void> =>
  request(`${apiUrl}/graphql`, DELETE_SQUAD_MUTATION, {
    sourceId,
  });

export async function getSquad(handle: string): Promise<Squad> {
  const res = await request<SquadData>(`${apiUrl}/graphql`, SQUAD_QUERY, {
    handle: handle.toLowerCase(),
  });
  return res.source;
}

export async function getSquadMembers(id: string): Promise<SquadMember[]> {
  const res = await request<SquadEdgesData>(
    `${apiUrl}/graphql`,
    SQUAD_MEMBERS_QUERY,
    { id },
  );
  return res.sourceMembers.edges?.map((edge) => edge.node);
}

export interface SquadInvitation {
  member: SquadMember;
}

export interface SquadInvitationProps {
  token: string;
  sourceId: string;
}

export const getSquadInvitation = async (
  token: string,
): Promise<SquadMember> => {
  const res = await request<SquadInvitation>(
    `${apiUrl}/graphql`,
    SQUAD_INVITATION_QUERY,
    { token },
  );

  return res.member;
};

export const joinSquadInvitation = (
  params: SquadInvitationProps,
): Promise<SquadInvitation> =>
  request(`${apiUrl}/graphql`, SQUAD_JOIN_MUTATION, params);

export const checkExistingHandle = async (handle: string): Promise<boolean> => {
  const req = await request(
    `${apiUrl}/graphql`,
    SQUAD_HANDE_AVAILABILITY_QUERY,
    { handle },
  );

  return req.sourceHandleExists;
};

export async function checkSourceExists(id: string): Promise<boolean> {
  try {
    const data = await request<SourceData>(`${apiUrl}/graphql`, SOURCE_QUERY, {
      id,
    });
    return !!data.source;
  } catch (err) {
    if (err?.response?.errors?.[0].extensions?.code === 'NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

export const addPostToSquad = (data: PostToSquadProps): Promise<Post> =>
  request(`${apiUrl}/graphql`, ADD_POST_TO_SQUAD_MUTATION, data);

export async function createSquad(form: SquadForm): Promise<Squad> {
  const inputData: CreateSquadInput = {
    commentary: form.commentary,
    description: form.description,
    handle: form.handle,
    name: form.name,
    postId: form.post.post.id,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
  };
  const data = await request<CreateSquadOutput>(
    `${apiUrl}/graphql`,
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
    `${apiUrl}/graphql`,
    EDIT_SQUAD_MUTATION,
    inputData,
  );
  return data.editSquad;
}

export async function squadMemberships(): Promise<Squad[]> {
  const data = await request<SquadMembershipsOutput>(
    `${apiUrl}/graphql`,
    SQUAD_MEMBERSHIPS_QUERY,
  );
  return data.mySourceMemberships.members.map((node) => node.node.source);
}
