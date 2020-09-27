import React, { ReactElement, useEffect, useRef } from 'react';
import {
  getLayout as getProfileLayout,
  getServerSideProps as getProfileServerSideProps,
  ProfileLayoutProps,
} from '../../components/ProfileLayout';
import { useQuery } from '@apollo/client';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import styled from 'styled-components';
import { size1, size2, size3, size4, size6, sizeN } from '../../styles/sizes';
import UpvoteIcon from '../../icons/upvote.svg';
import { typoLil1, typoLil2, typoMicro2 } from '../../styles/typography';
import { format } from 'date-fns';
import { useInView } from 'react-intersection-observer';

export const getServerSideProps = getProfileServerSideProps;

const Container = styled.ul`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;

  li {
    list-style: none;
    min-height: ${sizeN(22)};
    content-visibility: auto;
  }
`;

const CommentContainer = styled.article`
  display: flex;
  flex-direction: row;
  padding: ${size3} 0;
  align-items: flex-start;
`;

const CommentUpvotes = styled.div`
  display: flex;
  width: ${sizeN(12)};
  flex-direction: column;
  align-items: center;
  padding: ${size2} 0;
  color: var(--theme-primary);
  background: var(--theme-background-highlight);
  border-radius: ${size3};
  ${typoLil2}

  .icon {
    font-size: ${size6};
    margin-bottom: ${size1};
  }
`;

const CommentInfo = styled.a`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: ${size4};
  text-decoration: none;
`;

const CommentContent = styled.p`
  padding: 0;
  margin: 0;
  color: var(--theme-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoLil1}
`;

const CommentTime = styled.time`
  margin-top: ${size2};
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const InfiniteScrollTrigger = styled.div`
  position: absolute;
  bottom: 100vh;
  left: 0;
  height: 1px;
  width: 1px;
  opacity: 0;
  pointer-events: none;
`;

const EmptyMessage = styled.span`
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const rootRef = useRef<HTMLUListElement>(null);
  const { data: comments, loading, fetchMore } = useQuery<UserCommentsData>(
    USER_COMMENTS_QUERY,
    {
      variables: { userId: profile.id, first: 30 },
      skip: !profile,
    },
  );

  const { ref: infiniteScrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });

  useEffect(() => {
    if (inView && !loading && comments?.userComments.pageInfo.hasNextPage) {
      fetchMore({
        variables: { after: comments?.userComments.pageInfo.endCursor },
      });
    }
  }, [inView, loading]);

  return (
    <Container ref={rootRef}>
      {!loading && !comments?.userComments.edges.length && (
        <EmptyMessage data-testid="empty">
          {'//TODO: write comments'}
        </EmptyMessage>
      )}
      {comments?.userComments.edges.map(({ node: comment }) => (
        <li key={comment.id}>
          <CommentContainer>
            <CommentUpvotes>
              <UpvoteIcon />
              {comment.numUpvotes}
            </CommentUpvotes>
            <CommentInfo href={comment.permalink}>
              <CommentContent>{comment.content}</CommentContent>
              <CommentTime dateTime={comment.createdAt}>
                {format(new Date(comment.createdAt), 'MMM d, y')}
              </CommentTime>
            </CommentInfo>
          </CommentContainer>
        </li>
      ))}
      <InfiniteScrollTrigger ref={infiniteScrollRef} />
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
