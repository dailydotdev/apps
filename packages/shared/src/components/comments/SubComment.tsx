import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { Comment } from '../../graphql/comments';
import type { CommentBoxProps } from './CommentBox';
import CommentBox from './CommentBox';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { useEditCommentProps } from '../../hooks/post/useEditCommentProps';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ './CommentInputOrModal'
    ),
);

export interface SubCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  parentComment: Comment;
  onCommented: CommentMarkdownInputProps['onCommented'];
  isModalThread?: boolean;
  isLast?: boolean;
}

function SubComment({
  comment,
  parentComment,
  className,
  onCommented,
  isModalThread = false,
  isLast = false,
  ...props
}: SubCommentProps): ReactElement {
  const { inputProps, commentId, onReplyTo } = useComments(props.post);
  const { inputProps: editProps, onEdit } = useEditCommentProps();

  return (
    <>
      {!editProps && (
        <CommentBox
          {...props}
          key={comment.id}
          parentId={parentComment.id}
          comment={comment}
          onEdit={({ id, lastUpdatedAt }) =>
            onEdit({
              commentId: id,
              lastUpdatedAt,
              parentCommentId: parentComment.id,
            })
          }
          className={{
            container: classNames(
              'relative',
              isModalThread &&
                'rounded-none bg-transparent px-0 py-2 hover:bg-transparent',
              isModalThread && !isLast && 'mb-1',
            ),
            content: classNames('ml-[52px]', isModalThread && 'mt-1'),
            markdown: classNames(
              isModalThread &&
                '!text-[15px] [&_p]:!text-[15px] [&_li]:!text-[15px] [&_a]:!text-[15px]',
            ),
          }}
          onComment={(selected, parent) =>
            onReplyTo({
              username: comment.author.username,
              parentCommentId: parent,
              commentId: selected.id,
            })
          }
          isModalThread={isModalThread}
        >
          {!isModalThread && (
            <div
              className="absolute bottom-0 left-9 top-0 -ml-px w-0.5 bg-surface-float"
              data-testid="subcomment"
            />
          )}
          {isModalThread && (
            <>
              {!isLast && (
                <div className="absolute left-5 top-10 -bottom-3 w-px bg-accent-pepper-subtle" />
              )}
            </>
          )}
        </CommentBox>
      )}
      {editProps && (
        <CommentInputOrModal
          {...editProps}
          post={props.post}
          onCommented={(data, isNew) => {
            onEdit(null);
            onCommented(data, isNew);
          }}
          onClose={() => onEdit(null)}
          className={{ input: className }}
        />
      )}
      {commentId === comment.id && (
        <CommentInputOrModal
          {...inputProps}
          className={{ input: className }}
          post={props.post}
          onCommented={(...params) => {
            onReplyTo(null);
            onCommented(...params);
          }}
          onClose={() => onReplyTo(null)}
          replyToCommentId={commentId}
        />
      )}
    </>
  );
}

export default SubComment;
