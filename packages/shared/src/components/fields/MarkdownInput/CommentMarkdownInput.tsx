import React, {
  FormEventHandler,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useMutation, useQueryClient } from 'react-query';
import classNames from 'classnames';
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
import { getPostByIdKey, updatePostCache } from '../../../hooks/usePostById';
import { PostData } from '../../../graphql/posts';
import { useBackgroundRequest } from '../../../hooks/companion';
import { Edge } from '../../../graphql/common';

export interface CommentClassName {
  container?: string;
  tab?: string;
}

export interface CommentMarkdownInputProps {
  postId?: string;
  sourceId?: string;
  editCommentId?: string;
  parentCommentId?: string;
  initialContent?: string;
  replyTo?: string;
  className?: CommentClassName;
  onCommented?: (comment: Comment, isNew?: boolean) => void;
}

interface SubmitComment {
  id?: string;
  content: string;
}

const generateCommentEdge = (comment: Comment): Edge<Comment> => ({
  node: { ...comment, children: { edges: [], pageInfo: null } },
});

export function CommentMarkdownInput({
  postId,
  sourceId,
  parentCommentId,
  initialContent,
  replyTo,
  editCommentId,
  className = {},
  onCommented,
}: CommentMarkdownInputProps): ReactElement {
  const client = useQueryClient();
  const markdownRef = useRef<MarkdownRef>();
  const key = useMemo(
    () =>
      [
        'post_comments_mutations',
        postId,
        sourceId,
        editCommentId,
        parentCommentId,
      ].filter((value) => !!value),
    [postId, sourceId, editCommentId, parentCommentId],
  );
  const { requestMethod, isCompanion } = useRequestProtocol();
  const onSuccess = (comment: Comment) => {
    if (!comment) return;

    const comments = ['post_comments', postId];
    client.setQueryData<PostCommentsData>(comments, (data) => {
      const copy = { ...data };

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
      const { post } = client.getQueryData<PostData>(getPostByIdKey(postId));
      updatePostCache(client, postId, {
        numComments: post.numComments + 1,
      });
    }

    if (onCommented) onCommented(comment, !editCommentId);
  };

  const mutation = parentCommentId
    ? COMMENT_ON_COMMENT_MUTATION
    : COMMENT_ON_POST_MUTATION;
  const { mutateAsync: onComment, isLoading: isCommenting } = useMutation(
    (variables: SubmitComment) =>
      requestMethod(graphqlUrl, mutation, variables, {
        requestKey: JSON.stringify(key),
      }),
    {
      onSuccess: (data) => onSuccess(data.comment),
    },
  );

  useBackgroundRequest(key, {
    enabled: isCompanion,
    callback: ({ res }) => onSuccess(res.comment),
  });

  const { mutateAsync: editComment, isLoading: isEditing } = useMutation(
    (variables: SubmitComment) =>
      requestMethod(graphqlUrl, EDIT_COMMENT_MUTATION, variables, {
        requestKey: JSON.stringify(key),
      }),
    { onSuccess: (data) => onSuccess(data.comment) },
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const { content } = formToJson(e.currentTarget);

    if (editCommentId) {
      return editComment({ id: editCommentId, content });
    }

    return onComment({ content, id: parentCommentId ?? postId });
  };

  useEffect(() => {
    markdownRef?.current?.textareaRef?.current?.focus();
  }, []);

  return (
    <form action="#" onSubmit={onSubmit} className={className?.container}>
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
        initialContent={initialContent}
        textareaProps={{
          name: 'content',
          rows: 7,
          placeholder: 'Share your thoughts',
        }}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        submitCopy={editCommentId ? 'Update' : 'Comment'}
        timeline={
          replyTo ? (
            <span className="py-2 pl-12 typo-caption1 text-theme-label-tertiary">
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
