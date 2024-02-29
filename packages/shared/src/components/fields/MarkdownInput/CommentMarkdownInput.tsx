import React, {
  FormEventHandler,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import cloneDeep from 'lodash.clonedeep';
import { defaultMarkdownCommands } from '../../../hooks/input';
import MarkdownInput, { MarkdownRef } from './index';
import {
  Comment,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
  PostCommentsData,
} from '../../../graphql/comments';
import { graphqlUrl } from '../../../lib/config';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import { formToJson } from '../../../lib/form';
import { updatePostCache } from '../../../hooks/usePostById';
import { Post } from '../../../graphql/posts';
import { useBackgroundRequest } from '../../../hooks/companion';
import { Edge } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { postAnalyticsEvent } from '../../../lib/feed';
import { AnalyticsEvent } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';

export interface CommentClassName {
  container?: string;
  tab?: string;
}

export interface CommentMarkdownInputProps {
  post: Post;
  editCommentId?: string;
  parentCommentId?: string;
  initialContent?: string;
  replyTo?: string;
  className?: CommentClassName;
  onCommented?: (
    comment: Comment,
    isNew: boolean,
    parentCommentId?: string,
  ) => void;
}

interface SubmitComment {
  id?: string;
  content: string;
}

const generateCommentEdge = (comment: Comment): Edge<Comment> => ({
  node: { ...comment, children: { edges: [], pageInfo: null } },
});

export function CommentMarkdownInput({
  post,
  parentCommentId,
  initialContent,
  replyTo,
  editCommentId,
  className = {},
  onCommented,
}: CommentMarkdownInputProps): ReactElement {
  const postId = post?.id;
  const sourceId = post?.source?.id;
  const client = useQueryClient();
  const markdownRef = useRef<MarkdownRef>();
  const { user } = useAuthContext();
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
  const { requestMethod, isCompanion } = useRequestProtocol();
  const { trackEvent } = useAnalyticsContext();
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

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.CommentPost, post, {
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
  } = useMutation(
    (variables: SubmitComment) =>
      requestMethod(graphqlUrl, mutation, variables, {
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

  const { mutateAsync: editComment, isLoading: isEditing } = useMutation(
    (variables: SubmitComment) =>
      requestMethod(graphqlUrl, EDIT_COMMENT_MUTATION, variables, {
        requestKey: JSON.stringify(key),
      }),
    { onSuccess: (data) => onSuccess(data?.comment) },
  );

  const onSubmit = (content: string) => {
    if (editCommentId) {
      return editComment({ id: editCommentId, content });
    }

    return onComment({ content, id: parentCommentId ?? postId });
  };

  const onSubmitForm: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { content } = formToJson(e.currentTarget);

    return onSubmit(content);
  };

  const onKeyboardSubmit: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const content = e.currentTarget.value;

    return onSubmit(content);
  };

  useEffect(() => {
    markdownRef?.current?.textareaRef?.current?.focus();
  }, []);

  return (
    <form action="#" onSubmit={onSubmitForm} className={className?.container}>
      <MarkdownInput
        ref={markdownRef}
        className={{
          tab: classNames('!min-h-[16rem]', className?.tab),
          input: replyTo && 'mt-0',
          profile: replyTo && '!mt-0',
        }}
        postId={postId}
        sourceId={sourceId}
        showUserAvatar
        isLoading={isCommenting || isEditing}
        disabledSubmit={isSuccess}
        initialContent={initialContent}
        textareaProps={{
          name: 'content',
          rows: 7,
          placeholder: 'Share your thoughts',
        }}
        onSubmit={onKeyboardSubmit}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        submitCopy={editCommentId ? 'Update' : 'Comment'}
        timeline={
          replyTo ? (
            <span className="py-2 pl-12 text-theme-label-tertiary typo-caption1">
              Reply to
              <span className="ml-2 font-bold text-theme-label-primary">
                {replyTo}
              </span>
            </span>
          ) : null
        }
      />
    </form>
  );
}
