import React, { ReactElement } from 'react';
import Head from 'next/head';
import { gql, NormalizedCacheObject, useQuery } from '@apollo/client';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { AnonymousUser, getUser, LoggedUser } from '../../lib/user';
import styled from 'styled-components';
import { size05, size1, size10, size2, size4, size6 } from '../../styles/sizes';
import { typoLil2Base, typoSmall } from '../../styles/typography';
import publishDateFormat from '../../lib/publishDateFormat';
import { IconButton } from '../../components/Buttons';
import OpenLinkIcon from '../../icons/open_link.svg';
import LazyImage from '../../components/LazyImage';

interface Source {
  name: string;
  image: string;
}

interface Post {
  id: string;
  title: string;
  permalink: string;
  image: string;
  createdAt: Date;
  readTime?: number;
  tags?: string[];
  source: Source;
}

interface PostData {
  post: Post;
}

export const POST_BY_ID_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      permalink
      image
      createdAt
      readTime
      tags
      source {
        name
        image
      }
    }
  }
`;

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
  padding: ${size6} ${size4};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
`;

const SourceImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
`;

const HeaderSubContainer = styled.div`
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

export default function Post({ id }: Props): ReactElement {
  const { data } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  return (
    <Container>
      {data && (
        <Head>
          <title>{data?.post.title}</title>
        </Head>
      )}
      <Header>
        <SourceImage
          src={data?.post.source.image}
          alt={data?.post.source.name}
          background="var(--theme-background-highlight)"
        />
        <HeaderSubContainer>
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
        </HeaderSubContainer>
        <IconButton
          as="a"
          href={data && data.post.permalink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <OpenLinkIcon />
        </IconButton>
      </Header>
    </Container>
  );
}
