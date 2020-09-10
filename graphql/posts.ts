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
  commentsPermalink: string;
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
      commentsPermalink
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

export interface CancelUpvoteData {
  cancelUpvote: EmptyResponse;
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

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      _
    }
  }
`;

export const updatePostUpvoteCache = <T>(
  cache: ApolloCache<T>,
  id: string,
  upvoted: boolean,
): void => {
  cache.modify({
    id: cache.identify({
      __typename: 'Post',
      id,
    }),
    broadcast: true,
    fields: {
      upvoted() {
        return upvoted;
      },
    },
  });
};
