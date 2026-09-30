import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import { gqlBatchRequest } from './batch';
import { COMMENT_FRAGMENT } from './fragments';
import type { Comment } from './comments';
import type { EmptyResponse } from './emptyResponse';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey } from '../lib/query';

export const FILTERED_COMMENTS_COUNT_QUERY = gql`
  query FilteredCommentsCount($postId: ID!) {
    filteredCommentsCount(postId: $postId)
  }
`;

export const FILTERED_COMMENTS_QUERY = gql`
  query FilteredComments($postId: ID!) {
    filteredComments(postId: $postId) {
      edges {
        node {
          ...CommentFragment
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const REPORT_NOT_SPAM_MUTATION = gql`
  mutation ReportNotSpam($commentId: ID!) {
    reportNotSpam(commentId: $commentId) {
      _
    }
  }
`;

interface FilteredCommentsQueryParams {
  postId: string;
  user?: Pick<LoggedUser, 'id'>;
}

export const filteredCommentsCountQueryOptions = ({
  postId,
  user,
}: FilteredCommentsQueryParams) => ({
  queryKey: generateQueryKey(
    RequestKey.FilteredComments,
    user,
    postId,
    'count',
  ),
  queryFn: async (): Promise<number> => {
    const res = await gqlBatchRequest<{ filteredCommentsCount: number }>(
      FILTERED_COMMENTS_COUNT_QUERY,
      { postId },
    );

    return res.filteredCommentsCount;
  },
});

export const filteredCommentsQueryOptions = ({
  postId,
  user,
}: FilteredCommentsQueryParams) => ({
  queryKey: generateQueryKey(RequestKey.FilteredComments, user, postId),
  queryFn: async (): Promise<Comment[]> => {
    const res = await gqlBatchRequest<{
      filteredComments: Connection<Comment>;
    }>(FILTERED_COMMENTS_QUERY, { postId });

    return res.filteredComments.edges.map(({ node }) => node);
  },
});

export const reportNotSpam = (commentId: string): Promise<EmptyResponse> =>
  gqlClient.request(REPORT_NOT_SPAM_MUTATION, { commentId });
