import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import Markdown from '../Markdown';
import type { LazyImageProps } from '../LazyImage';
import { LazyImage, LazyVideo } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { ContentEmbeds } from '../contentEmbeds/ContentEmbeds';
import { ParagraphSnapshotButtons } from '../../features/snapshot/ParagraphSnapshotButtons';

interface MarkdownPostContentProps {
  post: Post;
  isCompactSpacing?: boolean;
}

export const MarkdownPostImage = ({
  imgSrc,
  className,
}: Pick<LazyImageProps, 'imgSrc' | 'className'>): ReactElement => (
  <div
    className={classNames(
      'block h-fit max-w-sm cursor-pointer overflow-hidden rounded-16',
      className,
    )}
  >
    <LazyImage
      imgSrc={imgSrc}
      imgAlt="Post cover image"
      ratio="52%"
      eager
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
    />
  </div>
);

function MarkdownPostContent({
  post,
  isCompactSpacing,
}: MarkdownPostContentProps): ReactElement {
  const { title } = useSmartTitle(post);
  // A markdown body has no summary to trail, so the control sits per paragraph.
  const bodyRef = useRef<HTMLDivElement>(null);
  const coverVideo = post.flags?.coverVideo;
  const hasVideo = !!coverVideo;
  const headerClassName = isCompactSpacing ? 'my-4' : 'my-6';
  const mediaMarginClassName = isCompactSpacing ? 'mb-7' : 'mb-10';

  return (
    <>
      <div className={headerClassName}>
        <h1 className="whitespace-pre-line break-words text-[2rem] font-bold leading-[1.3]">
          {title}
        </h1>
        {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
      </div>
      {post.type === PostType.Freeform && (
        <>
          {!hasVideo && !!post.image && (
            <Link href={post.image}>
              <a target="_blank" rel="noopener noreferrer">
                <LazyImage
                  eager={false}
                  fetchPriority="low"
                  ratio="52%"
                  imgSrc={post.image}
                  imgAlt="Post cover image"
                  className={classNames(
                    mediaMarginClassName,
                    'h-auto max-h-[62.5rem] w-full rounded-12 object-cover',
                  )}
                  fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                />
              </a>
            </Link>
          )}
          {hasVideo && (
            <LazyVideo
              eager
              ratio="52%"
              videoSrc={coverVideo}
              poster={post.image}
              className={classNames(
                mediaMarginClassName,
                'h-auto max-h-[62.5rem] w-full rounded-12 object-cover',
              )}
            />
          )}
        </>
      )}
      {/* The spacing rides the wrapper, not the body: the column is a flex
          container, so a margin left inside this new flex item would no longer
          reach the block below it. */}
      <div
        ref={bodyRef}
        className={post.type !== PostType.Welcome ? 'mb-5' : undefined}
      >
        <Markdown content={post.contentHtml ?? ''} className="break-words" />
        <ParagraphSnapshotButtons containerRef={bodyRef} post={post} />
      </div>
      <ContentEmbeds
        embeds={post.contentEmbeds}
        variant="post"
        className={post.type !== PostType.Welcome ? 'mb-5' : undefined}
      />
      {post.type === PostType.Welcome && post.image && (
        <MarkdownPostImage imgSrc={post.image} className="mb-5 mt-8" />
      )}
    </>
  );
}

export default MarkdownPostContent;
