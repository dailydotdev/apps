import request, { gql } from 'graphql-request';
import { graphqlUrl } from '../lib/config';
import { EmptyResponse } from './emptyResponse';

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
  request(graphqlUrl, SET_BOOKMARK_REMINDER, {
    postId,
    remindAt: remindAt.toISOString(),
  });
