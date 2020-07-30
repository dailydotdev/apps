import Head from 'next/head';
import {gql, useQuery} from '@apollo/client';
import {initializeApollo} from '../../lib/apolloClient';

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

export default function Posts({id}) {
  const {data} = useQuery<PostData>(
    POST_BY_ID_QUERY,
    {
      variables: {id},
    },
  );

  return (
    <div>
      <Head>
        <title>{data && data.post.title}</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <img src={data && data.post.image} alt="Post image"/>
    </div>
  );
}

export async function getServerSideProps({params}) {
  const {id} = params;
  const apolloClient = initializeApollo();

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
