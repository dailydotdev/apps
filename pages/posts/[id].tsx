import React, { ReactElement } from 'react';
import Head from 'next/head';
import { gql, NormalizedCacheObject, useQuery } from '@apollo/client';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';

interface Post {
  id: string;
  title: string;
  permalink: string;
  image: string;
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
    }
  }
`;

interface PostProps {
  id: string;
  initialApolloState: NormalizedCacheObject;
}

export default function Post({ id }: PostProps): ReactElement {
  const { data } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  return (
    <div>
      <Head>
        <title>{data && data.post.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <img src={data && data.post.image} alt="Post image" />
    </div>
  );
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext<PostParams>): Promise<
  GetServerSidePropsResult<PostProps>
> {
  const { id } = params;
  const apolloClient = initializeApollo({ req });

  await apolloClient.query({
    query: POST_BY_ID_QUERY,
    variables: {
      id,
    },
  });

  return {
    props: {
      id,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
