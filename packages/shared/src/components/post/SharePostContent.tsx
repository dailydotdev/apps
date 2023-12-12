import React, { ReactElement, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import PostSourceInfo from './PostSourceInfo';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import PostSummary from '../cards/PostSummary';
import ArrowIcon from '../icons/Arrow';
import { Post } from '../../graphql/posts';
import SettingsContext from '../../contexts/SettingsContext';
import { SharePostTitle } from './share';
import { combinedClicks } from '../../lib/click';
import { SourceType } from '../../graphql/sources';
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
  const [height, setHeight] = useState<number>(null);
  const [shouldShowSummary, setShouldShowSummary] = useState(true);

  const tldrHeight = useMemo(() => {
    if (height === null) {
      return 'auto';
    }

    return shouldShowSummary ? height : 0;
  }, [shouldShowSummary, height]);

  const openArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadArticle();
  };

  const isSharedPostSquadPost =
    post.sharedPost.source.type === SourceType.Squad;

  return (
    <>
      <SharePostTitle post={post} />
      <div className="flex flex-col mt-8 rounded-16 border border-theme-divider-tertiary hover:border-theme-divider-secondary">
        <div className="flex flex-col-reverse laptop:flex-row p-4 max-w-full">
          <div className="flex flex-col flex-1">
            <SharedPostLink
              post={post}
              onGoToLinkProps={combinedClicks(openArticle)}
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
                isSharedPostSquadPost
                  ? post.sharedPost.commentsPermalink
                  : post.sharedPost.permalink
              }
              openNewTab={isSharedPostSquadPost ? false : openNewTab}
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
        {post.sharedPost.summary && (
          <>
            <PostSummary
              ref={(el) => {
                if (!el?.offsetHeight || height !== null) {
                  return;
                }

                setHeight(el.offsetHeight);
              }}
              style={{ height: tldrHeight }}
              className={classNames(
                'mx-4 transition-all duration-300 ease-in-out',
                shouldShowSummary && 'mb-4',
              )}
              summary={post.sharedPost.summary}
            />
            <button
              type="button"
              className="flex flex-row justify-center py-2 w-full font-bold hover:underline border-t border-theme-divider-tertiary typo-callout"
              onClick={() => setShouldShowSummary(!shouldShowSummary)}
            >
              {shouldShowSummary ? 'Hide' : 'Show'} TLDR{' '}
              <ArrowIcon
                className={classNames(
                  'ml-2 transition-transform ease-in-out duration-300',
                  !shouldShowSummary && 'rotate-180',
                )}
              />
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default SharePostContent;
