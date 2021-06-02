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
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '@dailydotdev/shared/src/graphql/posts';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import {
  Comment,
  POST_COMMENTS_QUERY,
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
import {
  logReadArticle,
  trackEvent,
} from '@dailydotdev/shared/src/lib/analytics';
import useSubscription from '@dailydotdev/shared/src/hooks/useSubscription';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import Link from 'next/link';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import useBookmarkPost from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import styles from './postPage.module.css';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';

declare module 'graphql-request/dist/types' {
  interface GraphQLError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>;
  }
}

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
  postId: string;
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
  // const { nativeShareSupport } = useContext(ProgressiveEnhancementContext);
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [pendingComment, setPendingComment] =
    useState<{
      comment: Comment;
      parentId: string | null;
    }>(null);
  const [showShareNewComment, setShowShareNewComment] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [showDeletePost, setShowDeletePost] = useState(false);
  const [showBanPost, setShowBanPost] = useState(false);
  const [authorOnboarding, setAuthorOnboarding] = useState(false);

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

  const { data: comments } = useQuery<PostCommentsData>(
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
        trackEvent({ category: 'Post', action: 'Upvote', label: 'Remove' });
        return cancelPostUpvote({ id: postById.post.id });
      } else if (postById) {
        trackEvent({ category: 'Post', action: 'Add', label: 'Remove' });
        return upvotePost({ id: postById.post.id });
      }
    } else {
      showLogin(LoginModalMode.ContentQuality);
    }
  };

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
        trackEvent({ category: 'Post', action: 'Share', label: 'Native' });
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
        postId: postById.post.id,
      });
    } else {
      showLogin(LoginModalMode.ContentQuality);
    }
  };

  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin();
      return;
    }
    trackEvent({
      category: 'Post',
      action: 'Bookmark',
      label: !postById.post.bookmarked ? 'Add' : 'Remove',
    });
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
        postId: postById.post.id,
      });
    } else {
      showLogin(LoginModalMode.ContentQuality);
    }
  };

  const onEditClick = (comment: Comment, parentComment?: Comment) => {
    setLastScroll(window.scrollY);
    const shared = { editContent: comment.content, editId: comment.id };
    if (parentComment) {
      setParentComment({
        authorName: parentComment.author.name,
        authorImage: parentComment.author.image,
        content: parentComment.content,
        publishDate: parentComment.lastUpdatedAt || parentComment.createdAt,
        commentId: parentComment.id,
        postId: postById.post.id,
        ...shared,
      });
    } else {
      setParentComment({
        authorName: postById.post.source.name,
        authorImage: postById.post.source.image,
        content: postById.post.title,
        publishDate: postById.post.createdAt,
        commentId: null,
        postId: postById.post.id,
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

  const postLinkProps = {
    href: postById?.post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: async () => {
      trackEvent({ category: 'Post', action: 'Click' });
      await logReadArticle('article page');
    },
  };

  const seo: NextSeoProps = {
    title: postById?.post.title,
    titleTemplate: '%s | daily.dev',
    description: `Join us to the discussion about "${postById?.post.title}" on daily.dev ✌️`,
    openGraph: {
      images: [{ url: postById?.post.image }],
      article: {
        publishedTime: postById?.post.createdAt,
        tags: postById?.post.tags,
      },
    },
  };

  const tags = postById?.post.tags.map((t) => `#${t}`).join(' ');

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
              className="ml-2 mr-auto"
            >
              <SourceImage
                imgSrc={postById.post.author.image}
                imgAlt={postById.post.author.name}
                background="var(--theme-background-secondary)"
              />
              <SourceName className="ml-2">
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
        <h1 className="my-2 font-bold typo-title2">{postById?.post.title}</h1>
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
        <div className="mb-4 text-theme-label-quaternary font-bold typo-subhead">
          {tags !== '#' && tags}
        </div>
        <a
          {...postLinkProps}
          className="block mt-2 rounded-2xl overflow-hidden cursor-pointer"
        >
          <LazyImage
            imgSrc={postById?.post.image}
            imgAlt="Post cover image"
            ratio="49%"
            eager={true}
          />
        </a>
        <div
          className="flex gap-x-4 my-4 text-theme-label-tertiary typo-callout"
          data-testid="statsBar"
        >
          {postById?.post.views > 0 && (
            <span>{postById?.post.views.toLocaleString()} Views</span>
          )}
          {postById?.post.numUpvotes > 0 && (
            <span>{postById?.post.numUpvotes.toLocaleString()} Upvotes</span>
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
          {/*<QuaternaryButton*/}
          {/*  id="share-post-btn"*/}
          {/*  onClick={sharePost}*/}
          {/*  {...getTooltipProps('Share')}*/}
          {/*  icon={<ShareIcon />}*/}
          {/*  style={{ visibility: nativeShareSupport ? 'visible' : 'hidden' }}*/}
          {/*  aria-label="Share"*/}
          {/*  responsiveClass="mobileL:flex"*/}
          {/*  className="btn-tertiary"*/}
          {/*>*/}
          {/*  Share*/}
          {/*</QuaternaryButton>*/}
        </div>
        {comments?.postComments.edges.map((e) => (
          <MainComment
            comment={e.node}
            key={e.node.id}
            onComment={onCommentClick}
            onDelete={(comment, parentId) =>
              setPendingComment({ comment, parentId })
            }
            onEdit={onEditClick}
            postAuthorId={postById?.post?.author?.id}
          />
        ))}
        <div className="h-px my-6 bg-theme-divider-tertiary" />
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
              <Button className="btn-primary" onClick={() => showLogin()}>
                Sign up
              </Button>
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
                postId={id}
                tags={postById.post.tags}
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
            className="flex w-full h-10 items-center px-4 bg-theme-bg-secondary text-theme-label-secondary border-none rounded-2xl cursor-pointer typo-callout focus-outline"
            onClick={openNewComment}
          >
            {user && (
              <LazyImage
                imgSrc={user.image}
                imgAlt="Your profile image"
                className="w-7 h-7 rounded-full -ml-2 mr-3"
              />
            )}
            Write your comment...
          </button>
        </div>
      </PageContainer>
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
    } else {
      throw err;
    }
  }
}
