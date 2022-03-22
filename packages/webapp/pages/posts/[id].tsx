import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from 'react-query';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { NextSeo } from 'next-seo';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import {
  pageBorders,
  PageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import {
  POST_BY_ID_QUERY,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
  POST_UPVOTES_BY_ID_QUERY,
} from '@dailydotdev/shared/src/graphql/posts';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Comment,
  COMMENT_UPVOTES_BY_ID_QUERY,
} from '@dailydotdev/shared/src/graphql/comments';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import useSubscription from '@dailydotdev/shared/src/hooks/useSubscription';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import PostMetadata from '@dailydotdev/shared/src/components/cards/PostMetadata';
import PostSummary from '@dailydotdev/shared/src/components/cards/PostSummary';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { TagLinks } from '@dailydotdev/shared/src/components/TagLinks';
import PostToc from '../../components/widgets/PostToc';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { NewComment } from '../../components/posts/NewComment';
import { PostWidgets } from '../../components/posts/PostWidgets';
import { AuthorOnboarding } from '../../components/posts/AuthorOnboarding';
import { PostActions } from '../../components/posts/PostActions';
import { PostUpvotesCommentsCount } from '../../components/posts/PostUpvotesCommentsCount';
import { PostHeader } from '../../components/posts/PostHeader';
import {
  ParentComment,
  PostComments,
} from '../../components/posts/PostComments';

const UpvotedPopupModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/UpvotedPopupModal'),
);
const NewCommentModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/NewCommentModal'),
);
const ShareNewCommentPopup = dynamic(
  () => import('@dailydotdev/shared/src/components/ShareNewCommentPopup'),
  {
    ssr: false,
  },
);
const Custom404 = dynamic(() => import('../404'));

export interface Props {
  id: string;
  postData?: PostData;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const DEFAULT_UPVOTES_PER_PAGE = 50;

const getUpvotedPopupInitialState = () => ({
  upvotes: 0,
  modal: false,
  requestQuery: null,
});

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
  const [showShareNewComment, setShowShareNewComment] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [upvotedPopup, setUpvotedPopup] = useState(getUpvotedPopupInitialState);
  const [authorOnboarding, setAuthorOnboarding] = useState(false);

  useEffect(() => {
    if (router?.query.author) {
      setAuthorOnboarding(true);
    }
  }, [router.query?.author]);

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

  useEffect(() => {
    if (router?.query.new) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  }, [router.query?.new]);

  if (!postById?.post || (isFallback && !id)) {
    return <></>;
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

  return (
    <>
      <PageContainer
        className={classNames(
          'laptop:pb-6 laptop:self-stretch pb-20 laptopL:pb-0',
          pageBorders,
        )}
      >
        <Head>
          <link rel="preload" as="image" href={postById.post.image} />
        </Head>
        <NextSeo {...seo} />
        <a
          {...postLinkProps}
          className="block overflow-hidden mb-10 rounded-b-2xl cursor-pointer"
        >
          <LazyImage
            imgSrc={postById.post.image}
            imgAlt="Post cover image"
            ratio="21%"
            eager
            fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          />
        </a>
        <PostHeader post={postById.post} />
        <a {...postLinkProps} className="cursor-pointer">
          <h1 className="my-2 font-bold typo-large-title">
            {postById.post.title}
          </h1>
        </a>
        {postById.post.summary && (
          <PostSummary summary={postById.post.summary} />
        )}
        <PostMetadata
          createdAt={postById.post.createdAt}
          readTime={postById.post.readTime}
          className="mt-2 mb-1"
          typoClassName="typo-callout"
        />
        <TagLinks tags={postById.post.tags || []} />
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
        <PostWidgets post={postById.post} />
      </PageContainer>

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
    </>
  );
};

PostPage.getLayout = getMainLayout;

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
