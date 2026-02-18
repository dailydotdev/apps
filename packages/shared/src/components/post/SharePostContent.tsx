import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import PostSourceInfo from './PostSourceInfo';
import { ReadArticleButton } from '../cards/common/ReadArticleButton';
import type { Post, SharedPost } from '../../graphql/posts';
import {
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
  PostType,
} from '../../graphql/posts';
import SettingsContext, {
  useSettingsContext,
} from '../../contexts/SettingsContext';
import { combinedClicks } from '../../lib/click';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import { ButtonVariant } from '../buttons/Button';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TruncateText } from '../utilities';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { SharePostTitle } from './share/SharePostTitle';
import { BlockIcon, EarthIcon, TwitterIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { DeletedPostId } from '../../lib/constants';
import { IconSize } from '../Icon';
import { SourceType } from '../../graphql/sources';
import { Origin } from '../../lib/log';
import {
  EMBEDDED_TWEET_AVATAR_FALLBACK,
  formatHandleAsDisplayName,
  getSocialPostText,
  isSquadPlaceholderAvatar,
  removeHandlePrefixFromTitle,
  UNKNOWN_SOURCE_ID,
} from '../../lib/socialTwitter';

export interface CommonSharePostContentProps {
  post?: Post;
  sharedPost: SharedPost;
  source: Post['source'];
  onReadArticle: () => Promise<void>;
  isArticleModal?: boolean;
}

const SharePostContentSkeleton = () => (
  <>
    <ElementPlaceholder className="mt-6 h-6 w-2/4 rounded-10" />
    <div className="mb-5 mt-8 rounded-16 border border-border-subtlest-tertiary">
      <div className="flex max-w-full flex-col p-4 pt-5 laptop:flex-row">
        <div className="flex flex-1 flex-col gap-9">
          <ElementPlaceholder className="h-6 w-20 rounded-10" />
          <ElementPlaceholder className="h-6 w-20 rounded-10" />
        </div>
        <ElementPlaceholder className="ml-2 h-36 w-70 rounded-16" />
      </div>
    </div>
  </>
);

const DeletedPost = () => (
  <SharedLinkContainer className="mb-5 mt-8">
    <div className="flex flex-row items-center gap-1 px-5 py-4">
      <BlockIcon />
      <Typography
        className="flex-1"
        type={TypographyType.Subhead}
        color={TypographyColor.Secondary}
      >
        This post is no longer available. It might have been removed or the link
        has expired.
      </Typography>
    </div>
  </SharedLinkContainer>
);

const PrivatePost = ({
  post,
  openArticle,
}: {
  post: Post;
  openArticle: (e: React.MouseEvent) => void;
}) => (
  <SharedLinkContainer className="mb-5 mt-8">
    <div className="flex flex-row items-center gap-1 px-5 py-4">
      <div className="flex size-6 items-center justify-center rounded-full bg-surface-secondary">
        <EarthIcon size={IconSize.Size16} />
      </div>
      <Typography
        className="flex-1"
        type={TypographyType.Subhead}
        color={TypographyColor.Secondary}
      >
        This post is in a private squad.
      </Typography>
      <ReadArticleButton
        content={getReadPostButtonText(post)}
        className="w-fit"
        href={post.commentsPermalink}
        variant={ButtonVariant.Secondary}
        title="Go to post"
        rel="noopener"
        {...combinedClicks(openArticle)}
      />
    </div>
  </SharedLinkContainer>
);

export function CommonSharePostContent({
  post,
  sharedPost,
  source,
  onReadArticle,
  isArticleModal,
}: CommonSharePostContentProps): ReactElement {
  const { sidebarExpanded } = useSettingsContext();
  const { openNewTab } = useContext(SettingsContext);
  const openArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadArticle();
  };

  if (!sharedPost) {
    return <SharePostContentSkeleton />;
  }

  const shouldUseInternalLink =
    isSharedPostSquadPost({ sharedPost }) || isInternalReadType(sharedPost);

  const isDeleted = sharedPost.id === DeletedPostId;
  const { private: isPrivate, source: sharedPostSource } = sharedPost;
  const { type } = sharedPostSource;

  if (isDeleted) {
    return <DeletedPost />;
  }

  if (isPrivate && type === SourceType.Squad) {
    return <PrivatePost post={sharedPost} openArticle={openArticle} />;
  }

  const isSocialTwitter = sharedPost?.type === PostType.SocialTwitter;
  const referenceHandle =
    sharedPost?.source?.id === UNKNOWN_SOURCE_ID
      ? sharedPost?.creatorTwitter ||
        post?.creatorTwitter ||
        sharedPost?.author?.username
      : sharedPost?.source?.handle;
  const repostingHandle =
    post?.source?.id === UNKNOWN_SOURCE_ID
      ? post?.creatorTwitter || post?.author?.username
      : post?.source?.handle;
  const repostSourceName = post?.source?.name;
  const isUnknownRepostSourceName =
    repostSourceName?.toLowerCase() === UNKNOWN_SOURCE_ID;
  const repostedByName =
    (!isUnknownRepostSourceName && repostSourceName) ||
    post?.author?.name ||
    (repostingHandle && formatHandleAsDisplayName(repostingHandle));
  const shouldShowRepostingHandle =
    isArticleModal && post?.subType === 'repost' && !!repostingHandle;
  const repostIconClassName = isArticleModal
    ? 'text-text-primary'
    : 'relative top-px text-text-tertiary';
  const repostIconSize = isArticleModal ? IconSize.Size16 : IconSize.XXSmall;
  const quotedSourceName = sharedPost?.source?.name;
  const isUnknownQuotedSourceName =
    quotedSourceName?.toLowerCase() === UNKNOWN_SOURCE_ID;
  const embeddedTweetName =
    !isUnknownQuotedSourceName && quotedSourceName
      ? quotedSourceName
      : sharedPost?.author?.name;
  const embeddedTweetDisplayName =
    embeddedTweetName ||
    (referenceHandle && formatHandleAsDisplayName(referenceHandle));
  const embeddedTweetIdentity = [embeddedTweetDisplayName, referenceHandle]
    .filter(Boolean)
    .map((value, index) => (index === 1 ? `@${value}` : value))
    .join(' ');
  const embeddedTweetSourceAvatar = isSquadPlaceholderAvatar(
    sharedPost?.source?.image,
  )
    ? undefined
    : sharedPost?.source?.image;
  const embeddedTweetAvatar =
    sharedPost?.author?.image ||
    embeddedTweetSourceAvatar ||
    EMBEDDED_TWEET_AVATAR_FALLBACK;
  const embeddedTweetAvatarUser = {
    id:
      sharedPost?.author?.id ||
      sharedPost?.source?.id ||
      referenceHandle ||
      'shared-post-avatar',
    image: embeddedTweetAvatar,
    username: referenceHandle,
    name: embeddedTweetName,
  };

  if (isSocialTwitter) {
    return (
      <>
        {shouldShowRepostingHandle && (
          <p className="mt-2 text-text-primary typo-markdown">
            <span className="inline-flex h-4 items-center gap-1 align-middle leading-4">
              <span>{repostedByName} reposted</span>
              <TwitterIcon
                className={repostIconClassName}
                size={repostIconSize}
              />
            </span>
          </p>
        )}
        <SharedLinkContainer
          post={sharedPost}
          summary={sharedPost.summary}
          className={classNames(
            'mb-5',
            shouldShowRepostingHandle ? 'mt-2' : 'mt-8',
          )}
        >
          <SharedPostLink
            source={source}
            sharedPost={sharedPost}
            onGoToLinkProps={combinedClicks(openArticle)}
            className="block p-4"
          >
            <div className="mb-2 flex items-center justify-start gap-2">
              {!!embeddedTweetAvatarUser && (
                <ProfilePicture
                  user={embeddedTweetAvatarUser}
                  size={ProfileImageSize.Small}
                  rounded="full"
                  nativeLazyLoading
                />
              )}
              <div className="min-w-0">
                {!!embeddedTweetIdentity && (
                  <p className="truncate text-text-tertiary typo-footnote">
                    {embeddedTweetIdentity}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-1 line-clamp-8 whitespace-pre-line break-words text-text-primary typo-markdown">
              {sharedPost.title}
            </p>
          </SharedPostLink>
        </SharedLinkContainer>
      </>
    );
  }

  return (
    <SharedLinkContainer
      post={sharedPost}
      summary={sharedPost.summary}
      className="mb-5 mt-8"
    >
      <div
        className={classNames(
          'flex max-w-full flex-col gap-2 p-4 pt-5',
          sidebarExpanded ? 'laptopL:flex-row' : 'laptop:flex-row',
        )}
      >
        <div
          className={classNames(
            'mb-5 flex max-w-full flex-1 flex-col truncate',
            sidebarExpanded ? 'laptopL:mb-0' : 'laptop:mb-0',
          )}
        >
          <SharedPostLink
            source={source}
            sharedPost={sharedPost}
            onGoToLinkProps={combinedClicks(openArticle)}
            className="mb-4 mt-0 flex flex-wrap font-bold typo-body"
          >
            <TruncateText>{sharedPost.title}</TruncateText>
          </SharedPostLink>
          <PostSourceInfo
            date={
              sharedPost.readTime
                ? `${sharedPost.readTime}m read time`
                : undefined
            }
            post={sharedPost}
            onReadArticle={onReadArticle}
            size={ProfileImageSize.Small}
            showActions={false}
          />
          <ReadArticleButton
            content={getReadPostButtonText(sharedPost)}
            className="mt-5 w-fit"
            variant={ButtonVariant.Secondary}
            href={
              shouldUseInternalLink
                ? sharedPost.commentsPermalink
                : sharedPost.permalink
            }
            openNewTab={shouldUseInternalLink ? false : openNewTab}
            title="Go to post"
            rel="noopener"
            {...combinedClicks(openArticle)}
          />
        </div>

        <SharedPostLink
          source={source}
          sharedPost={sharedPost}
          onGoToLinkProps={combinedClicks(openArticle)}
          className="mx-auto block h-fit w-70 cursor-pointer overflow-hidden rounded-16"
        >
          <LazyImage
            imgSrc={sharedPost.image}
            imgAlt="Post cover image"
            ratio="52%"
            eager
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
            fetchPriority="high"
          />
        </SharedPostLink>
      </div>
    </SharedLinkContainer>
  );
}

interface SharePostContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
  origin?: Origin;
}

const SharePostContent = ({
  post,
  onReadArticle,
  origin,
}: SharePostContentProps): ReactElement => {
  const isSocialTwitterContent =
    post.type === PostType.SocialTwitter ||
    post.sharedPost?.type === PostType.SocialTwitter;
  const sourceHandle =
    post.source?.id === UNKNOWN_SOURCE_ID
      ? post.creatorTwitter || post.author?.username
      : post.source?.handle;
  const shouldHideSocialTitle =
    isSocialTwitterContent &&
    post.subType === 'repost' &&
    !getSocialPostText({
      content: post.content,
      contentHtml: post.contentHtml,
    });
  const title = isSocialTwitterContent
    ? removeHandlePrefixFromTitle({
        title: post.title,
        sourceHandle,
        authorHandle: post.author?.username,
      })
    : post.title;

  return (
    <>
      {!shouldHideSocialTitle && (
        <SharePostTitle title={title} titleHtml={post?.titleHtml} />
      )}
      <CommonSharePostContent
        post={post}
        onReadArticle={onReadArticle}
        source={post.source}
        sharedPost={post.sharedPost}
        isArticleModal={origin === Origin.ArticleModal}
      />
    </>
  );
};

export default SharePostContent;
