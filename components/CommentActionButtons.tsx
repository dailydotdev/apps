import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { FloatButton, IconButton } from './Buttons';
import UpvoteIcon from '../icons/upvote.svg';
import CommentIcon from '../icons/comment.svg';
import TrashIcon from '../icons/trash.svg';
import styled from 'styled-components';
import { size1, size2, size7 } from '../styles/sizes';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../graphql/comments';
import { useMutation } from 'react-query';
import { Roles } from '../lib/user';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';

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

const CommentButton = styled(IconButton)`
  margin-left: ${size7};
`;

const TrashButton = styled(IconButton)`
  margin-left: auto;
`;

const UpvoteButton = styled(FloatButton).attrs({ size: 'small' })`
  padding: ${size1};
  border-radius: ${size2};

  .icon {
    margin: 0;
  }

  span {
    margin-left: ${size1};
  }
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

  useEffect(() => {
    setUpvoted(comment.upvoted);
    setNumUpvotes(comment.numUpvotes);
  }, [comment]);

  const [upvoteComment] = useMutation(
    () =>
      request(`${apiUrl}/graphql`, UPVOTE_COMMENT_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: () => {
        setUpvoted(true);
        setNumUpvotes(comment.numUpvotes + 1);
        return () => {
          setUpvoted(comment.upvoted);
          setNumUpvotes(comment.numUpvotes);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const [cancelCommentUpvote] = useMutation(
    () =>
      request(`${apiUrl}/graphql`, CANCEL_COMMENT_UPVOTE_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: () => {
        setUpvoted(false);
        setNumUpvotes(comment.numUpvotes - 1);
        return () => {
          setUpvoted(comment.upvoted);
          setNumUpvotes(comment.numUpvotes);
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
      <UpvoteButton done={upvoted} title="Upvote" onClick={toggleUpvote}>
        <UpvoteIcon />
        {numUpvotes > 0 && <span>{numUpvotes}</span>}
      </UpvoteButton>
      <CommentButton
        size="small"
        title="Comment"
        onClick={() => onComment(comment, parentId)}
      >
        <CommentIcon />
      </CommentButton>
      {(user?.id === comment.author.id ||
        user?.roles?.indexOf(Roles.Moderator) > -1) && (
        <TrashButton
          size="small"
          title="Delete"
          onClick={() => onDelete(comment, parentId)}
        >
          <TrashIcon />
        </TrashButton>
      )}
    </Container>
  );
}
