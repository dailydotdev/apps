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
