import React, { ReactElement, useContext } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import styled from 'styled-components';
import {
  size1,
  size2,
  size3,
  size4,
  size5,
  size6,
  size8,
  sizeN,
} from '../../styles/sizes';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import EyeIcon from '../../icons/eye.svg';
import {
  typoLil1,
  typoLil2,
  typoMicro2,
  typoNuggets,
} from '../../styles/typography';
import { format } from 'date-fns';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { USER_STATS, UserStatsData } from '../../graphql/users';
import { multilineTextOverflow } from '../../styles/helpers';
import ActivitySection from '../../components/profile/ActivitySection';
import { AUTHOR_FEED_QUERY, AuthorFeedData } from '../../graphql/posts';
import LazyImage from '../../components/LazyImage';
import { largeNumberFormat } from '../../lib/numberFormat';
import AuthContext from '../../components/AuthContext';
import { tablet } from '../../styles/media';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
`;

const CommentContainer = styled.article`
  display: flex;
  flex-direction: row;
  padding: ${size3} 0;
  align-items: flex-start;

  ${tablet} {
    align-items: center;
  }
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

  ${tablet} {
    width: ${sizeN(20)};
    justify-content: center;
    flex-direction: row;

    .icon {
      margin-bottom: 0;
      margin-right: ${size1};
    }
  }
`;

const CommentInfo = styled.a`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: ${size4};
  text-decoration: none;

  ${tablet} {
    flex-direction: row;
    align-items: center;
  }
`;

const CommentContent = styled.p`
  max-height: ${sizeN(15)};
  padding: 0;
  margin: 0;
  color: var(--theme-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoLil1}
  ${multilineTextOverflow}
  -webkit-line-clamp: 3;

  ${tablet} {
    flex: 1;
    margin-right: ${size6};
  }
`;

const CommentTime = styled.time`
  margin-top: ${size2};
  color: var(--theme-secondary);
  ${typoMicro2}

  ${tablet} {
    margin-top: 0;
  }
`;

const EmptyMessage = styled.span`
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const PostContainer = styled(CommentContainer)`
  padding-left: ${size3};
  text-decoration: none;
`;

const PostImageContainer = styled.div`
  position: relative;
`;

const PostImage = styled(LazyImage)`
  width: ${sizeN(18)};
  height: ${sizeN(18)};
  border-radius: ${size4};

  ${tablet} {
    width: ${sizeN(24)};
    height: ${sizeN(16)};
  }
`;

const SourceImage = styled(LazyImage).attrs({ ratio: '100%' })`
  position: absolute;
  top: 50%;
  left: 0;
  width: ${size8};
  border: ${size1} solid var(--theme-background-primary);
  border-radius: 100%;
  transform: translate(-50%, -50%);
`;

const PostStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, max-content);
  grid-column-gap: ${size4};
  margin-top: ${size3};

  ${tablet} {
    margin-top: 0;
  }
`;

const PostStat = styled.div`
  display: flex;
  align-items: center;
  color: var(--theme-secondary);
  ${typoNuggets}

  .icon {
    font-size: ${size5};
    margin-right: ${size1};
  }
`;

const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const { user } = useContext(AuthContext);

  const { data: userStats } = useQuery<UserStatsData>(
    ['user_stats', profile?.id],
    (key: string, userId: string) =>
      request(`${apiUrl}/graphql`, USER_STATS, {
        id: userId,
      }),
    {
      enabled: !!profile,
    },
  );

  const comments = useInfiniteQuery<UserCommentsData>(
    ['user_comments', profile?.id],
    (key: string, userId: string, after: string) =>
      request(`${apiUrl}/graphql`, USER_COMMENTS_QUERY, {
        userId,
        first: 3,
        after,
      }),
    {
      enabled: !!profile,
      getFetchMore: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const posts = useInfiniteQuery<AuthorFeedData>(
    ['user_posts', profile?.id],
    (key: string, userId: string, after: string) =>
      request(`${apiUrl}/graphql`, AUTHOR_FEED_QUERY, {
        userId,
        first: 3,
        after,
      }),
    {
      enabled: !!profile,
      getFetchMore: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const isSameUser = profile?.id === user?.id;

  const commentsSection = (
    <ActivitySection
      title={`${isSameUser ? 'Your' : 'Newest'} Comments`}
      query={comments}
      count={userStats?.userStats?.numComments}
      emptyScreen={
        <EmptyMessage data-testid="emptyComments">
          {isSameUser ? `You didn't comment yet.` : 'No comments yet.'}
        </EmptyMessage>
      }
      elementToNode={(comment) => (
        <CommentContainer key={comment.id}>
          <CommentUpvotes>
            <UpvoteIcon />
            {largeNumberFormat(comment.numUpvotes)}
          </CommentUpvotes>
          <Link href={comment.permalink} passHref>
            <CommentInfo aria-label={comment.content}>
              <CommentContent>{comment.content}</CommentContent>
              <CommentTime dateTime={comment.createdAt}>
                {format(new Date(comment.createdAt), 'MMM d, y')}
              </CommentTime>
            </CommentInfo>
          </Link>
        </CommentContainer>
      )}
    />
  );

  const postsSection = (
    <ActivitySection
      title={`${isSameUser ? 'Your' : 'Newest'} Posts`}
      query={posts}
      count={userStats?.userStats?.numPosts}
      emptyScreen={
        <EmptyMessage data-testid="emptyPosts">
          {'No articles yet.'}
        </EmptyMessage>
      }
      elementToNode={(post) => (
        <Link href={post.commentsPermalink} passHref key={post.id}>
          <PostContainer as="a" aria-label={post.title}>
            <PostImageContainer>
              <PostImage imgSrc={post.image} imgAlt="Post cover image" />
              <SourceImage
                imgSrc={post.source.image}
                imgAlt={post.source.name}
              />
            </PostImageContainer>
            <CommentInfo as="div">
              <CommentContent>{post.title}</CommentContent>
              <PostStats>
                {!!post.views && (
                  <PostStat>
                    <EyeIcon />
                    {largeNumberFormat(post.views)}
                  </PostStat>
                )}
                {!!post.numUpvotes && (
                  <PostStat>
                    <UpvoteIcon />
                    {largeNumberFormat(post.numUpvotes)}
                  </PostStat>
                )}
                {!!post.numComments && (
                  <PostStat>
                    <CommentIcon />
                    {largeNumberFormat(post.numComments)}
                  </PostStat>
                )}
              </PostStats>
            </CommentInfo>
          </PostContainer>
        </Link>
      )}
    />
  );

  return (
    <Container>
      {postsSection}
      {commentsSection}
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
