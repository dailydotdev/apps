import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import {
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../../graphql/posts';
import useSubscription from '../../hooks/useSubscription';
import { postAnalyticsEvent } from '../../lib/feed';
import PostMetadata from '../cards/PostMetadata';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { AuthorOnboarding } from './AuthorOnboarding';
import { NewComment } from './NewComment';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import { PostWidgets } from './PostWidgets';
import { TagLinks } from '../TagLinks';
import PostToc from '../widgets/PostToc';
import {
  PostNavigation,
  PostNavigationClassName,
  PostNavigationProps,
} from './PostNavigation';
import { PostModalActionsProps } from './PostModalActions';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import classed from '../../lib/classed';
import {
  usePostComment,
  UsePostCommentOptionalProps,
} from '../../hooks/usePostComment';
import { useUpvoteQuery } from '../../hooks/useUpvoteQuery';
import {
  ToastSubject,
  useToastNotification,
} from '../../hooks/useToastNotification';
import { postEventName } from '../utilities';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import useUpdatePost from '../../hooks/useUpdatePost';
import { useSharePost } from '../../hooks/useSharePost';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { useShareComment } from '../../hooks/useShareComment';
import useOnPostClick from '../../hooks/useOnPostClick';
import { AuthTriggers } from '../../lib/auth';
import { Comment } from '../../graphql/comments';
import { PostFeedFiltersOnboarding } from './PostFeedFiltersOnboarding';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import AlertContext from '../../contexts/AlertContext';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ExperimentWinner } from '../../lib/featureValues';
import FixedPostNavigation from './FixedPostNavigation';

const UpvotedPopupModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "upvotedPopupModal" */ '../modals/UpvotedPopupModal'
    ),
);
const NewCommentModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "newCommentModal" */ '../modals/NewCommentModal'
    ),
);
const ShareNewCommentPopup = dynamic(
  () =>
    import(
      /* webpackChunkName: "shareNewCommentPopup" */ '../ShareNewCommentPopup'
    ),
  {
    ssr: false,
  },
);
const SharePostModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);
const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

interface ClassName {
  container?: string;
  navigation?: PostNavigationClassName;
  fixedNavigation?: PostNavigationClassName;
}

export interface PostContentProps
  extends Omit<
      PostModalActionsProps,
      'post' | 'onShare' | 'onBookmark' | 'contextMenuId' | 'className'
    >,
    Pick<PostNavigationProps, 'onNextPost' | 'onPreviousPost'>,
    UsePostCommentOptionalProps {
  postById?: PostData;
  isFallback?: boolean;
  className?: ClassName;
  enableAuthorOnboarding?: boolean;
  isLoading?: boolean;
  isModal?: boolean;
  position?: CSSProperties['position'];
}

const BodyContainer = classed(
  'div',
  'flex flex-col max-w-full pb-6 tablet:pb-0 tablet:flex-row',
);

const PageBodyContainer = classed(
  BodyContainer,
  'm-auto w-full max-w-[63.75rem] laptop:border-l laptop:border-theme-divider-tertiary',
);

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 tablet:px-8 tablet:border-r tablet:border-theme-divider-tertiary',
);

export const SCROLL_OFFSET = 80;
export const ONBOARDING_OFFSET = 120;

export function PostContent({
  postById,
  className = {},
  isFallback,
  enableAuthorOnboarding,
  enableShowShareNewComment,
  isLoading,
  isModal,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
}: PostContentProps): ReactElement {
  const { id } = postById?.post || {};

  if (!id && !isFallback && !isLoading) {
    return <Custom404 />;
  }

  const {
    closeNewComment,
    openNewComment,
    onCommentClick,
    updatePostComments,
    onShowShareNewComment,
    parentComment,
    showShareNewComment,
  } = usePostComment(postById?.post, {
    enableShowShareNewComment,
  });
  const {
    requestQuery: upvotedPopup,
    resetUpvoteQuery,
    onShowUpvotedPost,
    onShowUpvotedComment,
  } = useUpvoteQuery();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [permissionNotificationCommentId, setPermissionNotificationCommentId] =
    useState<string>();
  const { alerts } = useContext(AlertContext);
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const { sidebarRendered } = useSidebarRendered();
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const queryClient = useQueryClient();
  const postQueryKey = ['post', id];
  const analyticsOrigin = isModal ? Origin.ArticleModal : Origin.ArticlePage;
  const { subject } = useToastNotification();
  const { sharePost, openSharePost, closeSharePost } =
    useSharePost(analyticsOrigin);
  const { shareComment, openShareComment, closeShareComment } =
    useShareComment(analyticsOrigin);
  const { updatePost } = useUpdatePost();
  const onPostClick = useOnPostClick({ origin: analyticsOrigin });
  const { bookmark, bookmarkToast, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updatePost({ id, update: { bookmarked: true } }),
    onRemoveBookmarkMutate: updatePost({ id, update: { bookmarked: false } }),
  });

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: [id],
      },
    }),
    {
      next: (data: PostsEngaged) => {
        if (data.postsEngaged.id === id) {
          queryClient.setQueryData<PostData>(postQueryKey, (oldPost) => ({
            post: {
              ...oldPost.post,
              ...data.postsEngaged,
            },
          }));
        }
      },
    },
  );

  useEffect(() => {
    if (!postById?.post) {
      return;
    }

    trackEvent(postAnalyticsEvent(`${analyticsOrigin} view`, postById.post));
  }, [postById]);

  useEffect(() => {
    if (enableAuthorOnboarding) {
      setAuthorOnboarding(true);
    }
  }, [enableAuthorOnboarding]);

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const Wrapper = hasNavigation ? BodyContainer : PageBodyContainer;

  if (isLoading) {
    return (
      <Wrapper className={className?.container}>
        <PostLoadingPlaceholder />
      </Wrapper>
    );
  }

  if (!postById?.post) {
    return <Custom404 />;
  }

  const onReadArticle = () => onPostClick({ post: postById.post });

  const postLinkProps = {
    href: postById?.post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: onReadArticle,
    onMouseUp: (event: React.MouseEvent) =>
      event.button === 1 && onReadArticle(),
  };

  const isFixed = position === 'fixed';

  const onShare = () => openSharePost(postById.post);
  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin(AuthTriggers.Bookmark);
      return;
    }
    const targetBookmarkState = !postById?.post.bookmarked;
    trackEvent(
      postAnalyticsEvent(
        postEventName({ bookmarked: targetBookmarkState }),
        postById?.post,
        { extra: { origin } },
      ),
    );
    if (targetBookmarkState) {
      await bookmark({ id: postById?.post.id });
    } else {
      await removeBookmark({ id: postById?.post.id });
    }
    bookmarkToast(targetBookmarkState);
  };

  const onComment = (comment: Comment, isNew?: boolean) => {
    if (isNew) {
      setPermissionNotificationCommentId(comment.id);
    }
    updatePostComments(comment, isNew);
  };

  const showMyFeedArticleAnonymous = sidebarRendered && alerts?.filter;

  const onInitializeOnboardingClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
      extra: JSON.stringify({ origin: analyticsOrigin }),
    });
    onInitializeOnboarding();
  };
  const navigationProps: PostNavigationProps = {
    onPreviousPost,
    onNextPost,
    post: postById.post,
    onBookmark: toggleBookmark,
    onReadArticle,
    onClose,
    onShare,
    inlineActions,
  };

  return (
    <Wrapper
      className={className?.container}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
    >
      <PostContainer className="relative">
        {showMyFeedArticleAnonymous && (
          <PostFeedFiltersOnboarding
            onInitializeOnboarding={onInitializeOnboardingClick}
          />
        )}
        {isFixed && (
          <FixedPostNavigation
            {...navigationProps}
            className={{
              container: classNames(
                'max-w-[63.65rem]',
                className?.fixedNavigation?.container,
              ),
              actions: className?.fixedNavigation?.actions,
            }}
          />
        )}
        <PostNavigation
          {...navigationProps}
          className={{
            container: classNames('pt-6', className?.navigation?.container),
            actions: className?.navigation?.actions,
          }}
        />
        <h1
          className="my-6 font-bold break-words typo-large-title"
          data-testid="post-modal-title"
        >
          {postById.post.title}
        </h1>
        {postById.post.summary && (
          <PostSummary summary={postById.post.summary} />
        )}
        <TagLinks tags={postById.post.tags || []} />
        <PostMetadata
          createdAt={postById.post.createdAt}
          readTime={postById.post.readTime}
          className="mt-4 mb-8"
          typoClassName="typo-callout"
        />
        <a
          {...postLinkProps}
          className="block overflow-hidden mb-10 rounded-2xl cursor-pointer"
          style={{ maxWidth: '25.625rem' }}
        >
          <LazyImage
            imgSrc={postById.post.image}
            imgAlt="Post cover image"
            ratio="49%"
            eager
            fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          />
        </a>
        {postById.post?.toc?.length > 0 && (
          <PostToc
            post={postById.post}
            collapsible
            className="flex laptop:hidden mt-2 mb-4"
          />
        )}
        <PostUpvotesCommentsCount
          post={postById.post}
          onUpvotesClick={(upvotes) =>
            onShowUpvotedPost(postById.post.id, upvotes)
          }
        />
        <PostActions
          onBookmark={toggleBookmark}
          onShare={onShare}
          post={postById.post}
          postQueryKey={postQueryKey}
          onComment={() => openNewComment('comment button')}
          actionsClassName="hidden laptop:flex"
          origin={analyticsOrigin}
        />
        <NewComment
          user={user}
          className="my-6"
          isCommenting={!!parentComment}
          onNewComment={() => openNewComment('start discussion button')}
        />
        <PostComments
          post={postById.post}
          origin={analyticsOrigin}
          onClick={onCommentClick}
          onShare={(comment) => openShareComment(comment, postById.post)}
          onClickUpvote={onShowUpvotedComment}
          permissionNotificationCommentId={permissionNotificationCommentId}
        />
        {authorOnboarding && (
          <AuthorOnboarding
            onSignUp={!user && (() => showLogin(AuthTriggers.Author))}
          />
        )}
      </PostContainer>
      <PostWidgets
        onBookmark={toggleBookmark}
        onShare={onShare}
        onReadArticle={onReadArticle}
        post={postById.post}
        className="pb-8"
        onClose={onClose}
        origin={analyticsOrigin}
      />
      {upvotedPopup.modal && (
        <UpvotedPopupModal
          requestQuery={upvotedPopup.requestQuery}
          placeholderAmount={upvotedPopup.upvotes}
          isOpen={upvotedPopup.modal}
          onRequestClose={resetUpvoteQuery}
        />
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          onRequestClose={closeNewComment}
          {...parentComment}
          onComment={onComment}
        />
      )}
      {postById && showShareNewComment && (
        <ShareNewCommentPopup
          post={postById.post}
          commentId={showShareNewComment}
          onRequestClose={() => onShowShareNewComment(null)}
        />
      )}
      {sharePost && (
        <SharePostModal
          isOpen={!!sharePost}
          post={postById.post}
          origin={analyticsOrigin}
          onRequestClose={closeSharePost}
        />
      )}
      {shareComment && (
        <SharePostModal
          isOpen={!!shareComment}
          post={postById.post}
          comment={shareComment}
          origin={analyticsOrigin}
          onRequestClose={closeShareComment}
        />
      )}
    </Wrapper>
  );
}
