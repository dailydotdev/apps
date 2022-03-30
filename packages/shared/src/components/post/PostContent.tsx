import classNames from 'classnames';
import request from 'graphql-request';
import dynamic from 'next/dynamic';
import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  UIEventHandler,
  useContext,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { Comment, COMMENT_UPVOTES_BY_ID_QUERY } from '../../graphql/comments';
import {
  ParentComment,
  Post,
  PostData,
  PostsEngaged,
  POSTS_ENGAGED_SUBSCRIPTION,
  POST_BY_ID_QUERY,
  POST_UPVOTES_BY_ID_QUERY,
} from '../../graphql/posts';
import useSubscription from '../../hooks/useSubscription';
import { apiUrl } from '../../lib/config';
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
import { PostModalActions, PostModalActionsProps } from './PostModalActions';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import classed from '../../lib/classed';

const UpvotedPopupModal = dynamic(() => import('../modals/UpvotedPopupModal'));
const NewCommentModal = dynamic(() => import('../modals/NewCommentModal'));
const ShareNewCommentPopup = dynamic(() => import('../ShareNewCommentPopup'), {
  ssr: false,
});
const Custom404 = dynamic(() => import('../Custom404'));

export interface PostContentProps extends Omit<WrapperProps, 'post'> {
  id: string;
  postData?: PostData;
  authorOnboarding?: boolean;
  seo?: ReactNode;
  isFallback?: boolean;
  className?: string;
}

const DEFAULT_UPVOTES_PER_PAGE = 50;

const getUpvotedPopupInitialState = () => ({
  upvotes: 0,
  modal: false,
  requestQuery: null,
});

interface WrapperProps extends Omit<PostModalActionsProps, 'post'> {
  children?: ReactNode;
  navigation?: PostNavigationProps;
  post?: Post;
  position?: CSSProperties['position'];
  isLoading?: boolean;
  onScroll?: UIEventHandler<HTMLDivElement>;
}

const BodyContainer = classed(
  'div',
  'flex flex-col tablet:flex-row max-w-[100vw]',
);

const Wrapper = ({
  children,
  navigation,
  post,
  onClose,
  onScroll,
  isLoading,
  position = 'relative',
}: WrapperProps) => {
  if (!navigation || isLoading) {
    return (
      <BodyContainer className="m-auto w-full max-w-[63.75rem]">
        {children}
      </BodyContainer>
    );
  }

  const isFixed = position === 'fixed';
  const padding = isFixed ? 'py-4' : 'py-6';

  return (
    <div
      className="flex overflow-y-auto relative flex-col h-full"
      onScroll={onScroll}
    >
      <header
        className={classNames(
          'flex z-3 w-full bg-theme-bg-primary ease-linear pl-8',
          isFixed &&
            'bg-theme-bg-secondary border-b border-theme-divider-tertiary laptop:max-w-[63.65rem]',
          position,
        )}
      >
        {navigation && (
          <PostNavigation
            {...navigation}
            className={classNames(
              'flex flex-1 pr-8 tablet:border-r tablet:border-theme-divider-tertiary',
              padding,
            )}
          />
        )}
        <PostModalActions
          inlineActions={isFixed}
          post={post}
          onClose={onClose}
          className={classNames(
            'px-6 w-full',
            padding,
            isFixed
              ? 'laptop:max-w-[23.65rem] tablet:max-w-[19.25rem]'
              : 'laptop:max-w-[23.1rem] tablet:max-w-[18.75rem]',
          )}
        />
      </header>
      <BodyContainer>{children}</BodyContainer>
    </div>
  );
};

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-8 pb-20 laptop:max-w-[40rem] tablet:border-r tablet:border-theme-divider-tertiary',
);

export function PostContent({
  id,
  seo,
  postData,
  className,
  isFallback,
  authorOnboarding = false,
  navigation,
  onClose,
}: PostContentProps): ReactElement {
  if (!id && !isFallback) {
    return <Custom404 />;
  }

  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [upvotedPopup, setUpvotedPopup] = useState(getUpvotedPopupInitialState);
  const queryClient = useQueryClient();
  const postQueryKey = ['post', id];
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const { data: postById, isLoading } = useQuery<PostData>(
    postQueryKey,
    () => request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, { id }),
    { initialData: postData, enabled: !!id && tokenRefreshed },
  );

  const handleShowUpvotedPost = (upvotes: number) => {
    setUpvotedPopup({
      modal: true,
      upvotes,
      requestQuery: {
        queryKey: ['postUpvotes', id],
        query: POST_UPVOTES_BY_ID_QUERY,
        params: { id, first: DEFAULT_UPVOTES_PER_PAGE },
      },
    });
  };

  const handleShowUpvotedComment = (commentId: string, upvotes: number) => {
    setUpvotedPopup({
      modal: true,
      upvotes,
      requestQuery: {
        queryKey: ['commentUpvotes', commentId],
        query: COMMENT_UPVOTES_BY_ID_QUERY,
        params: { id: commentId, first: DEFAULT_UPVOTES_PER_PAGE },
      },
    });
  };

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: [id],
      },
    }),
    {
      next: (data: PostsEngaged) => {
        queryClient.setQueryData<PostData>(postQueryKey, (oldPost) => ({
          post: {
            ...oldPost.post,
            ...data.postsEngaged,
          },
        }));
      },
    },
  );

  const closeNewComment = () => {
    setParentComment(null);
    document.documentElement.scrollTop = lastScroll;
  };

  const onNewComment = (_: Comment, parentId: string | null): void => {
    if (!parentId) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  };

  const openNewComment = () => {
    if (user) {
      setLastScroll(window.scrollY);
      setParentComment({
        authorName: postById.post.source.name,
        authorImage: postById.post.source.image,
        content: postById.post.title,
        contentHtml: postById.post.title,
        publishDate: postById.post.createdAt,
        commentId: null,
        post: postById.post,
      });
    } else {
      showLogin('comment');
    }
  };

  const onCommentClick = (parent: ParentComment) => {
    setLastScroll(window.scrollY);
    setParentComment(parent);
  };

  const hasNavigation = !!navigation;

  if (isLoading) {
    return (
      <Wrapper isLoading>
        <PostLoadingPlaceholder />
      </Wrapper>
    );
  }

  if (!postById?.post) {
    return <Custom404 />;
  }

  const onLinkClick = async () => {
    trackEvent(
      postAnalyticsEvent('click', postById.post, {
        extra: { origin: 'article page' },
      }),
    );
  };

  const postLinkProps = {
    href: postById?.post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: onLinkClick,
    onMouseUp: (event: React.MouseEvent) => event.button === 1 && onLinkClick(),
  };

  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    if (!hasNavigation) {
      return;
    }

    if (e.currentTarget.scrollTop > 40) {
      if (position !== 'fixed') {
        setPosition('fixed');
      }
      return;
    }

    if (position !== 'relative') {
      setPosition('relative');
    }
  };

  return (
    <Wrapper
      onClose={onClose}
      onScroll={onScroll}
      navigation={navigation}
      post={postById.post}
      className={className}
      position={position}
    >
      <PostContainer
        className={classNames(position === 'fixed' && 'pt-[5rem]', className)}
      >
        {seo}
        <a {...postLinkProps} className="cursor-pointer">
          <h1 className="font-bold typo-large-title">{postById.post.title}</h1>
        </a>
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
          onUpvotesClick={handleShowUpvotedPost}
        />
        <PostActions
          post={postById.post}
          postQueryKey={postQueryKey}
          onComment={openNewComment}
          actionsClassName="hidden laptop:flex"
        />
        <PostComments
          post={postById.post}
          onClick={onCommentClick}
          onClickUpvote={handleShowUpvotedComment}
        />
        {authorOnboarding && (
          <AuthorOnboarding onSignUp={!user && (() => showLogin('author'))} />
        )}
        <NewComment user={user} onNewComment={openNewComment} />
      </PostContainer>
      <PostWidgets
        hasNavigation={hasNavigation}
        post={postById.post}
        isNavigationFixed={position === 'fixed'}
        className="pb-20"
      />
      {upvotedPopup.modal && (
        <UpvotedPopupModal
          requestQuery={upvotedPopup.requestQuery}
          isOpen={upvotedPopup.modal}
          listPlaceholderProps={{ placeholderAmount: upvotedPopup.upvotes }}
          onRequestClose={() => setUpvotedPopup(getUpvotedPopupInitialState())}
        />
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          onRequestClose={closeNewComment}
          {...parentComment}
          ariaHideApp={!(process?.env?.NODE_ENV === 'test')}
          onComment={onNewComment}
        />
      )}
      {postById && showShareNewComment && (
        <ShareNewCommentPopup
          post={postById.post}
          onRequestClose={() => setShowShareNewComment(false)}
        />
      )}
    </Wrapper>
  );
}
