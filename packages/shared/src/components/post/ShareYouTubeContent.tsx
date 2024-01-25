import React, { ReactElement } from 'react';
import Link from 'next/link';
import PostSourceInfo from './PostSourceInfo';
import { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import YoutubeVideo from '../video/YoutubeVideo';
import { formatReadTime } from '../utilities';
import { combinedClicks } from '../../lib/click';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({
  post,
  onReadArticle,
}: ShareYouTubeContentProps): ReactElement {
  const onLinkClick = (e: React.MouseEvent) => {
    const selection = globalThis?.window?.getSelection();
    const hasSelection = selection?.anchorOffset !== selection?.focusOffset;

    if (hasSelection) {
      e.preventDefault();
    }
  };

  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer
        className="my-5"
        summary={post?.sharedPost?.summary}
        wrapper={(node) => (
          <Link href={post.commentsPermalink}>
            <a
              href={post.commentsPermalink}
              draggable="false"
              onClick={onLinkClick}
            >
              <SharedPostLink
                post={post}
                onGoToLinkProps={combinedClicks(onReadArticle)}
                className="m-4 flex flex-wrap font-bold typo-body"
              >
                {post.sharedPost.title}
              </SharedPostLink>
              <PostSourceInfo
                date={
                  post.sharedPost.readTime
                    ? `${formatReadTime(post.sharedPost.readTime)} watch time`
                    : undefined
                }
                source={post.sharedPost.source}
                className="mx-4 mb-4"
                size="small"
              />
              {node}
            </a>
          </Link>
        )}
      >
        <YoutubeVideo
          title={post?.sharedPost?.title}
          videoId={post?.sharedPost?.videoId}
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
