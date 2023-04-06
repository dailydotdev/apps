import request, { gql } from 'graphql-request';
import { Author, Comment, Scout } from './comments';
import { Connection, Upvote } from './common';
import { Source, Squad } from './sources';
import { EmptyResponse } from './emptyResponse';
import { graphqlUrl } from '../lib/config';
import {
  SHARED_POST_INFO_FRAGMENT,
  SOURCE_SHORT_INFO_FRAGMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import { SUPPORTED_TYPES } from './feed';

export type ReportReason = 'BROKEN' | 'NSFW' | 'CLICKBAIT' | 'LOW';

export type TocItem = { text: string; id?: string; children?: TocItem[] };
export type Toc = TocItem[];

export interface SharedPost extends Post {
  __typename?: string;
  id: string;
  title: string;
  image: string;
}

export enum PostType {
  Article = 'article',
  Share = 'share',
}

export interface Post {
  __typename?: string;
  id: string;
  title: string;
  permalink?: string;
  image: string;
  createdAt?: string;
  readTime?: number;
  tags?: string[];
  source?: Source | Squad;
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
  sharedPost?: SharedPost;
  type: PostType;
  private?: boolean;
  feedMeta?: string;
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
  handle?: string;
  authorId?: string;
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  editContent?: string;
  editId?: string;
  replyTo?: string;
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
  | 'sharedPost'
  | 'type'
> & { source?: Pick<Source, 'image' | 'id' | 'type'> } & {
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

export const POST_BY_ID_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      ...SharedPostInfo
      trending
      views
      sharedPost {
        ...SharedPostInfo
      }
      source {
        ...SourceBaseInfo
        privilegedMembers {
          user {
            id
          }
          role
        }
      }
      description
      summary
      toc {
        text
        id
      }
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const POST_UPVOTES_BY_ID_QUERY = gql`
  ${USER_SHORT_INFO_FRAGMENT}
  query PostUpvotes($id: String!, $after: String, $first: Int) {
    upvotes: postUpvotes(id: $id, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          user {
            ...UserShortInfo
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
      private
      commentsPermalink
      numUpvotes
      numComments
      source {
        ...SourceShortInfo
      }
      description
      summary
      toc {
        text
        id
      }
      type
    }
  }
  ${SOURCE_SHORT_INFO_FRAGMENT}
`;

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
  query AuthorFeed(
    $userId: ID!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: authorFeed(
      author: $userId
      after: $after
      first: $first
      ranking: TIME
      supportedTypes: $supportedTypes
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
            ...SourceShortInfo
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
  ${SOURCE_SHORT_INFO_FRAGMENT}
`;

export const KEYWORD_FEED_QUERY = gql`
  query KeywordFeed(
    $keyword: String!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: keywordFeed(keyword: $keyword, after: $after, first: $first, supportedTypes: $supportedTypes) {
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

export const banPost = (id: string): Promise<EmptyResponse> => {
  return request(graphqlUrl, BAN_POST_MUTATION, {
    id,
  });
};

export const deletePost = (id: string): Promise<EmptyResponse> => {
  return request(graphqlUrl, DELETE_POST_MUTATION, {
    id,
  });
};

export const VIEW_POST_MUTATION = gql`
  mutation ViewPost($id: ID!) {
    viewPost(id: $id) {
      _
    }
  }
`;

export const sendViewPost = (id: string): Promise<void> =>
  request(graphqlUrl, VIEW_POST_MUTATION, { id });

export const LATEST_CHANGELOG_POST_QUERY = gql`
  query LatestChangelogPost {
    page: sourceFeed(source: "daily_updates", first: 1, ranking: TIME) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          createdAt
          image
          permalink
          numComments
          numUpvotes
          summary
        }
      }
    }
  }
`;

export const getLatestChangelogPost = async (): Promise<Post> => {
  const feedData = await request<FeedData>(
    graphqlUrl,
    LATEST_CHANGELOG_POST_QUERY,
  );

  return feedData?.page?.edges?.[0]?.node;
};

export const POST_BY_URL_QUERY = gql`
  query PostByUrl($url: String!) {
    postByUrl(url: $url) {
      ...SharedPostInfo
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const getPostByUrl = async (url: string): Promise<Post> => {
  const res = await request(graphqlUrl, POST_BY_URL_QUERY, { url });

  return res.postByUrl;
};

export const SUBMIT_EXTERNAL_LINK_MUTATION = gql`
  mutation SubmitExternalLink(
    $sourceId: ID!
    $url: String!
    $commentary: String!
  ) {
    submitExternalLink(
      url: $url
      sourceId: $sourceId
      commentary: $commentary
    ) {
      _
    }
  }
`;

interface SubmitExternalLink {
  url: string;
  sourceId: string;
  commentary: string;
}

export const submitExternalLink = (params: SubmitExternalLink): Promise<Post> =>
  request(graphqlUrl, SUBMIT_EXTERNAL_LINK_MUTATION, params);
