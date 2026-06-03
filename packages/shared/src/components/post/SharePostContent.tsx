import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ReadArticleButton,
  getReadPostButtonIcon,
} from '../cards/common/ReadArticleButton';
import type { Post, SharedPost } from '../../graphql/posts';
import {
  getReadPostButtonText,
  isSocialTwitterPost,
} from '../../graphql/posts';
import { combinedClicks, withSelectionGuard } from '../../lib/click';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import { ButtonVariant } from '../buttons/Button';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { SharePostTitle } from './share/SharePostTitle';
import { BlockIcon, EarthIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { DeletedPostId } from '../../lib/constants';
import { IconSize } from '../Icon';
import { SourceType } from '../../graphql/sources';
import { EmbeddedTweetPreview } from '../cards/socialTwitter/EmbeddedTweetPreview';
import { SharedPostMetaInfo } from './common/SharedPostMetaInfo';

export interface CommonSharePostContentProps {
  sharedPost?: SharedPost;
  source: Post['source'];
  onReadArticle: () => Promise<void>;
  isCompactSpacing?: boolean;
  showTweetImage?: boolean;
}

const SharePostContentSkeleton = () => (
  <>
    <ElementPlaceholder className="mt-6 h-6 w-2/4 rounded-10" />
    <div className="mb-5 mt-8 overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      <ElementPlaceholder className="w-full pt-[40%]" />
      <div className="flex flex-col gap-3 p-4 tablet:gap-4 tablet:p-5">
        <ElementPlaceholder className="h-7 w-3/4 rounded-10 tablet:h-8" />
        <ElementPlaceholder className="h-5 w-24 rounded-10" />
      </div>
    </div>
  </>
);

const DeletedPost = ({ isCompactSpacing }: { isCompactSpacing?: boolean }) => (
  <SharedLinkContainer className={isCompactSpacing ? 'mb-4 mt-6' : 'mb-5 mt-8'}>
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
  isCompactSpacing,
}: {
  post: Post;
  openArticle: (e: React.MouseEvent) => void;
  isCompactSpacing?: boolean;
}) => (
  <SharedLinkContainer className={isCompactSpacing ? 'mb-4 mt-6' : 'mb-5 mt-8'}>
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
        icon={getReadPostButtonIcon(post)}
      />
    </div>
  </SharedLinkContainer>
);

export function CommonSharePostContent({
  sharedPost,
  source,
  onReadArticle,
  isCompactSpacing,
  showTweetImage = false,
}: CommonSharePostContentProps): ReactElement {
  const openArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadArticle();
  };

  if (!sharedPost) {
    return <SharePostContentSkeleton />;
  }

  const isDeleted = sharedPost.id === DeletedPostId;
  const { private: isPrivate, source: sharedPostSource } = sharedPost;
  const sourceType = sharedPostSource?.type;
  const sharedContainerClassName = isCompactSpacing ? 'mb-4 mt-6' : 'mb-5 mt-8';
  const shouldRenderTweetPreview = isSocialTwitterPost(sharedPost);

  if (isDeleted) {
    return <DeletedPost isCompactSpacing={isCompactSpacing} />;
  }

  if (isPrivate && sourceType === SourceType.Squad) {
    return (
      <PrivatePost
        post={sharedPost}
        openArticle={openArticle}
        isCompactSpacing={isCompactSpacing}
      />
    );
  }

  if (shouldRenderTweetPreview) {
    return (
      <EmbeddedTweetPreview
        post={sharedPost}
        className={classNames(sharedContainerClassName, 'w-full')}
        textClampClass=""
        bodyClassName="typo-markdown"
        showImage={showTweetImage}
      />
    );
  }

  return (
    <SharedLinkContainer
      className={classNames(
        sharedContainerClassName,
        'min-w-0 max-w-full overflow-hidden',
      )}
    >
      <SharedPostLink
        source={source}
        sharedPost={sharedPost}
        onGoToLinkProps={combinedClicks(withSelectionGuard(openArticle))}
        className="block w-full cursor-pointer"
      >
        <LazyImage
          imgSrc={sharedPost.image}
          imgAlt="Post cover image"
          ratio="40%"
          eager
          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          fetchPriority="high"
        />
        <div className="flex min-w-0 max-w-full flex-col gap-3 p-4 tablet:gap-4 tablet:p-5">
          <h3 className="break-words font-bold typo-title3 tablet:typo-title2">
            {sharedPost.title}
          </h3>
          <SharedPostMetaInfo sharedPost={sharedPost} />
          {!!sharedPost.summary && (
            <p
              className="select-text break-words text-text-secondary typo-markdown"
              data-testid="tldr-container"
            >
              {sharedPost.summary}
            </p>
          )}
        </div>
      </SharedPostLink>
    </SharedLinkContainer>
  );
}

interface SharePostContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
  isCompactSpacing?: boolean;
}

const SharePostContent = ({
  post,
  onReadArticle,
  isCompactSpacing,
}: SharePostContentProps): ReactElement => {
  const isSharedTweet =
    !!post.sharedPost && isSocialTwitterPost(post.sharedPost);

  return (
    <>
      {!isSharedTweet && (
        <SharePostTitle
          title={post?.title}
          titleHtml={post?.titleHtml}
          isCompactSpacing={isCompactSpacing}
        />
      )}
      <CommonSharePostContent
        onReadArticle={onReadArticle}
        source={post.source}
        sharedPost={post.sharedPost}
        isCompactSpacing={isCompactSpacing}
        showTweetImage
      />
    </>
  );
};

export default SharePostContent;
