import React, { ReactElement } from 'react';
import Head from 'next/head';
import { gql, NormalizedCacheObject, useQuery } from '@apollo/client';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { AnonymousUser, getUser, LoggedUser } from '../../lib/user';
import GlobalStyle from '../../components/GlobalStyle';

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

export interface Props {
  id: string;
  initialApolloState: NormalizedCacheObject;
  user: AnonymousUser | LoggedUser;
  isLoggedIn: boolean;
}

export default function Post({ id, user, isLoggedIn }: Props): ReactElement {
  const { data } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  return (
    <div>
      <Head>
        <title>{data && data.post.title}</title>
      </Head>
      <GlobalStyle />

      <img src={data && data.post.image} alt="Post image" />
      <div>{isLoggedIn.toString()}</div>
      <div>{user.id}</div>
    </div>
  );
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
