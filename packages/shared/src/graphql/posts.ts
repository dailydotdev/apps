import request, { gql } from 'graphql-request';
import { Author, Comment, Scout } from './comments';
import { Connection } from './common';
import { Source, Squad } from './sources';
import { EmptyResponse } from './emptyResponse';
import { graphqlUrl } from '../lib/config';
import {
  SHARED_POST_INFO_FRAGMENT,
  SOURCE_SHORT_INFO_FRAGMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import { acceptedTypesList, MEGABYTE } from '../components/fields/ImageInput';

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
  Welcome = 'welcome',
  Freeform = 'freeform',
  VideoYouTube = 'video:youtube',
}

export const internalReadTypes: PostType[] = [PostType.Welcome];

export const supportedTypesForPrivateSources = [
  PostType.Article,
  PostType.Share,
  PostType.Welcome,
  PostType.Freeform,
  PostType.VideoYouTube,
];

type PostFlags = {
  sentAnalyticsReport: boolean;
  banned: boolean;
  deleted: boolean;
  private: boolean;
  visible: boolean;
  showOnFeed: boolean;
  promoteToPublic: number;
};

export enum UserPostVote {
  Up = 1,
  None = 0,
  Down = -1,
}

export type UserPostFlags = {
  feedbackDismiss: boolean;
};

export interface PostUserState {
  vote: UserPostVote;
  flags?: UserPostFlags;
}

export interface Post {
  __typename?: string;
  id: string;
  title?: string;
  titleHtml?: string;
  permalink?: string;
  image: string;
  content?: string;
  contentHtml?: string;
  createdAt?: string;
  pinnedAt?: Date | string;
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
  downvoted?: boolean;
  flags: PostFlags;
  userState?: PostUserState;
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
  | 'userState'
> & { source?: Source } & {
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

export const POST_BY_ID_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      ...SharedPostInfo
      trending
      content
      contentHtml
      sharedPost {
        ...SharedPostInfo
      }
      source {
        ...SourceBaseInfo
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

export const DISMISS_POST_FEEDBACK_MUTATION = gql`
  mutation DismissPostFeedback($id: ID!) {
    dismissPostFeedback(id: $id) {
      _
    }
  }
`;

export const VOTE_POST_MUTATION = gql`
  mutation VotePost($id: ID!, $vote: Int!) {
    votePost(id: $id, vote: $vote) {
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

export const PROMOTE_TO_PUBLIC_MUTATION = gql`
  mutation PromoteToPublic($id: ID!) {
    promoteToPublic(id: $id) {
      _
    }
  }
`;

export const DEMOTE_FROM_PUBLIC_MUTATION = gql`
  mutation DemoteFromPublic($id: ID!) {
    demoteFromPublic(id: $id) {
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
  mutation ReportPost(
    $id: ID!
    $reason: ReportReason!
    $comment: String
    $tags: [String!]
  ) {
    reportPost(id: $id, reason: $reason, comment: $comment, tags: $tags) {
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

export const dismissPostFeedback = (id: string): Promise<EmptyResponse> => {
  return request(graphqlUrl, DISMISS_POST_FEEDBACK_MUTATION, {
    id,
  });
};

export const banPost = (id: string): Promise<EmptyResponse> => {
  return request(graphqlUrl, BAN_POST_MUTATION, {
    id,
  });
};

export const promotePost = (id: string): Promise<EmptyResponse> =>
  request(graphqlUrl, PROMOTE_TO_PUBLIC_MUTATION, {
    id,
  });

export const demotePost = (id: string): Promise<EmptyResponse> =>
  request(graphqlUrl, DEMOTE_FROM_PUBLIC_MUTATION, {
    id,
  });

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
          commentsPermalink
          numComments
          numUpvotes
          summary
          userState {
            vote
          }
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

export const SUBMIT_EXTERNAL_LINK_MUTATION = gql`
  mutation SubmitExternalLink(
    $sourceId: ID!
    $url: String!
    $title: String
    $image: String
    $commentary: String
  ) {
    submitExternalLink(
      url: $url
      title: $title
      image: $image
      sourceId: $sourceId
      commentary: $commentary
    ) {
      _
    }
  }
`;

export interface ExternalLinkPreview {
  url?: string;
  permalink?: string;
  id?: string;
  title?: string;
  image?: string;
  source?: Source;
}

export const PREVIEW_LINK_MUTATION = gql`
  mutation CheckLinkPreview($url: String!) {
    checkLinkPreview(url: $url) {
      id
      title
      image
    }
  }
`;

export const getExternalLinkPreview = async (
  url: string,
  requestMethod = request,
): Promise<ExternalLinkPreview> => {
  const res = await requestMethod(graphqlUrl, PREVIEW_LINK_MUTATION, { url });

  return res.checkLinkPreview;
};

export interface SubmitExternalLink
  extends Pick<ExternalLinkPreview, 'title' | 'image' | 'url'> {
  sourceId: string;
  commentary: string;
}

export const submitExternalLink = (
  params: SubmitExternalLink,
  requestMethod = request,
): Promise<EmptyResponse> =>
  requestMethod(graphqlUrl, SUBMIT_EXTERNAL_LINK_MUTATION, params);

export const EDIT_POST_MUTATION = gql`
  mutation EditPost(
    $id: ID!
    $title: String
    $content: String
    $image: Upload
  ) {
    editPost(id: $id, title: $title, content: $content, image: $image) {
      ...SharedPostInfo
      trending
      content
      contentHtml
      source {
        ...SourceBaseInfo
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

export interface EditPostProps {
  id: string;
  title: string;
  content: string;
  image: File;
}

export interface CreatePostProps
  extends Pick<EditPostProps, 'title' | 'content' | 'image'> {
  sourceId: string;
}

export const editPost = async (
  variables: Partial<EditPostProps>,
): Promise<Post> => {
  const res = await request(graphqlUrl, EDIT_POST_MUTATION, variables);

  return res.editPost;
};

export const PIN_POST_MUTATION = gql`
  mutation UpdatePinPost($id: ID!, $pinned: Boolean!) {
    updatePinPost(id: $id, pinned: $pinned) {
      _
    }
  }
`;

interface UpdatePinnedProps {
  id: string;
  pinned: boolean;
}

export const updatePinnedPost = async (
  variables: UpdatePinnedProps,
): Promise<void> => request(graphqlUrl, PIN_POST_MUTATION, variables);

export const SWAP_PINNED_POSTS_MUTATION = gql`
  mutation SwapPinnedPosts($id: ID!, $swapWithId: ID!) {
    swapPinnedPosts(id: $id, swapWithId: $swapWithId) {
      _
    }
  }
`;

interface SwapPinnedPostsProps {
  id: Post['id'];
  swapWithId: Post['id'];
}

export const swapPinnedPosts = async (
  variables: SwapPinnedPostsProps,
): Promise<void> => request(graphqlUrl, SWAP_PINNED_POSTS_MUTATION, variables);

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost(
    $sourceId: ID!
    $title: String!
    $content: String
    $image: Upload
  ) {
    createFreeformPost(
      sourceId: $sourceId
      title: $title
      content: $content
      image: $image
    ) {
      ...SharedPostInfo
      content
      contentHtml
      source {
        ...SourceBaseInfo
      }
      description
      summary
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const createPost = async (
  variables: Partial<CreatePostProps>,
): Promise<Post> => {
  const res = await request(graphqlUrl, CREATE_POST_MUTATION, variables);

  return res.createFreeformPost;
};

export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadContentImage($image: Upload!) {
    uploadContentImage(image: $image)
  }
`;

export const imageSizeLimitMB = 5;
export const allowedFileSize = imageSizeLimitMB * MEGABYTE;
export const allowedContentImage = [...acceptedTypesList, 'image/gif'];

export const uploadNotAcceptedMessage = `File type is not allowed or the size exceeded the limit of ${imageSizeLimitMB} MB`;

export const uploadContentImage = async (
  image: File,
  onProcessing?: (file: File) => void,
): Promise<string> => {
  if (image.size > allowedFileSize) {
    throw new Error(`File size exceeds the limit of ${imageSizeLimitMB} MB`);
  }

  if (!allowedContentImage.includes(image.type)) {
    throw new Error('File type is not allowed');
  }

  if (onProcessing) {
    onProcessing(image);
  }

  const res = await request(graphqlUrl, UPLOAD_IMAGE_MUTATION, { image });

  return res.uploadContentImage;
};
