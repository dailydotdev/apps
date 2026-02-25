import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useContext } from 'react';
import type { Comment, PostCommentsData } from '../../graphql/comments';
import {
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
} from '../../graphql/comments';
import { LogEvent } from '../../lib/log';
import { postLogEvent } from '../../lib/feed';
import { ActiveFeedContext } from '../../contexts';
import {
  generateQueryKey,
  getAllCommentsQuery,
  RequestKey,
  updatePostCache,
} from '../../lib/query';
import { useBackgroundRequest } from '../companion';
import { gqlRequest } from '../../graphql/common';
import type { Edge } from '../../graphql/common';
import { useLogContext } from '../../contexts/LogContext';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Post } from '../../graphql/posts';

interface SubmitComment {
  id?: string;
  content: string;
}

const generateCommentEdge = (comment: Comment): Edge<Comment> => ({
  node: { ...comment, children: { edges: [], pageInfo: {} } },
});

interface UseMutateCommentProps {
  post: Post;
  editCommentId?: string;
  parentCommentId?: string;
  onCommented?: (
    comment: Comment,
    isNew: boolean,
    parentCommentId?: string,
  ) => void;
}

interface MutateCommentResult {
  comment?: Comment;
}

const hasResponse = (params: unknown): params is { res?: unknown } => {
  return typeof params === 'object' && params !== null && 'res' in params;
};

const isMutateCommentResult = (
  result: unknown,
): result is MutateCommentResult => {
  return typeof result === 'object' && result !== null && 'comment' in result;
};

export interface UseMutateCommentResult {
  mutateComment: (content: string) => Promise<MutateCommentResult>;
  isLoading: boolean;
  isSuccess: boolean;
}

export const useMutateComment = ({
  post,
  editCommentId,
  parentCommentId,
  onCommented,
}: UseMutateCommentProps): UseMutateCommentResult => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const { logEvent } = useLogContext();
  const { logOpts } = useContext(ActiveFeedContext);
  const request = requestMethod ?? gqlRequest;
  const sourceId = post.source?.id;
  const postId = post.id;
  const parentOrPostId = parentCommentId ?? postId;

  const key = useMemo(
    () =>
      generateQueryKey(
        RequestKey.PostCommentsMutations,
        user,
        ...[postId, sourceId, editCommentId, parentCommentId].filter(
          (value) => !!value,
        ),
      ),
    [user, postId, sourceId, editCommentId, parentCommentId],
  );

  const onSuccess = (comment: Comment) => {
    const updateQueryData = (data: PostCommentsData) => {
      const copy = structuredClone(data);

      if (!editCommentId) {
        const edge = generateCommentEdge(comment);

        if (!parentCommentId) {
          copy.postComments.edges.unshift(edge);
          return copy;
        }

        const parentIndex = copy.postComments.edges.findIndex(
          ({ node }) => node.id === parentCommentId,
        );
        if (parentIndex === -1) {
          return copy;
        }

        const parentComment = copy.postComments.edges[parentIndex].node;
        const parentChildren = parentComment.children ?? {
          edges: [],
          pageInfo: {},
        };
        parentChildren.edges.push(edge);
        parentComment.children = parentChildren;

        return copy;
      }

      if (!parentCommentId) {
        const index = copy.postComments.edges.findIndex(
          ({ node }) => node.id === editCommentId,
        );
        if (index === -1) {
          return copy;
        }

        copy.postComments.edges[index].node = {
          ...comment,
          children: copy.postComments.edges[index].node.children,
        };
        return copy;
      }

      const parent = copy.postComments.edges.find(
        ({ node }) => node.id === parentCommentId,
      );
      if (!parent) {
        return copy;
      }

      const parentChildren = parent.node.children ?? {
        edges: [],
        pageInfo: {},
      };
      const index = parentChildren.edges.findIndex(
        ({ node }) => node.id === editCommentId,
      );
      if (index === -1) {
        return copy;
      }

      parentChildren.edges[index].node = {
        ...comment,
        children: parentChildren,
      };
      parent.node.children = parentChildren;
      return copy;
    };

    const forInvalidation: Array<ReturnType<typeof generateQueryKey>> = [];

    getAllCommentsQuery(postId).forEach((queryKey) => {
      client.setQueryData<PostCommentsData>(queryKey, (data) => {
        if (!data) {
          forInvalidation.push(queryKey);
          return undefined;
        }

        return updateQueryData(data);
      });
    });

    forInvalidation.forEach(async (queryKey) => {
      await client.invalidateQueries({ queryKey });
    });

    if (!editCommentId) {
      updatePostCache(client, postId, {
        numComments: (post.numComments ?? 0) + 1,
      });

      logEvent(
        postLogEvent(LogEvent.CommentPost, post, {
          extra: { commentId: parentCommentId },
          ...(logOpts && logOpts),
        }),
      );
    }

    onCommented?.(comment, !editCommentId, parentCommentId);
  };

  const mutation = parentCommentId
    ? COMMENT_ON_COMMENT_MUTATION
    : COMMENT_ON_POST_MUTATION;
  const {
    mutateAsync: onComment,
    isPending: isCommenting,
    isSuccess,
  } = useMutation<MutateCommentResult, unknown, SubmitComment>({
    mutationFn: (variables) =>
      request(mutation, variables, {
        requestKey: JSON.stringify(key),
      }),

    onSuccess: (data) => {
      if (!data?.comment) {
        return;
      }

      onSuccess(data.comment);
    },
  });

  useBackgroundRequest(key, {
    enabled: isCompanion,
    callback: (params) => {
      if (!hasResponse(params)) {
        return;
      }

      if (!isMutateCommentResult(params.res) || !params.res.comment) {
        return;
      }

      onSuccess(params.res.comment);
    },
  });

  const { mutateAsync: editComment, isPending: isEditing } = useMutation<
    MutateCommentResult,
    unknown,
    SubmitComment
  >({
    mutationFn: (variables) =>
      request(EDIT_COMMENT_MUTATION, variables, {
        requestKey: JSON.stringify(key),
      }),

    onSuccess: (data) => {
      if (!data?.comment) {
        return;
      }

      onSuccess(data.comment);
    },
  });

  const onSubmit = useCallback(
    (content: string) => {
      if (editCommentId) {
        return editComment({ id: editCommentId, content });
      }

      return onComment({ content, id: parentOrPostId });
    },
    [editCommentId, parentOrPostId, editComment, onComment],
  );

  return {
    mutateComment: onSubmit,
    isLoading: isCommenting || isEditing,
    isSuccess,
  };
};
