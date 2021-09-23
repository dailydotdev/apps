import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient, QueryClient } from 'react-query';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { Roles } from '@dailydotdev/shared/src/lib/user';
import { NextSeo } from 'next-seo';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import OpenLinkIcon from '@dailydotdev/shared/icons/open_link.svg';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import TrashIcon from '@dailydotdev/shared/icons/trash.svg';
import HammerIcon from '@dailydotdev/shared/icons/hammer.svg';
import FeatherIcon from '@dailydotdev/shared/icons/feather.svg';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { PageContainer } from '@dailydotdev/shared/src/components/utilities';
import { postDateFormat } from '@dailydotdev/shared/src/lib/dateFormat';
import {
  Post,
  POST_BY_ID_QUERY,
  POST_UPVOTES_BY_ID_QUERY,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '@dailydotdev/shared/src/graphql/posts';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import {
  Comment,
  POST_COMMENTS_QUERY,
  COMMENT_UPVOTES_BY_ID_QUERY,
  PostCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { NextSeoProps } from 'next-seo/lib/types';
import { ShareMobile } from '@dailydotdev/shared/src/components/ShareMobile';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { ProfileLink } from '@dailydotdev/shared/src/components/profile/ProfileLink';
import { ownershipGuide } from '@dailydotdev/shared/src/lib/constants';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import { logReadArticle } from '@dailydotdev/shared/src/lib/analytics';
import useSubscription from '@dailydotdev/shared/src/hooks/useSubscription';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import Link from 'next/link';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import useBookmarkPost from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { Connection, Upvote } from '@dailydotdev/shared/src/graphql/common';
import styles from './postPage.module.css';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import PostToc from '../../components/widgets/PostToc';

const UpvotedPopupModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/UpvotedPopupModal'),
);
const NewCommentModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/NewCommentModal'),
);
const DeleteCommentModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/DeleteCommentModal'),
);
const DeletePostModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/DeletePostModal'),
);
const BanPostModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/BanPostModal'),
);
const ShareBar = dynamic(
  () => import('@dailydotdev/shared/src/components/ShareBar'),
  {
    ssr: false,
  },
);
const ShareNewCommentPopup = dynamic(
  () => import('@dailydotdev/shared/src/components/ShareNewCommentPopup'),
  {
    ssr: false,
  },
);
const Custom404 = dynamic(() => import('../404'));

const FurtherReading = dynamic(
  () =>
    import(
      /* webpackChunkName: "furtherReading" */ '../../components/widgets/FurtherReading'
    ),
);

export interface Props {
  id: string;
  postData?: PostData;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const metadataStyle = 'text-theme-label-tertiary typo-callout';
const SourceImage = classed(LazyImage, 'w-8 h-8 rounded-full');
const SourceName = classed(
  'div',
  'text-theme-label-primary font-bold typo-callout',
);

interface ParentComment {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  commentId: string | null;
  post: Post;
  editContent?: string;
  editId?: string;
}

const updatePost =
  (
    queryClient: QueryClient,
    postQueryKey: string[],
    update: (oldPost: PostData) => Partial<Post>,
  ): (() => Promise<() => void>) =>
  async () => {
    await queryClient.cancelQueries(postQueryKey);
    const oldPost = queryClient.getQueryData<PostData>(postQueryKey);
    queryClient.setQueryData<PostData>(postQueryKey, {
      post: {
        ...oldPost.post,
        ...update(oldPost),
      },
    });
    return () => {
      queryClient.setQueryData<PostData>(postQueryKey, oldPost);
    };
  };

const onUpvoteMutation = (
  queryClient: QueryClient,
  postQueryKey: string[],
  upvoted: boolean,
): (() => Promise<() => void>) =>
  updatePost(queryClient, postQueryKey, (oldPost) => ({
    upvoted,
    numUpvotes: oldPost.post.numUpvotes + (upvoted ? 1 : -1),
  }));

const onBookmarkMutation = (
  queryClient: QueryClient,
  postQueryKey: string[],
  bookmarked: boolean,
): (() => Promise<() => void>) =>
  updatePost(queryClient, postQueryKey, () => ({
    bookmarked,
  }));

const PostPage = ({ id, postData }: Props): ReactElement => {
  const router = useRouter();
  const { isFallback } = router;

  if (!isFallback && !id) {
    return <Custom404 />;
  }

  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  // const { nativeShareSupport } = useContext(ProgressiveEnhancementContext);
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [pendingComment, setPendingComment] = useState<{
    comment: Comment;
    parentId: string | null;
  }>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [showUpvotedPopup, setShowUpvotedPopup] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);
  const [showBanPost, setShowBanPost] = useState(false);
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const [upvotes, setUpvotes] = useState<Upvote[]>(() => []);

  const queryClient = useQueryClient();
  const postQueryKey = ['post', id];
  const { data: postById } = useQuery<PostData>(
    postQueryKey,
    () =>
      request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, {
        id,
      }),
    {
      initialData: postData,
      enabled: !!id && tokenRefreshed,
    },
  );

  const handleCommentUpvotes = async (commentId: string) => {
    setUpvotes([]);
    setShowUpvotedPopup(true);

    const req = await request<{ commentUpvotes: Connection<Upvote> }>(
      `${apiUrl}/graphql`,
      COMMENT_UPVOTES_BY_ID_QUERY,
      {
        id: commentId,
      },
    );

    setUpvotes(req.commentUpvotes.edges.map((edge) => edge.node));
  };

  const handleShowUpvotes = async () => {
    setUpvotes([]);
    setShowUpvotedPopup(true);

    const req = await request<{ postUpvotes: Connection<Upvote> }>(
      `${apiUrl}/graphql`,
      POST_UPVOTES_BY_ID_QUERY,
      {
        id,
      },
    );

    setUpvotes(req.postUpvotes.edges.map((edge) => edge.node));
  };

  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      ['post_comments', id],
      () =>
        request(`${apiUrl}/graphql`, POST_COMMENTS_QUERY, {
          postId: id,
        }),
      {
        enabled: !!id && tokenRefreshed,
        refetchInterval: 60 * 1000,
      },
    );

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

  const { upvotePost, cancelPostUpvote } = useUpvotePost({
    onUpvotePostMutate: onUpvoteMutation(queryClient, postQueryKey, true),
    onCancelPostUpvoteMutate: onUpvoteMutation(
      queryClient,
      postQueryKey,
      false,
    ),
  });

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: onBookmarkMutation(queryClient, postQueryKey, true),
    onRemoveBookmarkMutate: onBookmarkMutation(
      queryClient,
      postQueryKey,
      false,
    ),
  });

  const toggleUpvote = () => {
    if (user) {
      if (postById?.post.upvoted) {
        trackEvent(
          postAnalyticsEvent('remove post upvote', postById.post, {
            extra: { origin: 'article page' },
          }),
        );
        return cancelPostUpvote({ id: postById.post.id });
      }
      if (postById) {
        trackEvent(
          postAnalyticsEvent('upvote post', postById.post, {
            extra: { origin: 'article page' },
          }),
        );
        return upvotePost({ id: postById.post.id });
      }
    } else {
      showLogin('upvote', LoginModalMode.ContentQuality);
    }
    return undefined;
  };

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
        trackEvent(
          postAnalyticsEvent('share post', postById.post, {
            extra: { origin: 'article page' },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    }
  };

  const openNewComment = () => {
    if (user) {
      setLastScroll(window.scrollY);
      setParentComment({
        authorName: postById.post.source.name,
        authorImage: postById.post.source.image,
        content: postById.post.title,
        publishDate: postById.post.createdAt,
        commentId: null,
        post: postById.post,
      });
    } else {
      showLogin('comment', LoginModalMode.ContentQuality);
    }
  };

  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent(
      postAnalyticsEvent(
        !postById.post.bookmarked ? 'bookmark post' : 'remove post bookmark',
        postById.post,
        { extra: { origin: 'article page' } },
      ),
    );
    if (!postById.post.bookmarked) {
      await bookmark({ id: postById.post.id });
    } else {
      await removeBookmark({ id: postById.post.id });
    }
  };

  const onCommentClick = (comment: Comment, parentId: string | null) => {
    if (user) {
      setLastScroll(window.scrollY);
      setParentComment({
        authorName: comment.author.name,
        authorImage: comment.author.image,
        content: comment.content,
        publishDate: comment.lastUpdatedAt || comment.createdAt,
        commentId: parentId,
        post: postById.post,
      });
    } else {
      showLogin('comment', LoginModalMode.ContentQuality);
    }
  };

  const onEditClick = (comment: Comment, localParentComment?: Comment) => {
    setLastScroll(window.scrollY);
    const shared = { editContent: comment.content, editId: comment.id };
    if (localParentComment) {
      setParentComment({
        authorName: localParentComment.author.name,
        authorImage: localParentComment.author.image,
        content: localParentComment.content,
        publishDate:
          localParentComment.lastUpdatedAt || localParentComment.createdAt,
        commentId: localParentComment.id,
        post: postById.post,
        ...shared,
      });
    } else {
      setParentComment({
        authorName: postById.post.source.name,
        authorImage: postById.post.source.image,
        content: postById.post.title,
        publishDate: postById.post.createdAt,
        commentId: null,
        post: postById.post,
        ...shared,
      });
    }
  };

  const closeNewComment = () => {
    setParentComment(null);
    document.documentElement.scrollTop = lastScroll;
  };

  const onNewComment = (newComment: Comment, parentId: string | null): void => {
    if (!parentId) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  };

  useEffect(() => {
    if (router?.query.new) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  }, [router.query?.new]);

  useEffect(() => {
    if (router?.query.author) {
      setAuthorOnboarding(true);
    }
  }, [router.query?.author]);

  if (!postById?.post || (isFallback && !id)) {
    return <></>;
  }

  const onLinkClick = async () => {
    trackEvent(
      postAnalyticsEvent('click', postById.post, {
        extra: { origin: 'article page' },
      }),
    );
    await logReadArticle('article page');
  };

  const postLinkProps = {
    href: postById?.post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: onLinkClick,
    onMouseUp: (event: React.MouseEvent) => event.button === 1 && onLinkClick(),
  };

  const seo: NextSeoProps = {
    title: postById?.post.title,
    titleTemplate: '%s | daily.dev',
    description:
      postById?.post.description?.length > 0
        ? postById.post.description
        : `Join us to the discussion about "${postById?.post.title}" on daily.dev ✌️`,
    openGraph: {
      images: [{ url: postById?.post.image }],
      article: {
        publishedTime: postById?.post.createdAt,
        tags: postById?.post.tags,
      },
    },
  };

  const hasUpvotes = postById?.post.numUpvotes > 0;

  return (
    <>
      <PageContainer className="pt-6 pb-20 laptop:pb-6 laptop:self-start laptop:border-theme-divider-tertiary laptop:border-r laptopL:self-center laptopL:border-l">
        <Head>
          <link rel="preload" as="image" href={postById?.post.image} />
        </Head>
        <NextSeo {...seo} />
        <div className="flex items-center mb-2">
          <Link
            href={`/sources/${postById?.post.source.id}`}
            passHref
            prefetch={false}
          >
            <a
              className="flex no-underline cursor-pointer"
              {...(!postById?.post.author
                ? {}
                : getTooltipProps(postById?.post.source.name, {
                    position: 'down',
                  }))}
            >
              <SourceImage
                imgSrc={postById?.post.source.image}
                imgAlt={postById?.post.source.name}
                background="var(--theme-background-secondary)"
              />
            </a>
          </Link>
          {postById?.post.author ? (
            <ProfileLink
              user={postById.post.author}
              data-testid="authorLink"
              disableTooltip
              className="ml-2 mr-auto flex-1"
            >
              <SourceImage
                imgSrc={postById.post.author.image}
                imgAlt={postById.post.author.name}
                background="var(--theme-background-secondary)"
              />
              <SourceName className="ml-2 flex-1">
                {postById.post.author.name}
              </SourceName>
            </ProfileLink>
          ) : (
            <div className="flex flex-col flex-1 mx-2">
              <SourceName>{postById?.post.source.name}</SourceName>
            </div>
          )}
          <Button
            className="btn-tertiary"
            icon={<OpenLinkIcon />}
            tag="a"
            {...postLinkProps}
          />
          {user?.roles?.indexOf(Roles.Moderator) > -1 && (
            <>
              <Button
                className="btn-tertiary"
                icon={<HammerIcon />}
                onClick={() => setShowBanPost(true)}
                {...getTooltipProps('Mighty ban hammer')}
              />
              <Button
                className="btn-tertiary"
                icon={<TrashIcon />}
                onClick={() => setShowDeletePost(true)}
                {...getTooltipProps('Delete post')}
              />
            </>
          )}
        </div>

        <a {...postLinkProps} className="cursor-pointer">
          <h1 className="my-2 font-bold typo-title2">{postById?.post.title}</h1>
        </a>

        <div className="flex items-center flex-wrap mt-2 mb-1">
          <time dateTime={postById?.post?.createdAt} className={metadataStyle}>
            {postById && postDateFormat(postById.post.createdAt)}
          </time>
          {!!postById?.post.readTime && (
            <div className="w-0.5 h-0.5 mx-1 bg-theme-label-tertiary rounded-full" />
          )}
          {!!postById?.post.readTime && (
            <div data-testid="readTime" className={metadataStyle}>
              {postById?.post.readTime}m read time
            </div>
          )}
        </div>
        <div className="mt-3 mb-4 flex flex-wrap gap-2">
          {postById?.post.tags.map((t) => (
            <Link href={`/tags/${t}`} passHref key={t}>
              <Button tag="a" className="btn-tertiaryFloat xsmall">
                #{t}
              </Button>
            </Link>
          ))}
        </div>
        {postById?.post?.toc?.length > 0 && (
          <PostToc
            post={postById.post}
            collapsible
            className="flex laptop:hidden mt-2 mb-4"
          />
        )}
        <a
          {...postLinkProps}
          className="block mt-2 rounded-2xl overflow-hidden cursor-pointer"
        >
          <LazyImage
            imgSrc={postById?.post.image}
            imgAlt="Post cover image"
            ratio="49%"
            eager
          />
        </a>
        <div
          className="flex items-center gap-x-4 my-4 text-theme-label-tertiary typo-callout"
          data-testid="statsBar"
        >
          {postById?.post.views > 0 && (
            <span>{postById?.post.views.toLocaleString()} Views</span>
          )}
          {hasUpvotes && (
            <Button
              className="btn-tertiary"
              onClick={() => handleShowUpvotes()}
            >
              {postById?.post.numUpvotes.toLocaleString()} Upvotes
            </Button>
          )}
          {postById?.post.numComments > 0 && (
            <span>{postById?.post.numComments.toLocaleString()} Comments</span>
          )}
        </div>
        <div className="flex justify-between py-2 border-t border-b border-theme-divider-tertiary">
          <QuaternaryButton
            id="upvote-post-btn"
            pressed={postById?.post.upvoted}
            onClick={toggleUpvote}
            icon={<UpvoteIcon />}
            aria-label="Upvote"
            responsiveLabelClass="mobileL:flex"
            className="btn-tertiary-avocado"
          >
            Upvote
          </QuaternaryButton>
          <QuaternaryButton
            id="comment-post-btn"
            pressed={postById?.post.commented}
            onClick={openNewComment}
            icon={<CommentIcon />}
            aria-label="Comment"
            responsiveLabelClass="mobileL:flex"
            className="btn-tertiary-avocado"
          >
            Comment
          </QuaternaryButton>
          <QuaternaryButton
            id="bookmark-post-btn"
            pressed={postById?.post.bookmarked}
            onClick={toggleBookmark}
            icon={<BookmarkIcon />}
            responsiveLabelClass="mobileL:flex"
            className="btn-tertiary-bun"
          >
            Bookmark
          </QuaternaryButton>
          {/* <QuaternaryButton */}
          {/*  id="share-post-btn" */}
          {/*  onClick={sharePost} */}
          {/*  {...getTooltipProps('Share')} */}
          {/*  icon={<ShareIcon />} */}
          {/*  style={{ visibility: nativeShareSupport ? 'visible' : 'hidden' }} */}
          {/*  aria-label="Share" */}
          {/*  responsiveClass="mobileL:flex" */}
          {/*  className="btn-tertiary" */}
          {/* > */}
          {/*  Share */}
          {/* </QuaternaryButton> */}
        </div>
        {comments?.postComments?.edges?.length > 0 && (
          <>
            {comments?.postComments.edges.map((e) => (
              <MainComment
                comment={e.node}
                key={e.node.id}
                onComment={onCommentClick}
                onDelete={(comment, parentId) =>
                  setPendingComment({ comment, parentId })
                }
                onEdit={onEditClick}
                onShowUpvotes={handleCommentUpvotes}
                postAuthorId={postById?.post?.author?.id}
              />
            ))}
            <div className="my-6" />
          </>
        )}
        {comments?.postComments?.edges?.length === 0 && !isLoadingComments && (
          <div className="text-center text-theme-label-quaternary typo-subhead my-10">
            Be the first to comment.
          </div>
        )}
        {authorOnboarding ? (
          <section
            className={classNames(
              'p-6 bg-theme-bg-secondary rounded-2xl',
              styles.authorOnboarding,
            )}
          >
            <div
              className={classNames(
                'grid items-center gap-x-3',
                styles.authorOnboardingHeader,
              )}
              style={{ gridTemplateColumns: 'repeat(2, max-content)' }}
            >
              <FeatherIcon />
              <h3>Author</h3>
              <h2>Is this article yours?</h2>
            </div>
            <p>Claim ownership and get the following perks:</p>
            <ol>
              <li>
                Get notified when your articles are picked by daily.dev feed
              </li>
              <li>Exclusive author badge on your comments</li>
              <li>Analytics report for every post you wrote</li>
              <li>
                Gain reputation points by earning upvotes on articles you wrote
              </li>
            </ol>
            <div
              className="grid grid-flow-col gap-x-4 mt-6"
              data-testid="authorOnboarding"
              style={{
                maxWidth: sizeN(74),
                gridTemplateColumns: '1fr max-content',
              }}
            >
              {!user && (
                <Button
                  className="btn-primary"
                  onClick={() => showLogin('author')}
                >
                  Sign up
                </Button>
              )}
              <Button
                className="btn-secondary"
                tag="a"
                href={ownershipGuide}
                target="_blank"
                rel="noopener"
              >
                Learn more
              </Button>
            </div>
          </section>
        ) : (
          <>
            <ShareMobile share={sharePost} />
            {postById?.post && tokenRefreshed && (
              <FurtherReading
                currentPost={postById.post}
                className={classNames(
                  styles.similarPosts,
                  'laptop:absolute laptop:left-full laptop:ml-6',
                )}
              />
            )}
          </>
        )}
        <div
          className={classNames(
            'fixed inset-x-0 bottom-0 w-full py-3 px-4 bg-theme-bg-primary z-2 laptop:relative laptop:px-0 laptop:pb-0 laptop:pt-4 laptop:bg-none laptop:mt-auto',
            styles.newComment,
          )}
        >
          <button
            type="button"
            className={classNames(
              'flex w-full h-10 items-center px-4 bg-theme-bg-secondary text-theme-label-secondary border-none rounded-2xl cursor-pointer typo-callout focus-outline',
              styles.discussionBar,
            )}
            onClick={openNewComment}
          >
            {user && (
              <LazyImage
                imgSrc={user.image}
                imgAlt="Your profile image"
                className="w-7 h-7 rounded-full -ml-2 mr-3"
              />
            )}
            Start the discussion...
          </button>
        </div>
      </PageContainer>
      <UpvotedPopupModal
        upvotes={upvotes}
        isOpen={showUpvotedPopup}
        onRequestClose={() => setShowUpvotedPopup(false)}
      />
      {pendingComment && (
        <DeleteCommentModal
          isOpen={!!pendingComment}
          onRequestClose={() => setPendingComment(null)}
          commentId={pendingComment.comment.id}
          parentId={pendingComment.parentId}
          postId={postById.post.id}
          ariaHideApp={!(process?.env?.NODE_ENV === 'test')}
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
      {postById && <ShareBar post={postById.post} />}
      {postById && showShareNewComment && (
        <ShareNewCommentPopup
          post={postById.post}
          onRequestClose={() => setShowShareNewComment(false)}
        />
      )}
      {showDeletePost && (
        <DeletePostModal
          postId={id}
          isOpen={showDeletePost}
          onRequestClose={() => setShowDeletePost(false)}
        />
      )}
      {showBanPost && (
        <BanPostModal
          postId={id}
          isOpen={showBanPost}
          onRequestClose={() => setShowBanPost(false)}
        />
      )}
    </>
  );
};

PostPage.getLayout = getMainLayout;
PostPage.layoutProps = {
  responsive: false,
};

export default PostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  const { id } = params;
  try {
    const postData = await request<PostData>(
      `${apiUrl}/graphql`,
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    return {
      props: {
        id,
        postData,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'NOT_FOUND') {
      return {
        props: { id: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
