import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlBatchRequest } from './batch';
import { COMMENT_FRAGMENT } from './fragments';
import type { Comment } from './comments';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, getNextPageParam, RequestKey } from '../lib/query';

export const FILTERED_COMMENTS_COUNT_QUERY = gql`
  query FilteredCommentsCount($postId: ID!) {
    filteredCommentsCount(postId: $postId)
  }
`;

export const FILTERED_COMMENTS_QUERY = gql`
  query FilteredComments($postId: ID!, $first: Int, $after: String) {
    filteredComments(postId: $postId, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...CommentFragment
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

// The API's page cap for filteredComments
const filteredCommentsMaxSize = 100;

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
  queryKey: generateQueryKey(RequestKey.FilteredComments, user, postId, 'list'),
  queryFn: async ({
    pageParam,
  }: {
    pageParam: string;
  }): Promise<Connection<Comment>> => {
    const res = await gqlBatchRequest<{
      filteredComments: Connection<Comment>;
    }>(FILTERED_COMMENTS_QUERY, {
      postId,
      first: filteredCommentsMaxSize,
      after: pageParam || undefined,
    });

    return res.filteredComments;
  },
  initialPageParam: '',
  getNextPageParam: (lastPage: Connection<Comment>) =>
    getNextPageParam(lastPage?.pageInfo),
});
