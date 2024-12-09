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

export const MOVE_BOOKMARK_TO_FOLDER = gql`
  mutation MoveBookmarkToFolder($postId: ID!, $listId: ID!) {
    moveBookmark(id: $postId, listId: $listId) {
      _
    }
  }
`;

export interface MoveBookmarkToFolderProps {
  postId: string;
  listId: string;
}

export const moveBookmarkToFolder = ({
  postId,
  listId,
}: MoveBookmarkToFolderProps): Promise<EmptyResponse> =>
  gqlClient.request(MOVE_BOOKMARK_TO_FOLDER, {
    postId,
    listId,
  });
