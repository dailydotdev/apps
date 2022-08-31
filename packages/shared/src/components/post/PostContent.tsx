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
import { PostNavigation, PostNavigationProps } from './PostNavigation';
import { PostModalActionsProps } from './PostModalActions';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import classed from '../../lib/classed';
import styles from '../utilities.module.css';
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
import FeaturesContext from '../../contexts/FeaturesContext';
import { Origin } from '../../lib/analytics';
import { useShareComment } from '../../hooks/useShareComment';
import useOnPostClick from '../../hooks/useOnPostClick';

const UpvotedPopupModal = dynamic(() => import('../modals/UpvotedPopupModal'));
const NewCommentModal = dynamic(() => import('../modals/NewCommentModal'));
const ShareNewCommentPopup = dynamic(() => import('../ShareNewCommentPopup'), {
  ssr: false,
});
const SharePostModal = dynamic(() => import('../modals/ShareModal'));
const Custom404 = dynamic(() => import('../Custom404'));

export interface PostContentProps
  extends Omit<
      PostModalActionsProps,
      | 'post'
      | 'onShare'
      | 'onBookmark'
      | 'contextMenuId'
      | 'additionalInteractionButtonFeature'
    >,
    Partial<Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'>>,
    UsePostCommentOptionalProps {
  postById?: PostData;
  isFallback?: boolean;
  className?: string;
  enableAuthorOnboarding?: boolean;
  isLoading?: boolean;
  isModal?: boolean;
  position?: CSSProperties['position'];
}

const BodyContainer = classed(
  'div',
  'flex flex-col tablet:flex-row max-w-[100vw] pb-6 tablet:pb-0',
);

const PageBodyContainer = classed(
  BodyContainer,
  'm-auto w-full max-w-[63.75rem] laptop:border-l laptop:border-theme-divider-tertiary',
);

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-8 tablet:pb-20 tablet:border-r tablet:border-theme-divider-tertiary',
);

export const SCROLL_OFFSET = 80;

export function PostContent({
  postById,
  className,
  isFallback,
  enableAuthorOnboarding,
  enableShowShareNewComment,
  isLoading,
  isModal,
  position,
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
  const { additionalInteractionButtonFeature } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
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
  const { bookmark, removeBookmark } = useBookmarkPost({
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
      <Wrapper className={className}>
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
  const padding = isFixed ? 'py-4' : 'pt-6';

  const onShare = () => openSharePost(postById.post);
  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent(
      postAnalyticsEvent(
        postEventName({ bookmarked: !postById?.post.bookmarked }),
        postById?.post,
        { extra: { origin } },
      ),
    );
    if (!postById?.post.bookmarked) {
      await bookmark({ id: postById?.post.id });
    } else {
      await removeBookmark({ id: postById?.post.id });
    }
  };

  return (
    <Wrapper
      className={className}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
    >
      <PostContainer
        className={classNames(
          'relative',
          isFixed && 'pt-16',
          isFixed && !hasNavigation && 'tablet:pt-0',
        )}
      >
        <PostNavigation
          onPreviousPost={onPreviousPost}
          onNextPost={onNextPost}
          className={classNames(
            !hasNavigation && !isFixed && 'tablet:pt-0',
            !hasNavigation ? 'flex laptop:hidden' : 'flex',
            padding,
            position,
            isFixed &&
              'z-3 w-full bg-theme-bg-secondary border-b border-theme-divider-tertiary px-6 top-0 -ml-8',
            isFixed && styles.fixedPostsNavigation,
          )}
          shouldDisplayTitle={isFixed}
          post={postById.post}
          onReadArticle={onReadArticle}
          onClose={onClose}
          isModal={isModal}
          additionalInteractionButtonFeature={
            additionalInteractionButtonFeature
          }
          onBookmark={toggleBookmark}
          onShare={onShare}
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
          className={classNames(
            'block overflow-hidden mb-10 rounded-2xl cursor-pointer',
            styles.clickableImg,
          )}
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
          additionalInteractionButtonFeature={
            additionalInteractionButtonFeature
          }
          onBookmark={toggleBookmark}
          onShare={onShare}
          post={postById.post}
          postQueryKey={postQueryKey}
          onComment={() => openNewComment('comment button')}
          actionsClassName="hidden laptop:flex"
          origin={analyticsOrigin}
        />
        <PostComments
          post={postById.post}
          origin={analyticsOrigin}
          onClick={onCommentClick}
          onShare={(comment) => openShareComment(comment, postById.post)}
          onClickUpvote={onShowUpvotedComment}
        />
        {authorOnboarding && (
          <AuthorOnboarding onSignUp={!user && (() => showLogin('author'))} />
        )}
        <NewComment
          user={user}
          onNewComment={() => openNewComment('start discussion button')}
        />
      </PostContainer>
      <PostWidgets
        additionalInteractionButtonFeature={additionalInteractionButtonFeature}
        onBookmark={toggleBookmark}
        onShare={onShare}
        onReadArticle={onReadArticle}
        post={postById.post}
        isNavigationFixed={hasNavigation && isFixed}
        className="pb-20"
        onClose={onClose}
        origin={analyticsOrigin}
      />
      {upvotedPopup.modal && (
        <UpvotedPopupModal
          requestQuery={upvotedPopup.requestQuery}
          isOpen={upvotedPopup.modal}
          listPlaceholderProps={{ placeholderAmount: upvotedPopup.upvotes }}
          onRequestClose={resetUpvoteQuery}
        />
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          onRequestClose={closeNewComment}
          {...parentComment}
          onComment={updatePostComments}
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
