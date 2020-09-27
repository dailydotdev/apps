import React, { ReactElement } from 'react';
import { Comment } from '../graphql/comments';
import styled from 'styled-components';
import { size1, size2, size4, size8 } from '../styles/sizes';
import { CommentAuthor, CommentBox, CommentPublishDate } from './utilities';
import { commentDateFormat } from '../lib/dateFormat';
import CommentActionButtons from './CommentActionButtons';
import { ProfileLink } from './ProfileLink';

export interface Props {
  comment: Comment;
  firstComment: boolean;
  parentId: string;
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
}

const Container = styled.article`
  display: flex;
  align-items: stretch;
  margin-top: ${size4};
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const SmallProfileLink = styled(ProfileLink)`
  width: ${size8};
  height: ${size8};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  margin-left: ${size2};
`;

const Content = styled.div`
  margin-top: ${size2};
`;

const Timeline = styled.div<{ firstComment: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${(props) => (props.firstComment ? '0' : `-${size4}`)};
  bottom: 0;
  width: 0.063rem;
  margin: 0 auto;
  background: var(--theme-separator);
`;

const SubCommentBox = styled(CommentBox)`
  margin-bottom: ${size1};
`;

export default function SubComment({
  comment,
  firstComment,
  onComment,
  parentId,
  onDelete,
}: Props): ReactElement {
  return (
    <Container data-testid="subcomment">
      <ProfileContainer>
        <Timeline data-testid="timeline" firstComment={firstComment} />
        <SmallProfileLink user={comment.author} />
      </ProfileContainer>
      <ContentContainer>
        <SubCommentBox>
          <CommentAuthor>{comment.author.name}</CommentAuthor>
          <CommentPublishDate dateTime={comment.createdAt}>
            {commentDateFormat(comment.createdAt)}
          </CommentPublishDate>
          <Content>{comment.content}</Content>
        </SubCommentBox>
        <CommentActionButtons
          comment={comment}
          parentId={parentId}
          onComment={onComment}
          onDelete={onDelete}
        />
      </ContentContainer>
    </Container>
  );
}
