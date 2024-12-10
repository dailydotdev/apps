import { gql } from 'graphql-request';
import { EmptyResponse } from './emptyResponse';
import { gqlClient } from './common';

export const SET_BOOKMARK_REMINDER = gql`
  mutation SetBookmarkReminder($postId: ID!, $remindAt: DateTime) {
    setBookmarkReminder(postId: $postId, remindAt: $remindAt) {
      _
    }
  }
`;

export interface Bookmark {
  createdAt: Date;
  remindAt?: Date;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookmarks?: Bookmark[];
}

export interface SetBookmarkReminderProps {
  postId: string;
  remindAt: Date;
}

export const setBookmarkReminder = ({
  postId,
  remindAt,
}: SetBookmarkReminderProps): Promise<EmptyResponse> =>
  gqlClient.request(SET_BOOKMARK_REMINDER, {
    postId,
    remindAt: remindAt ? remindAt.toISOString() : null,
  });

export const GET_BOOKMARK_FOLDERS = gql`
  query GetBookmarkFolders {
    bookmarkLists {
      id
      name
      icon
    }
  }
`;

export const getBookmarkFolders = async (): Promise<BookmarkFolder[]> => {
  return gqlClient
    .request<{
      bookmarkLists: Array<BookmarkFolder>;
    }>(GET_BOOKMARK_FOLDERS)
    .then((data) => data.bookmarkLists);
};

export const QUERY_BOOKMARK_FOLDER = gql`
  query BookmarkList($id: ID!) {
    bookmarkList(id: $id) {
      id
      name
      icon
    }
  }
`;

export const getBookmarkFolder = async (
  id: string,
): Promise<BookmarkFolder> => {
  const res = await gqlClient.request<{
    bookmarkList: BookmarkFolder;
  }>(QUERY_BOOKMARK_FOLDER, { id });

  return res.bookmarkList;
};

export const CREATE_BOOKMARK_FOLDER = gql`
  mutation CreateBookmarkFolder($name: String!, $icon: String) {
    createBookmarkList(name: $name, icon: $icon) {
      id
      name
      icon
    }
  }
`;

export const createBookmarkFolder = async ({
  name,
  icon,
}: Pick<BookmarkFolder, 'name' | 'icon'>): Promise<BookmarkFolder> => {
  return gqlClient
    .request<{
      createBookmarkList: BookmarkFolder;
    }>(CREATE_BOOKMARK_FOLDER, {
      name,
      icon,
    })
    .then((data) => data.createBookmarkList);
};

export const UPDATE_BOOKMARK_FOLDER = gql`
  mutation UpdateBookmarkList($id: ID!, $name: String!, $icon: String) {
    updateBookmarkList(id: $id, name: $name, icon: $icon) {
      icon
      name
    }
  }
`;

export const updateBookmarkFolder = async ({
  id,
  name,
  icon,
}: BookmarkFolder): Promise<BookmarkFolder> => {
  return gqlClient
    .request<{
      updateBookmarkList: BookmarkFolder;
    }>(UPDATE_BOOKMARK_FOLDER, {
      id,
      name,
      icon,
    })
    .then((data) => data.updateBookmarkList);
};

export const DELETE_BOOKMARK_FOLDER = gql`
  mutation RemoveBookmarkList($id: ID!) {
    removeBookmarkList(id: $id) {
      _
    }
  }
`;

export const deleteBookmarkFolder = async (
  id: string,
): Promise<EmptyResponse> => {
  return gqlClient.request(DELETE_BOOKMARK_FOLDER, { id });
};
