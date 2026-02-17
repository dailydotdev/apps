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

const UNKNOWN_SOURCE_ID = 'unknown';

const removeHandlePrefixFromTitle = ({
  title,
  sourceHandle,
  authorHandle,
}: {
  title?: string;
  sourceHandle?: string;
  authorHandle?: string;
}): string | undefined => {
  if (!title) {
    return title;
  }

  const handlePrefixes = [sourceHandle, authorHandle]
    .filter(Boolean)
    .map((handle) => `@${handle}:`);

  const matchedPrefix = handlePrefixes.find((prefix) =>
    title.startsWith(prefix),
  );
  if (matchedPrefix) {
    return title.slice(matchedPrefix.length).trim();
  }

  return title.replace(/^@[A-Za-z0-9_]+:\s*/, '').trim();
};

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
  const sourceHandle =
    post.source?.id === UNKNOWN_SOURCE_ID
      ? post.creatorTwitter || post.author?.username
      : post.source?.handle;
  const cleanedTitle =
    post.type === PostType.SocialTwitter
      ? removeHandlePrefixFromTitle({
          title,
          sourceHandle,
          authorHandle: post.author?.username,
        })
      : title;

  return (
    <>
      <div className="my-6">
        {post.type === PostType.SocialTwitter ? (
          <p className="whitespace-pre-line break-words typo-markdown">
            {cleanedTitle}
          </p>
        ) : (
          <h1 className="whitespace-pre-line break-words text-[2rem] font-bold leading-[1.3]">
            {cleanedTitle}
          </h1>
        )}
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
        className={classNames(
          'break-words',
          post.type !== PostType.Welcome && 'mb-5',
        )}
      />
      {post.type === PostType.Welcome && post.image && (
        <MarkdownPostImage imgSrc={post.image} className="mb-5 mt-8" />
      )}
    </>
  );
}

export default MarkdownPostContent;
