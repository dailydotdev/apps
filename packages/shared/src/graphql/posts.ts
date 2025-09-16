import { gql } from 'graphql-request';
import type { Author, Scout } from './comments';
import type { Connection } from './common';
import { gqlClient, gqlRequest } from './common';
import type { Source, Squad } from './sources';
import { SourceType } from './sources';
import type { EmptyResponse } from './emptyResponse';
import {
  POST_CODE_SNIPPET_FRAGMENT,
  RELATED_POST_FRAGMENT,
  SHARED_POST_INFO_FRAGMENT,
  SOURCE_SHORT_INFO_FRAGMENT,
  USER_AUTHOR_FRAGMENT,
} from './fragments';
import type { Bookmark, BookmarkFolder } from './bookmarks';
import type { SourcePostModeration } from './squads';
import type { FeaturedAward } from './njord';
import { useCanPurchaseCores } from '../hooks/useCoresFeature';
import { useAuthContext } from '../contexts/AuthContext';
import type { LoggedUser } from '../lib/user';
import { PostType } from '../types';
import { FEED_POST_CONNECTION_FRAGMENT } from './feed';
import { getPostByIdKey, RequestKey, StaleTime } from '../lib/query';

export const ACCEPTED_TYPES = 'image/png,image/jpeg';
export const acceptedTypesList = ACCEPTED_TYPES.split(',');
export const MEGABYTE = 1024 * 1024;
export type TocItem = { text: string; id?: string; children?: TocItem[] };
export type Toc = TocItem[];

export interface SharedPost extends Post {
  __typename?: string;
  id: string;
  title: string;
  image: string;
}

// just re-export for old usage, type should be imported from root types.ts
export { PostType };

export const internalReadTypes: PostType[] = [
  PostType.Welcome,
  PostType.Freeform,
  PostType.Collection,
];

export const isInternalReadType = (post: Post): boolean =>
  internalReadTypes.includes(post?.type);

export const isSharedPostSquadPost = (
  post: Pick<Post, 'sharedPost'>,
): boolean => post.sharedPost?.source.type === SourceType.Squad;

export const isVideoPost = (post: Post | ReadHistoryPost): boolean =>
  post?.type === PostType.VideoYouTube ||
  (post?.type === PostType.Share &&
    post?.sharedPost?.type === PostType.VideoYouTube);

export const getReadPostButtonText = (post: Post): string =>
  isVideoPost(post) ? 'Watch video' : 'Read post';

export const translateablePostFields = [
  'title',
  'smartTitle',
  'titleHtml',
  'summary',
] as const;
export type TranslateablePostField = (typeof translateablePostFields)[number];
export type PostTranslation = {
  [key in TranslateablePostField]?: boolean;
};

type PostFlags = {
  sentAnalyticsReport: boolean;
  banned: boolean;
  deleted: boolean;
  private: boolean;
  visible: boolean;
  showOnFeed: boolean;
  promoteToPublic: number;
  coverVideo?: string;
  campaignId: string | null;
  posts?: number;
  sources?: number;
  savedTime?: number;
  generatedAt?: Date;
};

export enum UserVote {
  Up = 1,
  None = 0,
  Down = -1,
}

export type UserPostFlags = {
  feedbackDismiss: boolean;
};

export interface PostUserState {
  vote: UserVote;
  flags?: UserPostFlags;
  awarded?: boolean;
  pollVoteOptionId?: string;
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
  collectionSources?: Source[];
  numCollectionSources?: number;
  upvoted?: boolean;
  commented?: boolean;
  commentsPermalink: string;
  numUpvotes?: number;
  numComments?: number;
  numAwards?: number;
  author?: Author;
  scout?: Scout;
  views?: number;
  read?: boolean;
  bookmarked?: boolean;
  trending?: number;
  description?: string;
  summary?: string;
  toc?: Toc;
  impressionStatus?: number;
  isAuthor?: number;
  isScout?: number;
  sharedPost?: SharedPost;
  type: PostType;
  private?: boolean;
  feedMeta?: string;
  downvoted?: boolean;
  flags?: PostFlags;
  userState?: PostUserState;
  videoId?: string;
  updatedAt?: string;
  slug?: string;
  bookmark?: Bookmark;
  bookmarkList?: BookmarkFolder;
  domain?: string;
  clickbaitTitleDetected?: boolean;
  translation?: PostTranslation;
  language?: string;
  yggdrasilId?: string;
  featuredAward?: {
    award?: FeaturedAward;
  };
  pollOptions?: PollOption[];
  numPollVotes?: number;
  endsAt?: string;
}

export type RelatedPost = Pick<
  Post,
  'id' | 'commentsPermalink' | 'title' | 'summary' | 'createdAt'
> & {
  source: Pick<Source, 'id' | 'handle' | 'name' | 'image'>;
};

export interface Ad {
  pixel?: string[];
  source: string;
  company: string;
  link: string;
  description: string;
  image: string;
  placeholder?: string;
  referralLink?: string;
  providerId?: string;
  renderTracked?: boolean;
  impressionStatus?: number;
  tagLine?: string;
  backgroundColor?: string;
  data?: { post?: Post; source?: Squad };
  generationId?: string;
}

export type ReadHistoryPost = Pick<
  Post,
  | 'id'
  | 'slug'
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
  | 'author'
  | 'scout'
> & { source?: Source };

export interface PostItem {
  timestamp?: Date;
  timestampDb?: Date;
  post: ReadHistoryPost;
}

export interface PostData {
  post: Post;
  relatedCollectionPosts?: Connection<RelatedPost>;
}

export const RELATED_POSTS_PER_PAGE_DEFAULT = 5;

export const POST_BY_ID_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      ...SharedPostInfo
      trending
      content
      contentHtml
      pinnedAt
      bookmarkList {
        id
      }
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
      updatedAt
      numCollectionSources
      collectionSources {
        handle
        image
      }
    }
    relatedCollectionPosts: relatedPosts(
      id: $id
      relationType: COLLECTION
      first: ${RELATED_POSTS_PER_PAGE_DEFAULT}
    ) {
      edges {
        node {
          ...RelatedPost
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
  ${RELATED_POST_FRAGMENT}
`;

export const getPostById = (id: string) =>
  gqlClient.request<PostData>(POST_BY_ID_QUERY, { id });

export const POST_UPVOTES_BY_ID_QUERY = gql`
  ${USER_AUTHOR_FRAGMENT}
  query PostUpvotes($id: String!, $after: String, $first: Int) {
    upvotes: postUpvotes(id: $id, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          user {
            ...UserAuthor
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
      createdAt
      readTime
      tags
      private
      commentsPermalink
      numUpvotes
      numComments
      numAwards
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
      updatedAt
      numCollectionSources
      slug
      domain
      author {
        ...UserAuthor
      }
      sharedPost {
        ...SharedPostInfo
      }
      clickbaitTitleDetected
      featuredAward {
        award {
          ...FeaturedAwardFragment
        }
      }
      numPollVotes
      pollOptions {
        id
        text
        order
        numVotes
      }
      endsAt
    }
  }
  ${SOURCE_SHORT_INFO_FRAGMENT}
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const DISMISS_POST_FEEDBACK_MUTATION = gql`
  mutation DismissPostFeedback($id: ID!) {
    dismissPostFeedback(id: $id) {
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

export const CLICKBAIT_POST_MUTATION = gql`
  mutation ClickbaitPost($id: ID!) {
    clickbaitPost(id: $id) {
      _
    }
  }
`;

export const ADD_BOOKMARKS_MUTATION = gql`
  mutation AddBookmarks($data: AddBookmarkInput!) {
    addBookmarks(data: $data) {
      list {
        id
        name
      }
      postId
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
  return gqlClient.request(DISMISS_POST_FEEDBACK_MUTATION, {
    id,
  });
};

export const banPost = (id: string): Promise<EmptyResponse> => {
  return gqlClient.request(BAN_POST_MUTATION, {
    id,
  });
};

export const promotePost = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(PROMOTE_TO_PUBLIC_MUTATION, {
    id,
  });

export const demotePost = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(DEMOTE_FROM_PUBLIC_MUTATION, {
    id,
  });

export const deletePost = (id: string): Promise<EmptyResponse> => {
  return gqlClient.request(DELETE_POST_MUTATION, {
    id,
  });
};

export const clickbaitPost = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(CLICKBAIT_POST_MUTATION, {
    id,
  });

export const VIEW_POST_MUTATION = gql`
  mutation ViewPost($id: ID!) {
    viewPost(id: $id) {
      _
    }
  }
`;

export const sendViewPost = (id: string): Promise<void> =>
  gqlClient.request(VIEW_POST_MUTATION, { id });

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
  const feedData = await gqlClient.request<FeedData>(
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
  finalUrl?: string;
  relatedPublicPosts?: Array<Post> | null;
}

export const PREVIEW_LINK_MUTATION = gql`
  mutation CheckLinkPreview($url: String!) {
    checkLinkPreview(url: $url) {
      id
      title
      image
      url
      relatedPublicPosts {
        id
        title
        permalink
        createdAt
        source {
          id
          name
          image
          type
        }
        author {
          id
          image
          username
        }
      }
    }
  }
`;

export const getExternalLinkPreview = async (
  url: string,
  requestMethod = gqlRequest,
): Promise<ExternalLinkPreview> => {
  const res = await requestMethod(PREVIEW_LINK_MUTATION, { url });

  return res.checkLinkPreview;
};

export interface SubmitExternalLink
  extends Pick<ExternalLinkPreview, 'title' | 'image' | 'url'> {
  sourceId: string;
  commentary: string;
}

export const submitExternalLink = (
  params: SubmitExternalLink,
  requestMethod = gqlRequest,
): Promise<EmptyResponse> =>
  requestMethod(SUBMIT_EXTERNAL_LINK_MUTATION, params);

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
export interface PollOption {
  id: string;
  text: string;
  order: number;
  numVotes: number;
}

export interface CreatePollPostProps extends Pick<EditPostProps, 'title'> {
  options: PollOption[];
  duration?: number;
}

export interface CreatePostModerationProps {
  title?: string;
  content?: string;
  sourceId: string;
  type: PostType;
  sharedPostId?: string;
  externalLink?: string;
  imageUrl?: string;
  image?: File;
  postId?: string;
}

export interface UpdatePostModerationProps extends CreatePostModerationProps {
  id: string;
}

export const editPost = async (
  variables: Partial<EditPostProps>,
): Promise<Post> => {
  const res = await gqlClient.request(EDIT_POST_MUTATION, variables);

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
): Promise<void> => gqlClient.request(PIN_POST_MUTATION, variables);

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
): Promise<void> => gqlClient.request(SWAP_PINNED_POSTS_MUTATION, variables);

export const CREATE_SOURCE_POST_MODERATION_MUTATION = gql`
  mutation CreateSourcePostModeration(
    $sourceId: ID!
    $type: String!
    $title: String
    $content: String
    $sharedPostId: ID
    $image: Upload
    $imageUrl: String
    $externalLink: String
    $postId: ID
  ) {
    createSourcePostModeration(
      sourceId: $sourceId
      type: $type
      title: $title
      content: $content
      sharedPostId: $sharedPostId
      image: $image
      imageUrl: $imageUrl
      externalLink: $externalLink
      postId: $postId
    ) {
      id
      title
      image
      content
      type
      externalLink
      source {
        handle
        permalink
      }
      post {
        id
      }
    }
  }
`;

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
  const res = await gqlClient.request(CREATE_POST_MUTATION, variables);

  return res.createFreeformPost;
};

export const VOTE_POLL_MUTATION = gql`
  mutation VotePoll($postId: ID!, $optionId: ID!, $sourceId: ID) {
    votePoll(postId: $postId, optionId: $optionId, sourceId: $sourceId) {
      ...SharedPostInfo
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const votePoll = async (variables: {
  postId: string;
  optionId: string;
  sourceId?: string;
}): Promise<Post> => {
  const res = await gqlClient.request(VOTE_POLL_MUTATION, variables);

  return res.votePoll;
};

export const CREATE_POLL_POST_MUTATION = gql`
  mutation CreatePollPost(
    $sourceId: ID!
    $title: String!
    $options: [PollOptionInput!]!
    $duration: Int
  ) {
    createPollPost(
      sourceId: $sourceId
      title: $title
      options: $options
      duration: $duration
    ) {
      ...SharedPostInfo
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const createPollPost = async (
  variables: Partial<CreatePollPostProps>,
): Promise<Post> => {
  const res = await gqlClient.request(CREATE_POLL_POST_MUTATION, variables);

  return res.createPollPost;
};

export const SOURCE_POST_MODERATION_QUERY = gql`
  query SourcePostModeration($id: ID!) {
    sourcePostModeration(id: $id) {
      id
      type
      title
      content
      externalLink
      image
      createdBy {
        id
      }
      source {
        id
      }
      sharedPost {
        id
        title
        image
        permalink
      }
    }
  }
`;

interface GetSourcePostModerationProps {
  id: string;
}

export const getSourcePostModeration = async ({
  id,
}: GetSourcePostModerationProps): Promise<SourcePostModeration> => {
  const res = await gqlClient.request(SOURCE_POST_MODERATION_QUERY, { id });

  return res.sourcePostModeration;
};

export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadContentImage($image: Upload!) {
    uploadContentImage(image: $image)
  }
`;

export const imageSizeLimitMB = 20;
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

  const res = await gqlClient.request(UPLOAD_IMAGE_MUTATION, { image });

  return res.uploadContentImage;
};

export enum PostRelationType {
  Collection = 'COLLECTION',
}

export const RELATED_POSTS_QUERY = gql`
  query relatedPosts(
    $id: ID!
    $relationType: PostRelationType!
    $after: String
    $first: Int
  ) {
    relatedPosts(
      id: $id
      relationType: $relationType
      after: $after
      first: $first
    ) {
      edges {
        node {
          ...RelatedPost
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${RELATED_POST_FRAGMENT}
`;

export const POST_CODE_SNIPPETS_PER_PAGE_DEFAULT = 5;

export type PostCodeSnippet = {
  content: string;
};

export const POST_CODE_SNIPPETS_QUERY = gql`
  query postCodeSnippets($id: ID!, $after: String, $first: Int) {
    postCodeSnippets(id: $id, after: $after, first: $first) {
      edges {
        node {
          ...PostCodeSnippet
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${POST_CODE_SNIPPET_FRAGMENT}
`;

export type PostSmartTitle = Pick<Post, 'title' | 'translation'>;

export const POST_FETCH_SMART_TITLE_QUERY = gql`
  query FetchSmartTitle($id: ID!) {
    fetchSmartTitle(id: $id) {
      title
      translation {
        title
        smartTitle
      }
    }
  }
`;

export const createSourcePostModeration = async (
  variables: Partial<CreatePostModerationProps>,
): Promise<SourcePostModeration> => {
  const res = await gqlClient.request(
    CREATE_SOURCE_POST_MODERATION_MUTATION,
    variables,
  );

  return res.createSourcePostModeration;
};

export const UPDATE_SOURCE_POST_MODERATION_MUTATION = gql`
  mutation EditSourcePostModeration(
    $id: ID!
    $sourceId: ID!
    $type: String!
    $title: String
    $content: String
    $sharedPostId: ID
    $image: Upload
    $imageUrl: String
    $externalLink: String
  ) {
    editSourcePostModeration(
      id: $id
      sourceId: $sourceId
      type: $type
      title: $title
      content: $content
      sharedPostId: $sharedPostId
      image: $image
      imageUrl: $imageUrl
      externalLink: $externalLink
    ) {
      id
      title
      image
      content
      type
      externalLink
    }
  }
`;

export const updateSourcePostModeration = async (
  variables: Partial<UpdatePostModerationProps>,
): Promise<SourcePostModeration> => {
  const res = await gqlClient.request(
    UPDATE_SOURCE_POST_MODERATION_MUTATION,
    variables,
  );

  return res.updateSourcePostModeration;
};

export const checkCanBoostByUser = (post: Post, userId: string) =>
  (post?.author?.id && post?.author?.id === userId) ||
  (post?.scout?.id && post?.scout?.id === userId);

export const useCanBoostPost = (post: Post) => {
  const { user } = useAuthContext();
  const canBuy = useCanPurchaseCores();
  const canBoost =
    canBuy && checkCanBoostByUser(post, user?.id) && !post?.private;

  return { canBoost };
};

export const BRIEFING_POSTS_PER_PAGE_DEFAULT = 20;

export const BRIEFING_POSTS_QUERY = gql`
  query BriefingPosts(
    $after: String
    $first: Int
    $loggedIn: Boolean! = false
  ) {
    page: briefingPosts(after: $after, first: $first) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export enum BriefingType {
  Daily = 'daily',
  Weekly = 'weekly',
}

export const GENERATE_BRIEFING = gql`
  mutation GenerateBriefing($type: BriefingType!) {
    generateBriefing(type: $type) {
      id: postId
      balance {
        amount
      }
    }
  }
`;

export const getGenerateBriefingMutationOptions = () => {
  return {
    mutationFn: async ({
      type = BriefingType.Daily,
    }: {
      type: BriefingType;
    }) => {
      const result = await gqlClient.request<{
        generateBriefing: Pick<Post, 'id'> & Pick<LoggedUser, 'balance'>;
      }>(GENERATE_BRIEFING, { type });
      return result.generateBriefing;
    },
  };
};

export const defautRefetchMs = 4000;
export const briefRefetchIntervalMs = defautRefetchMs;

export const POST_ANALYTICS_QUERY = gql`
  query PostAnalytics($id: ID!) {
    postAnalytics(id: $id) {
      id
      impressions
      reach
      bookmarks
      profileViews
      followers
      squadJoins
      reputation
      coresEarned
      upvotes
      comments
      awards
      upvotesRatio
      shares
      reachAds
      impressionsAds
    }
  }
`;

export type PostAnalytics = {
  id: string;
  impressions: number;
  reach: number;
  bookmarks: number;
  profileViews: number;
  followers: number;
  squadJoins: number;
  reputation: number;
  coresEarned: number;
  upvotes: number;
  comments: number;
  awards: number;
  upvotesRatio: number;
  shares: number;
  reachAds: number;
  impressionsAds: number;
};

export const postAnalyticsQueryOptions = ({ id }: { id?: string }) => {
  return {
    queryKey: [...getPostByIdKey(id), RequestKey.PostAnalytics],
    queryFn: async () => {
      const result = await gqlClient.request<{
        postAnalytics: PostAnalytics;
      }>(POST_ANALYTICS_QUERY, { id });

      return result.postAnalytics;
    },
    enabled: !!id,
    staleTime: StaleTime.Default,
  };
};

export const postAnalyticsHistoryLimit = 45;

export const POST_ANALYTICS_HISTORY_QUERY = gql`
  query PostAnalyticsHistory($after: String, $first: Int, $id: ID!) {
    postAnalyticsHistory(after: $after, first: $first, id: $id) {
      edges {
        cursor
        node {
          id
          date
          impressions
          impressionsAds
        }
      }
    }
  }
`;

export type PostAnalyticsHistory = Pick<
  PostAnalytics,
  'id' | 'impressions' | 'impressionsAds'
> & {
  date: Date;
};

export const postAnalyticsHistoryQuery = ({
  id,
  first = postAnalyticsHistoryLimit,
}: {
  id?: string;
  first?: number;
}) => {
  return {
    queryKey: [...getPostByIdKey(id), RequestKey.PostAnalyticsHistory],
    queryFn: async () => {
      const result = await gqlClient.request<{
        postAnalyticsHistory: Connection<PostAnalyticsHistory>;
      }>(POST_ANALYTICS_HISTORY_QUERY, { first, id });

      return result.postAnalyticsHistory;
    },
    enabled: !!id,
    staleTime: StaleTime.Default,
  };
};
