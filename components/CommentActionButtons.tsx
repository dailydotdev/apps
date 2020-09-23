import React, { ReactElement, useContext } from 'react';
import AuthContext from './AuthContext';
import { FloatButton, IconButton } from './Buttons';
import UpvoteIcon from '../icons/upvote.svg';
import CommentIcon from '../icons/comment.svg';
import TrashIcon from '../icons/trash.svg';
import styled from 'styled-components';
import { size1, size2, size7 } from '../styles/sizes';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  CancelCommentUpvoteData,
  Comment,
  updateCommentUpvoteCache,
  UPVOTE_COMMENT_MUTATION,
  UpvoteCommentData,
} from '../graphql/comments';
import { useMutation } from '@apollo/client';
import { Roles } from '../lib/user';

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

  const [upvoteComment] = useMutation<UpvoteCommentData>(
    UPVOTE_COMMENT_MUTATION,
    {
      variables: { id: comment.id },
      optimisticResponse: { upvoteComment: { _: true } },
      update(cache) {
        return updateCommentUpvoteCache(
          cache,
          comment.id,
          true,
          comment.numUpvotes + 1,
        );
      },
    },
  );

  const [cancelCommentUpvote] = useMutation<CancelCommentUpvoteData>(
    CANCEL_COMMENT_UPVOTE_MUTATION,
    {
      variables: { id: comment.id },
      optimisticResponse: { cancelCommentUpvote: { _: true } },
      update(cache) {
        return updateCommentUpvoteCache(
          cache,
          comment.id,
          false,
          comment.numUpvotes - 1,
        );
      },
    },
  );

  const toggleUpvote = () => {
    if (user) {
      // TODO: add GA tracking
      if (comment.upvoted) {
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
      <UpvoteButton
        done={comment.upvoted}
        title="Upvote"
        onClick={toggleUpvote}
      >
        <UpvoteIcon />
        {comment.numUpvotes > 0 && <span>{comment.numUpvotes}</span>}
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
