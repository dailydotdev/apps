import { ApolloCache, gql } from '@apollo/client';
import { Connection } from './common';
import { EmptyResponse } from './posts';

export interface CommentAuthor {
  __typename?: string;
  id: string;
  name: string;
  image: string;
}

export interface Comment {
  __typename?: string;
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  permalink: string;
  upvoted?: boolean;
  numUpvotes: number;
  children?: Connection<Comment>;
}

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    content
    createdAt
    permalink
    upvoted
    numUpvotes
    author {
      id
      name
      image
    }
  }
`;

export const COMMENT_WITH_CHILDREN_FRAGMENT = gql`
  fragment CommentWithChildrenFragment on Comment {
    ...CommentFragment
    children {
      edges {
        node {
          ...CommentFragment
        }
      }
    }
  }
`;

export interface PostCommentsData {
  postComments: Connection<Comment>;
}

export interface UpvoteCommentData {
  upvoteComment: EmptyResponse;
}

export interface CancelCommentUpvoteData {
  cancelCommentUpvote: EmptyResponse;
}

export const POST_COMMENTS_QUERY = gql`
  query PostComments($postId: ID!, $after: String, $first: Int) {
    postComments(postId: $postId, after: $after, first: $first) {
      edges {
        node {
          ...CommentWithChildrenFragment
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
  ${COMMENT_WITH_CHILDREN_FRAGMENT}
`;

export const UPVOTE_COMMENT_MUTATION = gql`
  mutation UpvoteComment($id: ID!) {
    upvoteComment(id: $id) {
      _
    }
  }
`;

export const CANCEL_COMMENT_UPVOTE_MUTATION = gql`
  mutation CancelCommentUpvote($id: ID!) {
    cancelCommentUpvote(id: $id) {
      _
    }
  }
`;

export const COMMENT_MUTATION_FRAGMENT = gql`
  fragment CommentMutationFragment on Comment {
    id
    content
    createdAt
    permalink
  }
`;

export interface CommentOnData {
  comment: Comment;
}

export const COMMENT_ON_POST_MUTATION = gql`
  mutation COMMENT_ON_POST_MUTATION($id: ID!, $content: String!) {
    comment: commentOnPost(postId: $id, content: $content) {
      ...CommentMutationFragment
    }
  }
  ${COMMENT_MUTATION_FRAGMENT}
`;

export const COMMENT_ON_COMMENT_MUTATION = gql`
  mutation COMMENT_ON_COMMENT_MUTATION($id: ID!, $content: String!) {
    comment: commentOnComment(commentId: $id, content: $content) {
      ...CommentMutationFragment
    }
  }
  ${COMMENT_MUTATION_FRAGMENT}
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DELETE_COMMENT_MUTATION($id: ID!) {
    deleteComment(id: $id) {
      _
    }
  }
`;

export const updateCommentUpvoteCache = <T>(
  cache: ApolloCache<T>,
  id: string,
  upvoted: boolean,
  numUpvotes: number,
): void => {
  cache.modify({
    id: cache.identify({
      __typename: 'Comment',
      id,
    }),
    broadcast: true,
    fields: {
      upvoted() {
        return upvoted;
      },
      numUpvotes() {
        return numUpvotes;
      },
    },
  });
};
