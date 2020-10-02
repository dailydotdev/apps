import React, { ReactElement, useEffect, useRef, Fragment } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from 'react-query';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import styled from 'styled-components';
import { size1, size2, size3, size4, size6, sizeN } from '../../styles/sizes';
import UpvoteIcon from '../../icons/upvote.svg';
import { typoLil1, typoLil2, typoMicro2 } from '../../styles/typography';
import { format } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.ul`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;

  li {
    list-style: none;
    min-height: ${sizeN(22)};

    &:nth-child(n + 15) {
      content-visibility: auto;
    }
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
  const {
    data: commentsPages,
    isFetchingMore,
    canFetchMore,
    fetchMore,
  } = useInfiniteQuery<UserCommentsData>(
    ['user_comments', profile?.id],
    (key: string, userId: string, after: string) =>
      request(`${apiUrl}/graphql`, USER_COMMENTS_QUERY, {
        userId,
        first: 30,
        after,
      }),
    {
      enabled: !!profile,
      getFetchMore: (lastPage) =>
        lastPage.userComments.pageInfo.hasNextPage &&
        lastPage.userComments.pageInfo.endCursor,
    },
  );

  const { ref: infiniteScrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });

  useEffect(() => {
    if (inView && !isFetchingMore && canFetchMore) {
      fetchMore();
    }
  }, [inView, isFetchingMore]);

  return (
    <Container ref={rootRef}>
      {!isFetchingMore && !commentsPages?.[0]?.userComments.edges.length && (
        <EmptyMessage data-testid="empty">
          {'//TODO: write commentsPages'}
        </EmptyMessage>
      )}
      {commentsPages?.map((comments) => (
        <Fragment key={comments.userComments.pageInfo.endCursor}>
          {comments.userComments.edges.map(({ node: comment }) => (
            <li key={comment.id}>
              <CommentContainer>
                <CommentUpvotes>
                  <UpvoteIcon />
                  {comment.numUpvotes}
                </CommentUpvotes>
                <Link href={comment.permalink} passHref>
                  <CommentInfo>
                    <CommentContent>{comment.content}</CommentContent>
                    <CommentTime dateTime={comment.createdAt}>
                      {format(new Date(comment.createdAt), 'MMM d, y')}
                    </CommentTime>
                  </CommentInfo>
                </Link>
              </CommentContainer>
            </li>
          ))}
        </Fragment>
      ))}
      <InfiniteScrollTrigger ref={infiniteScrollRef} />
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
