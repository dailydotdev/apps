import React, { ReactElement, useContext } from 'react';
import UserContext from './UserContext';
import { IconButton } from './Buttons';
import UpvoteIcon from '../icons/upvote.svg';
import CommentIcon from '../icons/comment.svg';
import MenuIcon from '../icons/menu.svg';
import styled from 'styled-components';
import { size10 } from '../styles/sizes';
import { Comment } from '../graphql/comments';

export interface Props {
  comment: Comment;
}

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const CommentButton = styled(IconButton)`
  margin-left: ${size10};
`;

const MenuButton = styled(IconButton)`
  margin-left: auto;

  .icon {
    transform: rotate(90deg);
  }
`;

export default function CommentActionButtons({ comment }: Props): ReactElement {
  const user = useContext(UserContext);

  return (
    <Container>
      <IconButton size="small" done={comment.upvoted} title="Upvote">
        <UpvoteIcon />
      </IconButton>
      <CommentButton size="small" title="Comment">
        <CommentIcon />
      </CommentButton>
      {user?.id === comment.author.id && (
        <MenuButton size="small" title="Open menu">
          <MenuIcon />
        </MenuButton>
      )}
    </Container>
  );
}
