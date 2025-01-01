import type { ReactElement } from 'react';
import React from 'react';
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
}

function SubComment({
  comment,
  parentComment,
  className,
  onCommented,
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
          className={{ container: 'relative', content: 'ml-14' }}
          onComment={(selected, parent) =>
            onReplyTo({
              username: comment.author.username,
              parentCommentId: parent,
              commentId: selected.id,
            })
          }
        >
          <div
            className="absolute bottom-0 left-9 top-0 -ml-px w-0.5 bg-surface-float"
            data-testid="subcomment"
          />
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
