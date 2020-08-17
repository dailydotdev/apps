import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { Comment } from '../graphql/comments';
import {
  CommentBox,
  CommentAuthor,
  CommentPublishDate,
  RoundedImage,
} from './utilities';
import { commentDateFormat } from '../lib/dateFormat';
import { size2, size4 } from '../styles/sizes';
import CommentActionButtons from './CommentActionButtons';
import SubComment from './SubComment';

export interface Props {
  comment: Comment;
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
}

const Container = styled.article`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: ${size4};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${size2};
`;

const MainCommentBox = styled(CommentBox)`
  margin: ${size2} 0;
`;

export default function MainComment({
  comment,
  onComment,
  onDelete,
}: Props): ReactElement {
  return (
    <Container data-testid="comment">
      <Header>
        <RoundedImage
          imgSrc={comment.author.image}
          imgAlt={`${comment.author.name}'s profile image`}
          background="var(--theme-background-highlight)"
        />
        <Metadata>
          <CommentAuthor>{comment.author.name}</CommentAuthor>
          <CommentPublishDate dateTime={comment.createdAt}>
            {commentDateFormat(comment.createdAt)}
          </CommentPublishDate>
        </Metadata>
      </Header>
      <MainCommentBox>{comment.content}</MainCommentBox>
      <CommentActionButtons
        comment={comment}
        parentId={comment.id}
        onComment={onComment}
        onDelete={onDelete}
      />
      {comment.children?.edges.map((e, i) => (
        <SubComment
          comment={e.node}
          key={e.node.id}
          firstComment={!i}
          parentId={comment.id}
          onComment={onComment}
          onDelete={onDelete}
        />
      ))}
    </Container>
  );
}
