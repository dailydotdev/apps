import { useMutation, useQueryClient } from '@tanstack/react-query';
import cloneDeep from 'lodash.clonedeep';
import { useCallback, useMemo } from 'react';
import {
  Comment,
  PostCommentsData,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
} from '../../graphql/comments';
import { LogEvent } from '../../lib/log';
import { postLogEvent } from '../../lib/feed';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useBackgroundRequest } from '../companion';
import { updatePostCache } from '../usePostById';
import { Edge } from '../../graphql/common';
import { useLogContext } from '../../contexts/LogContext';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';

interface SubmitComment {
  id?: string;
  content: string;
}

const generateCommentEdge = (comment: Comment): Edge<Comment> => ({
  node: { ...comment, children: { edges: [], pageInfo: null } },
});

interface UseMutateCommentProps {
  post?: Post;
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
  const sourceId = post?.source?.id;
  const postId = post?.id;
  const parentOrPostId = parentCommentId ?? postId;

  const { user } = useAuthContext();
  const client = useQueryClient();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const { logEvent } = useLogContext();

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
    if (!comment) {
      return;
    }

    const comments = generateQueryKey(RequestKey.PostComments, null, postId);
    client.setQueryData<PostCommentsData>(comments, (data) => {
      if (!data) {
        return data;
      }
      const copy = cloneDeep(data);

      if (!editCommentId) {
        const edge = generateCommentEdge(comment);

        if (!parentCommentId) {
          copy.postComments.edges.push(edge);
          return copy;
        }

        const index = copy.postComments.edges.findIndex(
          ({ node }) => node.id === parentCommentId,
        );
        copy.postComments.edges[index].node.children.edges.push(edge);

        return copy;
      }

      if (!parentCommentId) {
        const index = copy.postComments.edges.findIndex(
          ({ node }) => node.id === editCommentId,
        );
        copy.postComments.edges[index].node = {
          ...comment,
          children: copy.postComments.edges[index].node.children,
        };
        return copy;
      }

      const parent = copy.postComments.edges.find(
        ({ node }) => node.id === parentCommentId,
      );
      const index = parent.node.children.edges.findIndex(
        ({ node }) => node.id === editCommentId,
      );
      parent.node.children.edges[index].node = {
        ...comment,
        children: parent.node.children,
      };
      return copy;
    });

    if (!editCommentId) {
      updatePostCache(client, postId, { numComments: post.numComments + 1 });

      logEvent(
        postLogEvent(LogEvent.CommentPost, post, {
          extra: { commentId: parentCommentId },
        }),
      );
    }

    if (onCommented) {
      onCommented(comment, !editCommentId, parentCommentId);
    }
  };

  const mutation = parentCommentId
    ? COMMENT_ON_COMMENT_MUTATION
    : COMMENT_ON_POST_MUTATION;
  const {
    mutateAsync: onComment,
    isLoading: isCommenting,
    isSuccess,
  } = useMutation<MutateCommentResult, unknown, SubmitComment>(
    (variables) =>
      requestMethod(mutation, variables, {
        requestKey: JSON.stringify(key),
      }),
    {
      onSuccess: (data) => onSuccess(data?.comment),
    },
  );

  useBackgroundRequest(key, {
    enabled: isCompanion,
    callback: ({ res }) => onSuccess(res?.comment),
  });

  const { mutateAsync: editComment, isLoading: isEditing } = useMutation<
    MutateCommentResult,
    unknown,
    SubmitComment
  >(
    (variables) =>
      requestMethod(EDIT_COMMENT_MUTATION, variables, {
        requestKey: JSON.stringify(key),
      }),
    { onSuccess: (data) => onSuccess(data?.comment) },
  );

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
