import { gql } from 'graphql-request';
import { Author, Comment, Scout } from './comments';
import { Connection, Upvote } from './common';
import { UPVOTER_FRAGMENT } from './users';
import { Source } from './sources';
import { EmptyResponse } from './emptyResponse';

export type ReportReason = 'BROKEN' | 'NSFW' | 'CLICKBAIT' | 'LOW';

export type TocItem = { text: string; id?: string; children?: TocItem[] };
export type Toc = TocItem[];

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
  scout?: Scout;
  views?: number;
  placeholder?: string;
  read?: boolean;
  bookmarked?: boolean;
  featuredComments?: Comment[];
  trending?: number;
  description?: string;
  summary: string;
  toc?: Toc;
  impressionStatus?: number;
  isAuthor?: number;
  isScout?: number;
}

export interface Ad {
  pixel?: string[];
  source: string;
  link: string;
  description: string;
  image: string;
  placeholder?: string;
  referralLink?: string;
  providerId?: string;
  renderTracked?: boolean;
  impressionStatus?: number;
}

export interface ParentComment {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  editContent?: string;
  editId?: string;
}

export type ReadHistoryPost = Pick<
  Post,
  | 'id'
  | 'title'
  | 'commentsPermalink'
  | 'image'
  | 'readTime'
  | 'numUpvotes'
  | 'createdAt'
  | 'bookmarked'
  | 'permalink'
  | 'numComments'
  | 'trending'
  | 'tags'
> & { source?: Pick<Source, 'image' | 'id'> } & {
  author?: Pick<Author, 'id'>;
} & {
  scout?: Pick<Scout, 'id'>;
};

export interface PostItem {
  timestamp?: Date;
  timestampDb?: Date;
  post: ReadHistoryPost;
}

export interface PostData {
  post: Post;
}

export interface PostUpvote extends Upvote {
  post: Post;
}

export interface PostUpvotesData {
  postUpvotes: Connection<PostUpvote>;
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
      trending
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
      scout {
        id
        image
        name
        permalink
        username
      }
      author {
        id
        image
        name
        permalink
        username
      }
      description
      summary
      toc {
        text
        id
      }
    }
  }
`;

export const POST_UPVOTES_BY_ID_QUERY = gql`
  ${UPVOTER_FRAGMENT}
  query PostUpvotes($id: String!, $after: String, $first: Int) {
    upvotes: postUpvotes(id: $id, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          user {
            ...UpvoterFragment
          }
        }
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
        id
        name
        image
      }
      description
      summary
      toc {
        text
        id
      }
    }
  }
`;

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

export const BAN_POST_MUTATION = gql`
  mutation BanPost($id: ID!) {
    banPost(id: $id) {
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
            id
            name
            image
          }
          numUpvotes
          numComments
          views
          isAuthor
          isScout
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
  subscription PostsEngaged {
    postsEngaged {
      id
      numComments
      numUpvotes
    }
  }
`;

export const REPORT_POST_MUTATION = gql`
  mutation ReportPost($id: ID!, $reason: ReportReason!, $comment: String) {
    reportPost(id: $id, reason: $reason, comment: $comment) {
      _
    }
  }
`;

export const HIDE_POST_MUTATION = gql`
  mutation HidePost($id: ID!) {
    hidePost(id: $id) {
      _
    }
  }
`;

export const UNHIDE_POST_MUTATION = gql`
  mutation UnhidePost($id: ID!) {
    unhidePost(id: $id) {
      _
    }
  }
`;
