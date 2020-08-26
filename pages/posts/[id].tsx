import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  ApolloError,
  NormalizedCacheObject,
  useMutation,
  useQuery,
} from '@apollo/client';
import ReactGA from 'react-ga';
import { initializeApollo } from '../../lib/apolloClient';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getUser, LoggedUser } from '../../lib/user';
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
  sizeN,
} from '../../styles/sizes';
import {
  typoDouble,
  typoLil2Base,
  typoMicro1,
  typoMicro2,
  typoSmall,
} from '../../styles/typography';
import { postDateFormat } from '../../lib/dateFormat';
import { FloatButton, IconButton } from '../../components/Buttons';
import OpenLinkIcon from '../../icons/open_link.svg';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import ShareIcon from '../../icons/share.svg';
import LazyImage from '../../components/LazyImage';
import {
  CANCEL_UPVOTE_MUTATION,
  CancelUpvoteData,
  POST_BY_ID_QUERY,
  PostData,
  updatePostUpvoteCache,
  UPVOTE_MUTATION,
  UpvoteData,
} from '../../graphql/posts';
import { RoundedImage, SmallRoundedImage } from '../../components/utilities';
import MainLayout from '../../components/MainLayout';
import AuthContext from '../../components/AuthContext';
import MainComment from '../../components/MainComment';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../../graphql/comments';
import { laptop, mobileL, mobileM, tablet } from '../../styles/media';
import { colorPepper90 } from '../../styles/colors';
import { focusOutline, postPageMaxWidth } from '../../styles/utilities';
import { NextSeoProps } from 'next-seo/lib/types';
import { ShareMobile } from '../../components/ShareMobile';
import { getShareableLink } from '../../lib/share';

const NewCommentModal = dynamic(() =>
  import('../../components/NewCommentModal'),
);
const DeleteCommentModal = dynamic(() =>
  import('../../components/DeleteCommentModal'),
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

export interface Props {
  id: string;
  initialApolloState: NormalizedCacheObject;
  user: LoggedUser;
  trackingId: string;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

export async function getServerSideProps({
  params,
  req,
  res,
}: GetServerSidePropsContext<PostParams>): Promise<
  GetServerSidePropsResult<Props>
> {
  const { id } = params;
  const apolloClient = initializeApollo({ req });

  try {
    const [, , userRes] = await Promise.all([
      apolloClient.query({
        query: POST_BY_ID_QUERY,
        variables: {
          id,
        },
      }),
      apolloClient.query({
        query: POST_COMMENTS_QUERY,
        variables: {
          postId: id,
        },
      }),
      getUser({ req, res }),
    ]);

    return {
      props: {
        id,
        initialApolloState: apolloClient.cache.extract(),
        user: userRes.isLoggedIn ? (userRes.user as LoggedUser) : null,
        trackingId: userRes.user.id,
      },
    };
  } catch (err) {
    const apolloError = err as ApolloError;
    if (apolloError?.graphQLErrors?.[0]?.extensions?.code === 'NOT_FOUND') {
      res.writeHead(302, { Location: '/404' });
      res.end();
    } else {
      throw err;
    }
    return {
      props: null,
    };
  }
}

const PostContainer = styled.main`
  position: relative;
  display: flex;
  width: 100%;
  max-width: ${postPageMaxWidth};
  flex-direction: column;
  align-items: stretch;
  padding: ${size6} ${size4} ${sizeN(16)};
  z-index: 1;

  ${mobileL} {
    padding-bottom: ${size6};
  }

  ${tablet} {
    padding-left: ${size8};
    padding-right: ${size8};
    align-self: center;
  }

  ${laptop} {
    min-height: 100vh;
    border-left: 0.063rem solid var(--theme-separator);
    border-right: 0.063rem solid var(--theme-separator);
  }
`;

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

const SourceName = styled.div`
  ${typoLil2Base}
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
  margin: ${size2} 0;
  border-radius: ${size4};
  overflow: hidden;
  cursor: pointer;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${size4};
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

export default function PostPage({ id }: Props): ReactElement {
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

  const { data: postById } = useQuery<PostData>(POST_BY_ID_QUERY, {
    variables: { id },
  });

  const { data: comments } = useQuery<PostCommentsData>(POST_COMMENTS_QUERY, {
    variables: { postId: id },
    pollInterval: 2 * 60 * 1000,
  });

  const [upvotePost] = useMutation<UpvoteData>(UPVOTE_MUTATION, {
    variables: { id },
    optimisticResponse: { upvote: { _: true } },
    update(cache) {
      return updatePostUpvoteCache(cache, id, true);
    },
  });

  const [cancelPostUpvote] = useMutation<CancelUpvoteData>(
    CANCEL_UPVOTE_MUTATION,
    {
      variables: { id },
      optimisticResponse: { cancelUpvote: { _: true } },
      update(cache) {
        return updatePostUpvoteCache(cache, id, false);
      },
    },
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

  const onNewComment = (newComment: Comment, parentId: string | null): void => {
    if (!parentId) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
  };

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

  useEffect(() => {
    setHasNativeShare('share' in navigator);
    if (router?.query.new) {
      setTimeout(() => setShowShareNewComment(true), 700);
    }
    window.history.replaceState({}, document.title, getShareableLink());
  }, []);

  return (
    <MainLayout>
      <PostContainer>
        <NextSeo {...Seo} />
        <PostInfo>
          <RoundedImage
            imgSrc={postById?.post.source.image}
            imgAlt={postById?.post.source.name}
            background="var(--theme-background-highlight)"
            ratio="100%"
          />
          <PostInfoSubContainer>
            <SourceName>{postById?.post.source.name}</SourceName>
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
          </PostInfoSubContainer>
          <IconButton as="a" {...postLinkProps}>
            <OpenLinkIcon />
          </IconButton>
        </PostInfo>
        <Title>{postById?.post.title}</Title>
        <Tags>{postById?.post.tags.map((t) => `#${t}`).join(' ')}</Tags>
        <PostImage {...postLinkProps}>
          <LazyImage
            imgSrc={postById?.post.image}
            imgAlt="Post cover image"
            lowsrc={postById?.post.placeholder}
            ratio="49%"
          />
        </PostImage>
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
      </PostContainer>
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
          onRequestClose={() => setParentComment(null)}
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
    </MainLayout>
  );
}
