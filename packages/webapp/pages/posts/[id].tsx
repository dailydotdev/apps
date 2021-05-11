/** @jsx jsx */
import { css, jsx } from '@emotion/react';
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
import styled from '@emotion/styled';
import { NextSeo } from 'next-seo';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import {
  typoBody,
  typoCallout,
  typoFootnote,
  typoSubhead,
  typoTitle2,
} from '../../styles/typography';
import OpenLinkIcon from '@dailydotdev/shared/icons/open_link.svg';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import TrashIcon from '@dailydotdev/shared/icons/trash.svg';
import HammerIcon from '@dailydotdev/shared/icons/hammer.svg';
import FeatherIcon from '@dailydotdev/shared/icons/feather.svg';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import {
  PageContainer,
  RoundedImage,
} from '@dailydotdev/shared/src/components/utilities';
import { postDateFormat } from '@dailydotdev/shared/src/lib/dateFormat';
import {
  Post,
  POST_BY_ID_QUERY,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../../graphql/posts';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import AuthContext from '../../contexts/AuthContext';
import MainComment from '../../components/comments/MainComment';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../../graphql/comments';
import { laptop } from '../../styles/media';
import { focusOutline } from '../../styles/helpers';
import { NextSeoProps } from 'next-seo/lib/types';
import { ShareMobile } from '../../components/ShareMobile';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { ProfileLink } from '../../components/profile/ProfileLink';
import { ownershipGuide } from '@dailydotdev/shared/src/lib/constants';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { LoginModalMode } from '../../components/modals/LoginModal';
import {
  logReadArticle,
  trackEvent,
} from '@dailydotdev/shared/src/lib/analytics';
import useSubscription from '../../hooks/useSubscription';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import Link from 'next/link';
import useUpvotePost from '../../hooks/useUpvotePost';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import styles from '../../styles/postPage.module.css';
import classNames from 'classnames';

const NewCommentModal = dynamic(
  () => import('../../components/modals/NewCommentModal'),
);
const DeleteCommentModal = dynamic(
  () => import('../../components/modals/DeleteCommentModal'),
);
const DeletePostModal = dynamic(
  () => import('../../components/modals/DeletePostModal'),
);
const BanPostModal = dynamic(
  () => import('../../components/modals/BanPostModal'),
);
const ShareBar = dynamic(() => import('../../components/ShareBar'), {
  ssr: false,
});
const ShareNewCommentPopup = dynamic(
  () => import('../../components/ShareNewCommentPopup'),
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

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${sizeN(2)};
`;

const PostInfoSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 ${sizeN(2)};
`;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: ${sizeN(2)} 0 ${sizeN(1)};
`;

const metadataStyle = css`
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

const MetadataSeparator = styled.div`
  width: ${sizeN(0.5)};
  height: ${sizeN(0.5)};
  margin: 0 ${sizeN(1)};
  background: var(--theme-label-tertiary);
  border-radius: 100%;
`;

const SourceImage = styled(RoundedImage)`
  width: ${sizeN(8)};
  height: ${sizeN(8)};
`;

const SourceName = styled.div`
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoCallout}
`;

const AuthorLink = styled(ProfileLink)`
  margin-left: ${sizeN(2)};
  margin-right: auto;

  ${SourceName} {
    margin-left: ${sizeN(2)};
  }
`;

const Title = styled.h1`
  margin: ${sizeN(2)} 0;
  font-weight: bold;
  ${typoTitle2}
`;

const Tags = styled.div`
  margin-bottom: ${sizeN(4)};
  color: var(--theme-label-quaternary);
  font-weight: bold;
  ${typoSubhead}
`;

const PostImage = styled.a`
  display: block;
  margin: ${sizeN(2)} 0 0;
  border-radius: ${sizeN(4)};
  overflow: hidden;
  cursor: pointer;
`;

const StatsBar = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-column-gap: ${sizeN(4)};
  margin: ${sizeN(4)} 0;
  color: var(--theme-label-tertiary);

  ${typoCallout}
  span {
    word-break: keep-all;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${sizeN(2)} 0;
  border-top: 0.063rem solid var(--theme-divider-tertiary);
  border-bottom: 0.063rem solid var(--theme-divider-tertiary);
`;

const NewCommentContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: ${sizeN(3)} ${sizeN(4)};
  background: var(--theme-background-primary);
  z-index: 2;

  ${laptop} {
    position: relative;
    left: unset;
    right: unset;
    bottom: unset;
    padding: 0;
    background: none;
    box-shadow: none;
    margin-top: auto;
    padding-top: ${sizeN(4)};
  }
`;

const NewCommentButton = styled.button`
  display: flex;
  width: 100%;
  height: ${sizeN(10)};
  align-items: center;
  padding: 0 ${sizeN(4)};
  background: var(--theme-background-secondary);
  color: var(---theme-label-secondary);
  border: none;
  border-radius: ${sizeN(4)};
  cursor: pointer;
  ${typoCallout}
  ${focusOutline}
`;

const NewCommentProfile = styled(LazyImage)`
  width: ${sizeN(7)};
  height: ${sizeN(7)};
  border-radius: 100%;
  margin-left: -${sizeN(2)};
  margin-right: ${sizeN(3)};
`;

const Separator = styled.div`
  height: 0.063rem;
  margin: ${sizeN(6)} 0;
  background: var(--theme-divider-tertiary);
`;

const AuthorOnboarding = styled.section`
  padding: ${sizeN(6)};
  background: var(--theme-background-secondary);
  border-radius: ${sizeN(4)};

  p {
    margin: ${sizeN(4)} 0;
  }

  ol {
    margin: -${sizeN(1)} 0;
    padding-inline-start: ${sizeN(6)};
  }

  li {
    margin: ${sizeN(1)} 0;
  }

  p,
  ol {
    color: var(--theme-label-secondary);
    ${typoCallout}
  }
`;

const AuthorOnboardingHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  align-items: center;
  column-gap: ${sizeN(3)};

  .icon {
    grid-row-end: span 2;
    font-size: ${sizeN(10)};
    color: var(--theme-status-help);
  }

  h2,
  h3 {
    margin: 0;
  }

  h3 {
    color: var(--theme-status-help);
    font-weight: bold;
    ${typoFootnote}
  }

  h2 {
    font-weight: bold;
    ${typoBody}
  }
`;

const AuthorOnboardingButtons = styled.div`
  display: grid;
  max-width: ${sizeN(74)};
  grid-auto-flow: column;
  grid-template-columns: 1fr max-content;
  column-gap: ${sizeN(4)};
  margin-top: ${sizeN(6)};
`;

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

const updatePost = (
  queryClient: QueryClient,
  postQueryKey: string[],
  update: (oldPost: PostData) => Partial<Post>,
): (() => Promise<() => void>) => async () => {
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
  const [pendingComment, setPendingComment] = useState<{
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
        <PostInfo>
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
            <AuthorLink
              user={postById.post.author}
              data-testid="authorLink"
              disableTooltip
            >
              <SourceImage
                imgSrc={postById.post.author.image}
                imgAlt={postById.post.author.name}
                background="var(--theme-background-secondary)"
              />
              <SourceName>{postById.post.author.name}</SourceName>
            </AuthorLink>
          ) : (
            <PostInfoSubContainer>
              <SourceName>{postById?.post.source.name}</SourceName>
            </PostInfoSubContainer>
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
        </PostInfo>
        <Title>{postById?.post.title}</Title>
        <MetadataContainer>
          <time dateTime={postById?.post?.createdAt} css={metadataStyle}>
            {postById && postDateFormat(postById.post.createdAt)}
          </time>
          {!!postById?.post.readTime && <MetadataSeparator />}
          {!!postById?.post.readTime && (
            <div data-testid="readTime" css={metadataStyle}>
              {postById?.post.readTime}m read time
            </div>
          )}
        </MetadataContainer>
        <Tags>{tags !== '#' && tags}</Tags>
        <PostImage {...postLinkProps}>
          <LazyImage
            imgSrc={postById?.post.image}
            imgAlt="Post cover image"
            ratio="49%"
            eager={true}
          />
        </PostImage>
        <StatsBar data-testid="statsBar">
          {postById?.post.views > 0 && (
            <span>{postById?.post.views.toLocaleString()} Views</span>
          )}
          {postById?.post.numUpvotes > 0 && (
            <span>{postById?.post.numUpvotes.toLocaleString()} Upvotes</span>
          )}
          {postById?.post.numComments > 0 && (
            <span>{postById?.post.numComments.toLocaleString()} Comments</span>
          )}
        </StatsBar>
        <ActionButtons>
          <QuaternaryButton
            id="upvote-post-btn"
            pressed={postById?.post.upvoted}
            onClick={toggleUpvote}
            icon={<UpvoteIcon />}
            aria-label="Upvote"
            responsiveLabel
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
            responsiveLabel
            className="btn-tertiary-avocado"
          >
            Comment
          </QuaternaryButton>
          <QuaternaryButton
            id="bookmark-post-btn"
            pressed={postById?.post.bookmarked}
            onClick={toggleBookmark}
            icon={<BookmarkIcon />}
            responsiveLabel
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
          {/*  responsiveLabel*/}
          {/*  className="btn-tertiary"*/}
          {/*>*/}
          {/*  Share*/}
          {/*</QuaternaryButton>*/}
        </ActionButtons>
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
        <Separator />
        {authorOnboarding ? (
          <AuthorOnboarding>
            <AuthorOnboardingHeader>
              <FeatherIcon />
              <h3>Author</h3>
              <h2>Is this article yours?</h2>
            </AuthorOnboardingHeader>
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
            <AuthorOnboardingButtons data-testid="authorOnboarding">
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
            </AuthorOnboardingButtons>
          </AuthorOnboarding>
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
        <NewCommentContainer>
          <NewCommentButton onClick={openNewComment}>
            {user && (
              <NewCommentProfile
                imgSrc={user.image}
                imgAlt="Your profile image"
              />
            )}
            Write your comment...
          </NewCommentButton>
        </NewCommentContainer>
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
