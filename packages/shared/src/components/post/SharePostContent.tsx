import React, { ReactElement, useContext } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import {
  Post,
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
} from '../../graphql/posts';
import SettingsContext from '../../contexts/SettingsContext';
import { SharePostTitle } from './share';
import { combinedClicks } from '../../lib/click';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import { ButtonVariant } from '../buttons/Button';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { ProfileImageSize } from '../ProfilePicture';

interface SharePostContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
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

function SharePostContent({
  post,
  onReadArticle,
}: SharePostContentProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const openArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadArticle();
  };

  if (!post.sharedPost) {
    return <SharePostContentSkeleton />;
  }

  const shouldUseInternalLink =
    isSharedPostSquadPost(post) || isInternalReadType(post.sharedPost);

  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer
        summary={post.sharedPost?.summary}
        className="mb-5 mt-8"
      >
        <div className="flex max-w-full flex-col p-4 pt-5 laptop:flex-row">
          <div className="mb-5 flex flex-1 flex-col laptop:mb-0">
            <SharedPostLink
              post={post}
              onGoToLinkProps={combinedClicks(openArticle)}
              className="mb-4 mt-0 flex flex-wrap font-bold typo-body"
            >
              {post.sharedPost.title}
            </SharedPostLink>
            <PostSourceInfo
              date={
                post.sharedPost.readTime
                  ? `${post.sharedPost.readTime}m read time`
                  : undefined
              }
              source={post.sharedPost.source}
              size={ProfileImageSize.Small}
            />
            <ReadArticleButton
              content={getReadPostButtonText(post)}
              className="mt-5 w-fit"
              variant={ButtonVariant.Secondary}
              href={
                shouldUseInternalLink
                  ? post.sharedPost.commentsPermalink
                  : post.sharedPost.permalink
              }
              openNewTab={shouldUseInternalLink ? false : openNewTab}
              title="Go to post"
              rel="noopener"
              {...combinedClicks(openArticle)}
            />
          </div>

          <SharedPostLink
            post={post}
            onGoToLinkProps={combinedClicks(openArticle)}
            className="ml-2 block h-fit w-70 cursor-pointer overflow-hidden rounded-16"
          >
            <LazyImage
              imgSrc={post.sharedPost.image}
              imgAlt="Post cover image"
              ratio="52%"
              eager
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            />
          </SharedPostLink>
        </div>
      </SharedLinkContainer>
    </>
  );
}

export default SharePostContent;
