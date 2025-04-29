import type { ReactElement } from 'react';
import React from 'react';
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

interface MarkdownPostContentProps {
  post: Post;
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

function MarkdownPostContent({ post }: MarkdownPostContentProps): ReactElement {
  const { title } = useSmartTitle(post);
  const hasVideo = !!post.flags?.coverVideo;

  return (
    <>
      <div className="my-6">
        <h1 className="whitespace-pre-line font-bold typo-title2">{title}</h1>
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
                  className="mb-10 h-auto max-h-[62.5rem] w-full rounded-12 object-cover"
                  fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                />
              </a>
            </Link>
          )}
          {hasVideo && (
            <LazyVideo
              eager
              ratio="52%"
              videoSrc={post.flags.coverVideo}
              poster={post.image}
              className="mb-10 h-auto max-h-[62.5rem] w-full rounded-12 object-cover"
            />
          )}
        </>
      )}
      <Markdown
        content={post.contentHtml}
        className={post.type !== PostType.Welcome && 'mb-5'}
      />
      {post.type === PostType.Welcome && post.image && (
        <MarkdownPostImage imgSrc={post.image} className="mb-5 mt-8" />
      )}
    </>
  );
}

export default MarkdownPostContent;
