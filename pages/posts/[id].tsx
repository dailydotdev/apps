import React, { ReactElement, useContext } from 'react';
import Head from 'next/head';
import { NormalizedCacheObject, useMutation, useQuery } from '@apollo/client';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getUser, LoggedUser } from '../../lib/user';
import styled from 'styled-components';
import { size05, size1, size2, size4, size6 } from '../../styles/sizes';
import { typoLil1, typoLil2Base, typoSmall } from '../../styles/typography';
import { postDateFormat } from '../../lib/dateFormat';
import { FloatButton, IconButton } from '../../components/Buttons';
import OpenLinkIcon from '../../icons/open_link.svg';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import ShareIcon from '../../icons/share.svg';
import LazyImage from '../../components/LazyImage';
import {
  CANCEL_UPVOTE_MUTATION,
  CancelUpvoteData,
  POST_BY_ID_QUERY,
  PostData,
  updatePostUpvoteCache,
  UPVOTE_MUTATION,
  UpvoteData,
} from '../../graphql/posts';
import { RoundedImage } from '../../components/utilities';
import MainLayout from '../../components/MainLayout';
import AuthContext from '../../components/AuthContext';
import MainComment from '../../components/MainComment';
import { POST_COMMENTS_QUERY, PostCommentsData } from '../../graphql/comments';
import { mobileM } from '../../styles/media';

export interface Props {
  id: string;
  initialApolloState: NormalizedCacheObject;
  user: LoggedUser;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

export async function getServerSideProps({
  params,
  req,
  res,
}: GetServerSidePropsContext<PostParams>): Promise<
  GetServerSidePropsResult<Props>
> {
  const { id } = params;
  const apolloClient = initializeApollo({ req });

  const [, , userRes] = await Promise.all([
    apolloClient.query({
      query: POST_BY_ID_QUERY,
      variables: {
        id,
      },
    }),
    apolloClient.query({
      query: POST_COMMENTS_QUERY,
      variables: {
        postId: id,
      },
    }),
    getUser({ req, res }),
  ]);

  return {
    props: {
      id,
      initialApolloState: apolloClient.cache.extract(),
      user: userRes.isLoggedIn ? (userRes.user as LoggedUser) : null,
    },
  };
}

const PostContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: ${size6} ${size4};
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${size2};
`;

const PostInfoSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 ${size2};
`;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const Metadata = styled.span`
  color: var(--theme-disabled);
  ${typoSmall}
`;

const MetadataSeparator = styled.div`
  width: ${size05};
  height: ${size05};
  margin: 0 ${size1};
  background: var(--theme-disabled);
  border-radius: 100%;
`;

const SourceName = styled.div`
  ${typoLil2Base}
`;

const Title = styled.h1`
  margin: ${size2} 0;
  ${typoLil1}
`;

const Tags = styled.div`
  margin-bottom: ${size4};
  color: var(--theme-disabled);
  text-transform: uppercase;
  ${typoSmall};
`;

const PostImage = styled(LazyImage)`
  margin: ${size2} 0;
  border-radius: ${size4};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${size4};
  border-bottom: 0.063rem solid var(--theme-separator);

  ${FloatButton} {
    .icon {
      margin-right: -${size1};

      ${mobileM} {
        margin-right: ${size2};
      }
    }

    span {
      display: none;

      ${mobileM} {
        display: inline-block;
      }
    }
  }
`;

export default function PostPage({ id }: Props): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  const { data: postById } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  const { data: comments } = useQuery<PostCommentsData>(POST_COMMENTS_QUERY, {
    variables: { postId: id },
  });

  const [upvotePost] = useMutation<UpvoteData>(UPVOTE_MUTATION, {
    variables: { id },
    optimisticResponse: { upvote: { _: true } },
    update(cache) {
      return updatePostUpvoteCache(cache, id, true);
    },
  });

  const [cancelPostUpvote] = useMutation<CancelUpvoteData>(
    CANCEL_UPVOTE_MUTATION,
    {
      variables: { id },
      optimisticResponse: { cancelUpvote: { _: true } },
      update(cache) {
        return updatePostUpvoteCache(cache, id, false);
      },
    },
  );

  const toggleUpvote = () => {
    if (user) {
      // TODO: add GA tracking
      if (postById?.post.upvoted) {
        return cancelPostUpvote();
      } else if (postById) {
        return upvotePost();
      }
    } else {
      showLogin();
    }
  };

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        // TODO: add GA tracking
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <MainLayout>
      <PostContainer>
        {postById && (
          <Head>
            <title>{postById?.post.title}</title>
          </Head>
        )}
        <PostInfo>
          <RoundedImage
            imgSrc={postById?.post.source.image}
            imgAlt={postById?.post.source.name}
            background="var(--theme-background-highlight)"
            ratio="100%"
          />
          <PostInfoSubContainer>
            <SourceName>{postById?.post.source.name}</SourceName>
            <MetadataContainer>
              <Metadata>
                {postById && postDateFormat(postById.post.createdAt)}
              </Metadata>
              {postById?.post.readTime && <MetadataSeparator />}
              {postById?.post.readTime && (
                <Metadata data-testid="readTime">
                  {postById?.post.readTime}m read time
                </Metadata>
              )}
            </MetadataContainer>
          </PostInfoSubContainer>
          <IconButton
            as="a"
            href={postById?.post.permalink}
            title="Go to article"
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenLinkIcon />
          </IconButton>
        </PostInfo>
        <Title>{postById?.post.title}</Title>
        <Tags>{postById?.post.tags.map((t) => `#${t}`).join(' ')}</Tags>
        <PostImage
          imgSrc={postById?.post.image}
          imgAlt="Post cover image"
          lowsrc={postById?.post.placeholder}
          ratio="49%"
        />
        <ActionButtons>
          <FloatButton
            done={postById?.post.upvoted}
            onClick={toggleUpvote}
            title="Upvote"
          >
            <UpvoteIcon />
            <span>Upvote</span>
          </FloatButton>
          <FloatButton done={postById?.post.commented} title="Comment">
            <CommentIcon />
            <span>Comment</span>
          </FloatButton>
          <FloatButton onClick={sharePost} title="Share">
            <ShareIcon />
            <span>Share</span>
          </FloatButton>
        </ActionButtons>
        {comments?.postComments.edges.map((e) => (
          <MainComment comment={e.node} key={e.node.id} />
        ))}
      </PostContainer>
    </MainLayout>
  );
}
