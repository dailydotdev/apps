import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../AuthContext';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import TrashIcon from '../../icons/trash.svg';
import styled from 'styled-components';
import { size7 } from '../../styles/sizes';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import { useMutation, useQueryClient } from 'react-query';
import { Roles } from '../../lib/user';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import QuandaryButton from '../buttons/QuandaryButton';
import TertiaryButton from '../buttons/TertiaryButton';

export interface Props {
  comment: Comment;
  parentId: string | null;
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
}

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export default function CommentActionButtons({
  comment,
  parentId,
  onComment,
  onDelete,
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
      } else {
        return upvoteComment();
      }
    } else {
      showLogin();
    }
  };

  return (
    <Container>
      <QuandaryButton
        id={`comment-${comment.id}-upvote-btn`}
        buttonSize="small"
        themeColor="avocado"
        pressed={upvoted}
        title="Upvote"
        onClick={toggleUpvote}
        icon={<UpvoteIcon />}
      >
        {numUpvotes > 0 ? numUpvotes : null}
      </QuandaryButton>
      <TertiaryButton
        buttonSize="small"
        title="Comment"
        onClick={() => onComment(comment, parentId)}
        icon={<CommentIcon />}
        style={{ marginLeft: size7 }}
      />
      {(user?.id === comment.author.id ||
        user?.roles?.indexOf(Roles.Moderator) > -1) && (
        <TertiaryButton
          buttonSize="small"
          title="Delete"
          onClick={() => onDelete(comment, parentId)}
          icon={<TrashIcon />}
          style={{ marginLeft: 'auto' }}
        />
      )}
    </Container>
  );
}
