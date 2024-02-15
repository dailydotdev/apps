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
import { ButtonVariant } from '../buttons/ButtonV2';

interface SharePostContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function SharePostContent({
  post,
  onReadArticle,
}: SharePostContentProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const openArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadArticle();
  };

  const shouldUseInternalLink =
    isSharedPostSquadPost(post) || isInternalReadType(post.sharedPost);

  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer className="mb-5 mt-8">
        <div className="flex max-w-full flex-col-reverse p-4 laptop:flex-row">
          <div className="flex flex-1 flex-col">
            <SharedPostLink
              post={post}
              onGoToLinkProps={combinedClicks(openArticle)}
              className="mb-4 mt-4 flex flex-wrap font-bold typo-body laptop:mt-0"
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
              size="small"
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
