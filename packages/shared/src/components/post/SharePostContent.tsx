import React, { ReactElement, useContext } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import { Post, isSharedPostSquadPost } from '../../graphql/posts';
import SettingsContext from '../../contexts/SettingsContext';
import { SharePostTitle } from './share';
import { combinedClicks } from '../../lib/click';
import { SourceType } from '../../graphql/sources';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';

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

  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer className="mt-8 mb-5">
        <div className="flex flex-col-reverse laptop:flex-row p-4 max-w-full">
          <div className="flex flex-col flex-1">
            <SharedPostLink
              post={post}
              className="flex flex-wrap mt-4 laptop:mt-0 mb-4 font-bold typo-body"
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
              className="mt-5 btn-secondary w-fit"
              href={
                isSharedPostSquadPost(post)
                  ? post.sharedPost.commentsPermalink
                  : post.sharedPost.permalink
              }
              openNewTab={isSharedPostSquadPost(post) ? false : openNewTab}
              title="Go to post"
              rel="noopener"
              {...combinedClicks(openArticle)}
            />
          </div>

          <SharedPostLink
            post={post}
            onGoToLinkProps={combinedClicks(openArticle)}
            className="block overflow-hidden ml-2 w-70 rounded-2xl cursor-pointer h-fit"
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
