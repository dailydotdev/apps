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

export const MOVE_BOOKMARK_MUTATION = gql`
  mutation MoveBookmark($id: ID!, $listId: ID) {
    moveBookmark(id: $id, listId: $listId) {
      _
    }
  }
`;

export interface Bookmark {
  listId?: string;
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

export type MoveBookmarkProps = {
  postId: string;
  listId: string;
};
export const moveBookmark = ({
  postId,
  listId,
}: MoveBookmarkProps): Promise<EmptyResponse> =>
  gqlClient.request(MOVE_BOOKMARK_MUTATION, {
    id: postId,
    listId,
  });
