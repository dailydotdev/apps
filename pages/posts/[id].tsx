import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  useQuery,
  useMutation,
  useQueryCache,
  MutationConfig,
  QueryCache,
} from 'react-query';
import ReactGA from 'react-ga';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { Roles } from '../../lib/user';
import styled from 'styled-components';
import { NextSeo } from 'next-seo';
import {
  size05,
  size1,
  size10,
  size2,
  size3,
  size4,
  size6,
  size8,
} from '../../styles/sizes';
import {
  typoDouble,
  typoMicro1,
  typoMicro2,
  typoMicro2Base,
  typoSmall,
} from '../../styles/typography';
import { postDateFormat } from '../../lib/dateFormat';
import { FloatButton, IconButton } from '../../components/Buttons';
import OpenLinkIcon from '../../icons/open_link.svg';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import ShareIcon from '../../icons/share.svg';
import TrashIcon from '../../icons/trash.svg';
import LazyImage from '../../components/LazyImage';
import {
  CANCEL_UPVOTE_MUTATION,
  POST_BY_ID_QUERY,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  UPVOTE_MUTATION,
} from '../../graphql/posts';
import {
  PageContainer,
  RoundedImage,
  SmallRoundedImage,
} from '../../components/utilities';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import AuthContext from '../../components/AuthContext';
import MainComment from '../../components/comments/MainComment';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../../graphql/comments';
import { mobileL, mobileM } from '../../styles/media';
import { colorPepper90 } from '../../styles/colors';
import { focusOutline } from '../../styles/helpers';
import { NextSeoProps } from 'next-seo/lib/types';
import { ShareMobile } from '../../components/ShareMobile';
import { getShareableLink } from '../../lib/share';
import Head from 'next/head';
import { useHideOnModal } from '../../lib/useHideOnModal';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { ProfileLink } from '../../components/profile/ProfileLink';

const NewCommentModal = dynamic(
  () => import('../../components/modals/NewCommentModal'),
);
const DeleteCommentModal = dynamic(
  () => import('../../components/modals/DeleteCommentModal'),
);
const DeletePostModal = dynamic(
  () => import('../../components/DeletePostModal'),
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
  margin-bottom: ${size2};
`;

const PostInfoSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 ${size2};
`;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: ${size2} 0 ${size1};
`;

const Metadata = styled.span`
  color: var(--theme-disabled);
  ${typoSmall}
`;

const MetadataSeparator = styled.div`
  width: ${size05};
  height: ${size05};
  margin: 0 ${size1};
  background: var(--theme-disabled);
  border-radius: 100%;
`;

const SourceImage = styled(RoundedImage)`
  width: ${size8};
  height: ${size8};
`;

const SourceName = styled.div`
  color: var(--theme-disabled);
  font-weight: bold;
  ${typoMicro2Base}
`;

const AuthorLink = styled(ProfileLink)`
  margin-left: ${size2};
  flex: 1;

  ${SourceName} {
    margin-left: ${size2};
  }
`;

const Title = styled.h1`
  margin: ${size2} 0;
  ${typoDouble}
`;

const Tags = styled.div`
  margin-bottom: ${size4};
  color: var(--theme-disabled);
  text-transform: uppercase;
  ${typoSmall};
`;

const PostImage = styled.a`
  display: block;
  margin: ${size2} 0 0;
  border-radius: ${size4};
  overflow: hidden;
  cursor: pointer;
`;

const StatsBar = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-column-gap: ${size4};
  margin: ${size4} 0;
  color: var(--theme-disabled);
  ${typoSmall}
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${size4} 0;
  border-top: 0.063rem solid var(--theme-separator);
  border-bottom: 0.063rem solid var(--theme-separator);

  ${FloatButton} {
    .icon {
      margin-right: -${size1};

      ${mobileM} {
        margin-right: ${size2};
      }
    }

    span {
      display: none;

      ${mobileM} {
        display: inline-block;
      }
    }
  }
`;

const NewCommentContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: ${size3} ${size4};
  background: var(--theme-background-primary);
  box-shadow: 0 -${size2} ${size6} 0 ${colorPepper90}3D;

  ${mobileL} {
    position: relative;
    left: unset;
    right: unset;
    bottom: unset;
    padding: 0;
    background: none;
    box-shadow: none;
    margin-top: auto;
    padding-top: ${size4};
  }
`;

const NewCommentButton = styled.button`
  display: flex;
  width: 100%;
  height: ${size10};
  align-items: center;
  padding: 0 ${size4};
  background: var(--theme-hover);
  color: var(--theme-secondary);
  border: none;
  border-radius: ${size4};
  cursor: pointer;
  ${typoMicro1}
  ${focusOutline}
`;

const NewCommentProfile = styled(SmallRoundedImage)`
  margin-left: -${size2};
  margin-right: ${size3};
`;

const Hint = styled.div`
  margin: ${size6} 0;
  padding-top: ${size6};
  color: var(--theme-secondary);
  border-top: 0.063rem solid var(--theme-separator);
  ${typoMicro2}
`;

interface ParentComment {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  commentId: string | null;
  postId: string;
}

const upvoteMutationConfig = (
  queryCache: QueryCache,
  postQueryKey: string[],
  upvoted: boolean,
): MutationConfig<unknown, unknown, unknown, () => void> => ({
  onMutate: () => {
    queryCache.cancelQueries(postQueryKey);
    const oldPost = queryCache.getQueryData<PostData>(postQueryKey);
    queryCache.setQueryData<PostData>(postQueryKey, {
      post: {
        ...oldPost.post,
        upvoted,
        numUpvotes: oldPost.post.numUpvotes + (upvoted ? 1 : -1),
      },
    });

    return () => queryCache.setQueryData(postQueryKey, oldPost);
  },
  onError: (err, _, rollback) => rollback(),
  onSettled: () => queryCache.invalidateQueries(postQueryKey),
});

const PostPage = ({ id, postData }: Props): ReactElement => {
  const { isFallback } = useRouter();

  if (!isFallback && !id) {
    return <Custom404 />;
  }

  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();
  const [parentComment, setParentComment] = useState<ParentComment>(null);
  const [hasNativeShare, setHasNativeShare] = useState<boolean>(false);
  const [pendingComment, setPendingComment] = useState<{
    comment: Comment;
    parentId: string | null;
  }>(null);
  const [showShareNewComment, setShowShareNewComment] = useState<boolean>(
    false,
  );
  const [lastScroll, setLastScroll] = useState<number>(0);
  const [showDeletePost, setShowDeletePost] = useState<boolean>(false);

  const queryCache = useQueryCache();
  const postQueryKey = ['post', id];
  const { data: postById } = useQuery<PostData>(
    postQueryKey,
    (key: string, id: string) =>
      request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, {
        id,
      }),
    {
      initialData: postData,
      enabled: !!id,
      initialStale: true,
    },
  );

  const { data: comments } = useQuery<PostCommentsData>(
    ['post_comments', id],
    (key: string, id: string) =>
      request(`${apiUrl}/graphql`, POST_COMMENTS_QUERY, {
        postId: id,
      }),
    {
      enabled: !!id,
      refetchInterval: 60 * 1000,
    },
  );

  const [upvotePost] = useMutation(
    () =>
      request(`${apiUrl}/graphql`, UPVOTE_MUTATION, {
        id,
      }),
    upvoteMutationConfig(queryCache, postQueryKey, true),
  );

  const [cancelPostUpvote] = useMutation(
    () =>
      request(`${apiUrl}/graphql`, CANCEL_UPVOTE_MUTATION, {
        id,
      }),
    upvoteMutationConfig(queryCache, postQueryKey, false),
  );

  const toggleUpvote = () => {
    if (user) {
      if (postById?.post.upvoted) {
        ReactGA.event({ category: 'Post', action: 'Upvote', label: 'Remove' });
        return cancelPostUpvote();
      } else if (postById) {
        ReactGA.event({ category: 'Post', action: 'Add', label: 'Remove' });
        return upvotePost();
      }
    } else {
      showLogin();
    }
  };

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
        ReactGA.event({ category: 'Post', action: 'Share', label: 'Native' });
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
      showLogin();
    }
  };

  const onCommentClick = (comment: Comment, parentId: string | null) => {
    if (user) {
      setLastScroll(window.scrollY);
      setParentComment({
        authorName: comment.author.name,
        authorImage: comment.author.image,
        content: comment.content,
        publishDate: comment.createdAt,
        commentId: parentId,
        postId: postById.post.id,
      });
    } else {
      showLogin();
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
    if (isFallback) {
      return;
    }
    setHasNativeShare('share' in navigator);
    if (router?.query.new) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
    window.history.replaceState({}, document.title, getShareableLink());
  }, [isFallback]);

  useHideOnModal(() => !!parentComment, [parentComment]);

  if (!postById?.post || (isFallback && !id)) {
    return <></>;
  }

  const postLinkProps = {
    href: postById?.post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => ReactGA.event({ category: 'Post', action: 'Click' }),
  };

  const Seo: NextSeoProps = {
    title: postById?.post.title,
    description: `Join us to the discussion about "${postById?.post.title}" on daily.dev ✌️`,
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
      <PageContainer>
        <Head>
          <link rel="preload" as="image" href={postById?.post.image} />
        </Head>
        <NextSeo {...Seo} />
        <PostInfo>
          <SourceImage
            imgSrc={postById?.post.source.image}
            imgAlt={postById?.post.source.name}
            background="var(--theme-background-highlight)"
          />
          {postById?.post.author ? (
            <AuthorLink user={postById.post.author} data-testid="authorLink">
              <SourceImage
                imgSrc={postById.post.author.image}
                imgAlt={postById.post.author.name}
                background="var(--theme-background-highlight)"
              />
              <SourceName>{postById.post.author.name}</SourceName>
            </AuthorLink>
          ) : (
            <PostInfoSubContainer>
              <SourceName>{postById?.post.source.name}</SourceName>
            </PostInfoSubContainer>
          )}
          <IconButton as="a" {...postLinkProps}>
            <OpenLinkIcon />
          </IconButton>
          {user?.roles?.indexOf(Roles.Moderator) > -1 && (
            <IconButton onClick={() => setShowDeletePost(true)}>
              <TrashIcon />
            </IconButton>
          )}
        </PostInfo>
        <Title>{postById?.post.title}</Title>
        <MetadataContainer>
          <Metadata as="time" dateTime={postById?.post?.createdAt}>
            {postById && postDateFormat(postById.post.createdAt)}
          </Metadata>
          {!!postById?.post.readTime && <MetadataSeparator />}
          {!!postById?.post.readTime && (
            <Metadata data-testid="readTime">
              {postById?.post.readTime}m read time
            </Metadata>
          )}
        </MetadataContainer>
        <Tags>{postById?.post.tags.map((t) => `#${t}`).join(' ')}</Tags>
        <PostImage {...postLinkProps}>
          <LazyImage
            imgSrc={postById?.post.image}
            imgAlt="Post cover image"
            ratio="49%"
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
          <FloatButton
            done={postById?.post.upvoted}
            onClick={toggleUpvote}
            title="Upvote"
          >
            <UpvoteIcon />
            <span>Upvote</span>
          </FloatButton>
          <FloatButton
            done={postById?.post.commented}
            onClick={openNewComment}
            title="Comment"
          >
            <CommentIcon />
            <span>Comment</span>
          </FloatButton>
          <FloatButton
            onClick={sharePost}
            title="Share"
            style={{ visibility: hasNativeShare ? 'visible' : 'hidden' }}
          >
            <ShareIcon />
            <span>Share</span>
          </FloatButton>
        </ActionButtons>
        {comments?.postComments.edges.map((e) => (
          <MainComment
            comment={e.node}
            key={e.node.id}
            onComment={onCommentClick}
            onDelete={(comment, parentId) =>
              setPendingComment({ comment, parentId })
            }
            postAuthorId={postById?.post?.author?.id}
          />
        ))}
        <Hint>
          💡 Hint: The comment with most upvotes will be featured on the main
          feed of daily.dev browser extension.
        </Hint>
        <ShareMobile share={sharePost} />
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
      <DeletePostModal
        postId={id}
        isOpen={showDeletePost}
        onRequestClose={() => setShowDeletePost(false)}
      />
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
    } else {
      throw err;
    }
  }
}
