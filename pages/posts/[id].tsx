import React, { ReactElement } from 'react';
import Head from 'next/head';
import { NormalizedCacheObject, useMutation, useQuery } from '@apollo/client';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { AnonymousUser, getUser, LoggedUser } from '../../lib/user';
import styled from 'styled-components';
import { size05, size1, size10, size2, size4, size6 } from '../../styles/sizes';
import { typoLil1, typoLil2Base, typoSmall } from '../../styles/typography';
import publishDateFormat from '../../lib/publishDateFormat';
import { FloatButton, IconButton } from '../../components/Buttons';
import OpenLinkIcon from '../../icons/open_link.svg';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import ShareIcon from '../../icons/share.svg';
import LazyImage from '../../components/LazyImage';
import {
  CANCEL_UPVOTE_MUTATION,
  POST_BY_ID_QUERY,
  PostData,
  updatePostCache,
  UPVOTE_MUTATION,
  UpvoteData,
} from '../../graphql/posts';

export interface Props {
  id: string;
  initialApolloState: NormalizedCacheObject;
  user: AnonymousUser | LoggedUser;
  isLoggedIn: boolean;
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

  const [, userRes] = await Promise.all([
    apolloClient.query({
      query: POST_BY_ID_QUERY,
      variables: {
        id,
      },
    }),
    getUser({ req, res }),
  ]);

  return {
    props: {
      id,
      initialApolloState: apolloClient.cache.extract(),
      user: userRes.user,
      isLoggedIn: userRes.isLoggedIn,
    },
  };
}

const Container = styled.div`
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

const SourceImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
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
`;

export default function PostPage({ id, isLoggedIn }: Props): ReactElement {
  const { data } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  const [upvotePost] = useMutation<UpvoteData>(UPVOTE_MUTATION, {
    variables: { id },
    optimisticResponse: { upvote: { _: true } },
    update(cache) {
      return updatePostCache(cache, id, { upvoted: true });
    },
  });

  const [cancelPostUpvote] = useMutation<UpvoteData>(CANCEL_UPVOTE_MUTATION, {
    variables: { id },
    optimisticResponse: { upvote: { _: true } },
    update(cache) {
      return updatePostCache(cache, id, { upvoted: false });
    },
  });

  const toggleUpvote = () => {
    if (isLoggedIn) {
      // TODO: add GA tracking
      if (data?.post.upvoted) {
        return cancelPostUpvote();
      } else if (data) {
        return upvotePost();
      }
    } else {
      // TODO: open login
    }
  };

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: data.post.title,
          url: window.location.href,
        });
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <Container>
      {data && (
        <Head>
          <title>{data?.post.title}</title>
        </Head>
      )}
      <PostInfo>
        <SourceImage
          src={data?.post.source.image}
          alt={data?.post.source.name}
          background="var(--theme-background-highlight)"
        />
        <PostInfoSubContainer>
          <SourceName>{data?.post.source.name}</SourceName>
          <MetadataContainer>
            <Metadata>
              {data && publishDateFormat(data.post.createdAt)}
            </Metadata>
            {data?.post.readTime && <MetadataSeparator />}
            {data?.post.readTime && (
              <Metadata data-testid="readTime">
                {data?.post.readTime}m read time
              </Metadata>
            )}
          </MetadataContainer>
        </PostInfoSubContainer>
        <IconButton
          as="a"
          href={data && data.post.permalink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <OpenLinkIcon />
        </IconButton>
      </PostInfo>
      <Title>{data?.post.title}</Title>
      <Tags>{data?.post.tags.map((t) => `#${t}`).join(' ')}</Tags>
      <PostImage
        src={data?.post.image}
        alt="Post cover image"
        lowsrc={data?.post.placeholder}
        ratio="49%"
      />
      <ActionButtons>
        <FloatButton done={data?.post.upvoted} onClick={toggleUpvote}>
          <UpvoteIcon />
          Upvote
        </FloatButton>
        <FloatButton done={data?.post.commented}>
          <CommentIcon />
          Comment
        </FloatButton>
        <FloatButton onClick={sharePost}>
          <ShareIcon />
          Share
        </FloatButton>
      </ActionButtons>
    </Container>
  );
}
