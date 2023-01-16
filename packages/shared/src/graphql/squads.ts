import request, { gql } from 'graphql-request';
import { USER_SHORT_INFO_FRAGMENT } from './users';
import { apiUrl } from '../lib/config';
import { UserShortProfile } from '../lib/user';
import { Connection } from './common';
import { Source } from './sources';

export interface Squad extends Source {
  active: boolean;
  handle: string | null;
  permalink: string;
  public: boolean;
  type: 'squad';
  description?: string;
  membersCount: number;
  members: Connection<SquadMember>;
  currentMember?: SquadMember;
}

export type Squads = {
  squads: Squad[];
};

export enum SquadMemberRole {
  Member = 'member',
  Owner = 'owner',
}

export type SquadMember = {
  role: SquadMemberRole;
  user: UserShortProfile;
};

export type CreateSquadInput = {
  name: string;
  handle: string;
  description: string;
  postId: string;
  commentary: string;
  image: File;
};

export type CreateSquadOutput = {
  createSquad: Squad;
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
    removeSource(sourceId: $sourceId) {
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
  query SourceInvitationQuery($handle: ID!, $token: String!) {
    member: sourceMemberByToken(token: $token) {
      user {
        ...UserShortInfoFragment
      }
    }
    source(id: $handle) {
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
  ${SOURCE_BASE_FRAGMENT}
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const SQUAD_JOIN_MUTATION = gql`
  mutation JoinSquad($handle: ID!, $token: String!) {
    joinSource(sourceId: $handle, token: $token) {
      ...SourceBaseFragment
    }
  }
  ${SOURCE_BASE_FRAGMENT}
`;

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

interface SquadInvitation {
  member: SquadMember;
  source: Squad;
}

export interface SquadInvitationProps {
  token: string;
  handle: string;
}

export const getSquadInvitation = ({
  token,
  handle,
}: SquadInvitationProps): Promise<SquadInvitation> =>
  request<SquadInvitation>(`${apiUrl}/graphql`, SQUAD_INVITATION_QUERY, {
    token,
    handle: handle.toLowerCase(),
  });

export const joinSquadInvitation = ({
  token,
  handle,
}: SquadInvitationProps): Promise<SquadInvitation> =>
  request<SquadInvitation>(`${apiUrl}/graphql`, SQUAD_JOIN_MUTATION, {
    token,
    handle: handle.toLowerCase(),
  });
