import request, { gql } from 'graphql-request';
import { apiUrl } from '../lib/config';
import { UserShortProfile } from '../lib/user';
import { Connection } from './common';
import { Source, SourceData, SOURCE_QUERY } from './sources';
import { Post, PostItem } from './posts';
import { base64ToFile } from '../lib/base64';

export interface Squad extends Source {
  active: boolean;
  handle: string | null;
  permalink: string;
  public: boolean;
  type: 'squad';
  description?: string;
  membersCount: number;
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
};

type EditSquadInput = {
  name: string;
  handle: string;
  description: string;
  image?: File;
};

type CreateSquadInput = EditSquadInput & {
  postId: string;
  commentary: string;
};

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

export const EDIT_SQUAD_MUTATION = gql`
  mutation EditSquad() {
    editSquad() {

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
  }
`;

export const SQUAD_MEMBERS_QUERY = gql`
  query Source($id: ID!) {
    sourceMembers(first: 5, sourceId: $id) {
      edges {
        node {
          role
          user {
            id
            name
            image
            permalink
            username
            bio
          }
        }
      }
    }
  }
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
    handle,
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
    description: form.description,
    handle: form.handle,
    name: form.name,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
  };
  const data = await request<EditSquadOutput>(
    `${apiUrl}/graphql`,
    CREATE_SQUAD_MUTATION,
    inputData,
  );
  return data.editSquad;
}
