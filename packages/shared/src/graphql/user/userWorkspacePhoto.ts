import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';

export interface UserWorkspacePhoto {
  id: string;
  image: string;
  position: number;
  createdAt: string;
}

export interface AddUserWorkspacePhotoInput {
  image: string;
}

export interface ReorderUserWorkspacePhotoInput {
  id: string;
  position: number;
}

const USER_WORKSPACE_PHOTO_FRAGMENT = gql`
  fragment UserWorkspacePhotoFragment on UserWorkspacePhoto {
    id
    image
    position
    createdAt
  }
`;

const USER_WORKSPACE_PHOTOS_QUERY = gql`
  query UserWorkspacePhotos($userId: ID!, $first: Int, $after: String) {
    userWorkspacePhotos(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...UserWorkspacePhotoFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${USER_WORKSPACE_PHOTO_FRAGMENT}
`;

const ADD_USER_WORKSPACE_PHOTO_MUTATION = gql`
  mutation AddUserWorkspacePhoto($input: AddUserWorkspacePhotoInput!) {
    addUserWorkspacePhoto(input: $input) {
      ...UserWorkspacePhotoFragment
    }
  }
  ${USER_WORKSPACE_PHOTO_FRAGMENT}
`;

const DELETE_USER_WORKSPACE_PHOTO_MUTATION = gql`
  mutation DeleteUserWorkspacePhoto($id: ID!) {
    deleteUserWorkspacePhoto(id: $id) {
      _
    }
  }
`;

const REORDER_USER_WORKSPACE_PHOTOS_MUTATION = gql`
  mutation ReorderUserWorkspacePhotos(
    $items: [ReorderUserWorkspacePhotoInput!]!
  ) {
    reorderUserWorkspacePhotos(items: $items) {
      ...UserWorkspacePhotoFragment
    }
  }
  ${USER_WORKSPACE_PHOTO_FRAGMENT}
`;

export const getUserWorkspacePhotos = async (
  userId: string,
  first = 50,
): Promise<Connection<UserWorkspacePhoto>> => {
  const result = await gqlClient.request<{
    userWorkspacePhotos: Connection<UserWorkspacePhoto>;
  }>(USER_WORKSPACE_PHOTOS_QUERY, { userId, first });
  return result.userWorkspacePhotos;
};

export const addUserWorkspacePhoto = async (
  input: AddUserWorkspacePhotoInput,
): Promise<UserWorkspacePhoto> => {
  const result = await gqlClient.request<{
    addUserWorkspacePhoto: UserWorkspacePhoto;
  }>(ADD_USER_WORKSPACE_PHOTO_MUTATION, { input });
  return result.addUserWorkspacePhoto;
};

export const deleteUserWorkspacePhoto = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_USER_WORKSPACE_PHOTO_MUTATION, { id });
};

export const reorderUserWorkspacePhotos = async (
  items: ReorderUserWorkspacePhotoInput[],
): Promise<UserWorkspacePhoto[]> => {
  const result = await gqlClient.request<{
    reorderUserWorkspacePhotos: UserWorkspacePhoto[];
  }>(REORDER_USER_WORKSPACE_PHOTOS_MUTATION, { items });
  return result.reorderUserWorkspacePhotos;
};
