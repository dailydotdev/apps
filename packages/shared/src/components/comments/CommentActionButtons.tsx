import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import AuthContext from '../../contexts/AuthContext';
import UpvoteIcon from '../../../icons/upvote.svg';
import CommentIcon from '../../../icons/comment.svg';
import TrashIcon from '../../../icons/trash.svg';
import EditIcon from '../../../icons/edit.svg';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import { Roles } from '../../lib/user';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { getTooltipProps } from '../../lib/tooltip';
import { ClickableText } from '../buttons/ClickableText';

export interface CommentActionProps {
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
  onEdit: (comment: Comment, parentComment?: Comment) => void;
  onShowUpvotes: (commentId: string, upvotes: number) => void;
}

export interface Props extends CommentActionProps {
  comment: Comment;
  parentId: string | null;
}

export default function CommentActionButtons({
  comment,
  parentId,
  onComment,
  onDelete,
  onEdit,
  onShowUpvotes,
}: Props): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  const [upvoted, setUpvoted] = useState(comment.upvoted);
  const [numUpvotes, setNumUpvotes] = useState(comment.numUpvotes);

  const queryClient = useQueryClient();

  useEffect(() => {
    setUpvoted(comment.upvoted);
    setNumUpvotes(comment.numUpvotes);
  }, [comment]);

  const { mutateAsync: upvoteComment } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, UPVOTE_COMMENT_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('post_comments');
        setUpvoted(true);
        setNumUpvotes(numUpvotes + 1);
        return () => {
          setUpvoted(upvoted);
          setNumUpvotes(numUpvotes);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: cancelCommentUpvote } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, CANCEL_COMMENT_UPVOTE_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('post_comments');
        setUpvoted(false);
        setNumUpvotes(numUpvotes - 1);
        return () => {
          setUpvoted(upvoted);
          setNumUpvotes(numUpvotes);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const toggleUpvote = () => {
    if (user) {
      // TODO: add GA tracking
      if (upvoted) {
        return cancelCommentUpvote();
      }
      return upvoteComment();
    }
    showLogin('comment upvote');
    return undefined;
  };

  return (
    <div className="flex flex-row items-center">
      <Button
        id={`comment-${comment.id}-upvote-btn`}
        buttonSize="small"
        pressed={upvoted}
        {...getTooltipProps('Upvote')}
        onClick={toggleUpvote}
        icon={<UpvoteIcon />}
        className="btn-tertiary-avocado mr-3"
      />
      <Button
        buttonSize="small"
        {...getTooltipProps('Comment')}
        onClick={() => onComment(comment, parentId)}
        icon={<CommentIcon />}
        className="btn-tertiary-avocado mr-3"
      />
      {user?.id === comment.author.id && (
        <Button
          buttonSize="small"
          {...getTooltipProps('Edit')}
          onClick={() => onEdit(comment)}
          icon={<EditIcon />}
          className="btn-tertiary mr-3"
        />
      )}
      {(user?.id === comment.author.id ||
        user?.roles?.indexOf(Roles.Moderator) > -1) && (
        <Button
          buttonSize="small"
          {...getTooltipProps('Delete')}
          onClick={() => onDelete(comment, parentId)}
          icon={<TrashIcon />}
          className="btn-tertiary"
        />
      )}
      {comment.numUpvotes > 0 && (
        <ClickableText
          className="ml-auto"
          {...getTooltipProps('See who upvoted')}
          title={`${comment.numUpvotes} upvote${
            comment.numUpvotes === 1 ? '' : 's'
          }`}
          onClick={() => onShowUpvotes(comment.id, comment.numUpvotes)}
        />
      )}
    </div>
  );
}
