import { gql } from 'graphql-request';
import { Connection } from './common';
import { EmptyResponse } from './emptyResponse';

export interface Author {
  __typename?: string;
  id: string;
  name: string;
  image: string;
  permalink: string;
}

export interface Comment {
  __typename?: string;
  id: string;
  content: string;
  createdAt: string;
  lastUpdatedAt?: string;
  author?: Author;
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
    lastUpdatedAt
    permalink
    upvoted
    numUpvotes
    author {
      id
      name
      image
      permalink
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

export interface UserCommentsData {
  page: Connection<Comment>;
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

export const USER_COMMENTS_QUERY = gql`
  query UserComments($userId: ID!, $after: String, $first: Int) {
    page: userComments(userId: $userId, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          content
          numUpvotes
          createdAt
          permalink
        }
      }
    }
  }
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

export interface CommentOnData {
  comment: Comment;
}

export const COMMENT_ON_POST_MUTATION = gql`
  mutation COMMENT_ON_POST_MUTATION($id: ID!, $content: String!) {
    comment: commentOnPost(postId: $id, content: $content) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const COMMENT_ON_COMMENT_MUTATION = gql`
  mutation COMMENT_ON_COMMENT_MUTATION($id: ID!, $content: String!) {
    comment: commentOnComment(commentId: $id, content: $content) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DELETE_COMMENT_MUTATION($id: ID!) {
    deleteComment(id: $id) {
      _
    }
  }
`;

export const EDIT_COMMENT_MUTATION = gql`
  mutation EDIT_COMMENT_MUTATION($id: ID!, $content: String!) {
    comment: editComment(id: $id, content: $content) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;
