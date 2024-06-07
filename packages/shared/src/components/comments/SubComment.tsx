import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { useEditCommentProps } from '../../hooks/post/useEditCommentProps';
import CommentInputOrModal from './CommentInputOrModal';

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
