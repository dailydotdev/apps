import { gql } from 'graphql-request';
import { Author, Comment } from './comments';
import { Connection } from './common';
import { Source } from './sources';

export interface Post {
  __typename?: string;
  id: string;
  title: string;
  permalink?: string;
  image: string;
  createdAt?: string;
  readTime?: number;
  tags?: string[];
  source?: Source;
  upvoted?: boolean;
  commented?: boolean;
  commentsPermalink: string;
  numUpvotes?: number;
  numComments?: number;
  author?: Author;
  views?: number;
  placeholder?: string;
  read?: boolean;
  bookmarked?: boolean;
  featuredComments?: Comment[];
  trending?: number;
}

export interface Ad {
  pixel?: string[];
  source: string;
  link: string;
  description: string;
  image: string;
  placeholder?: string;
  referralLink?: string;
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
      bookmarked
      upvoted
      commented
      commentsPermalink
      numUpvotes
      numComments
      views
      source {
        id
        name
        image
      }
      author {
        id
        image
        name
        permalink
      }
    }
  }
`;

export const POST_BY_ID_STATIC_FIELDS_QUERY = gql`
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
      commentsPermalink
      numUpvotes
      numComments
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

export const ADD_BOOKMARKS_MUTATION = gql`
  mutation AddBookmarks($data: AddBookmarkInput!) {
    addBookmarks(data: $data) {
      _
    }
  }
`;

export const REMOVE_BOOKMARK_MUTATION = gql`
  mutation RemoveBookmark($id: ID!) {
    removeBookmark(id: $id) {
      _
    }
  }
`;

export interface FeedData {
  page: Connection<Post>;
}

export const AUTHOR_FEED_QUERY = gql`
  query AuthorFeed($userId: ID!, $after: String, $first: Int) {
    page: authorFeed(
      author: $userId
      after: $after
      first: $first
      ranking: TIME
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          title
          commentsPermalink
          image
          source {
            name
            image
          }
          numUpvotes
          numComments
          views
        }
      }
    }
  }
`;

export const KEYWORD_FEED_QUERY = gql`
  query KeywordFeed($keyword: String!, $after: String, $first: Int) {
    page: keywordFeed(keyword: $keyword, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          title
          commentsPermalink
          image
        }
      }
    }
  }
`;

export interface PostsEngaged {
  postsEngaged: { id: string; numComments: number; numUpvotes: number };
}

export const POSTS_ENGAGED_SUBSCRIPTION = gql`
  subscription PostsEngaged($ids: [ID]!) {
    postsEngaged(ids: $ids) {
      id
      numComments
      numUpvotes
    }
  }
`;
