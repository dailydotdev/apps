import { ApolloCache, gql } from '@apollo/client';

export interface Source {
  __typename?: string;
  name: string;
  image: string;
}

export interface Post {
  __typename?: string;
  id: string;
  title: string;
  permalink: string;
  image: string;
  placeholder: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
  source: Source;
  upvoted?: boolean;
  commented?: boolean;
}

export interface PostData {
  post: Post;
}

export const POST_BY_ID_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      permalink
      image
      placeholder
      createdAt
      readTime
      tags
      upvoted
      commented
      source {
        name
        image
      }
    }
  }
`;

export interface EmptyResponse {
  _: boolean;
}

export interface UpvoteData {
  upvote: EmptyResponse;
}

export const UPVOTE_MUTATION = gql`
  mutation Upvote($id: ID!) {
    upvote(id: $id) {
      _
    }
  }
`;

export const CANCEL_UPVOTE_MUTATION = gql`
  mutation CancelUpvote($id: ID!) {
    cancelUpvote(id: $id) {
      _
    }
  }
`;

export const updatePostCache = <T>(
  cache: ApolloCache<T>,
  id: string,
  newData: Partial<Post>,
): void => {
  const data = cache.readQuery<PostData>({
    query: POST_BY_ID_QUERY,
    variables: { id },
  });
  cache.writeQuery<PostData>({
    query: POST_BY_ID_QUERY,
    variables: { id },
    data: {
      post: { ...data.post, ...newData },
    },
  });
};
