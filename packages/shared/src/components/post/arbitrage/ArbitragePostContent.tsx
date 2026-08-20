import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import PostMetadata from '../../cards/common/PostMetadata';
import PostSourceInfo from '../PostSourceInfo';
import { PostTagList } from '../tags/PostTagList';
import { PostContainer } from '../common';
import { PostContentContainerRaw } from './common';
import YoutubeVideo from '../../video/YoutubeVideo';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { TruncateText } from '../../utilities';
import Markdown from '../../Markdown';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ArbitragePostWidgets } from './ArbitragePostWidgets';
import { ArbitrageReadButton } from './ArbitrageReadButton';
import { ArbitrageComments } from './ArbitrageComments';

export interface ArbitragePostContentProps {
  post: Post;
  className?: string;
}

/**
 * Ad-monetised post template for paid and organic landing traffic.
 *
 * Forked from the classic PostContent layout rather than the focus card: for
 * scraped articles neither template has a body to render, so the focus card's
 * only real advantage does not apply, while the widget column it lacks carries
 * three always-viewable slots. Signup surfaces (PostAuthBanner,
 * CustomAuthBanner, PostSignupWidget) are deliberately absent — the header
 * login/signup buttons remain the only account entry point.
 */
export function ArbitragePostContent({
  post,
  className,
}: ArbitragePostContentProps): ReactElement {
  const isVideoType = isVideoPost(post);

  return (
    <PostContentContainerRaw className={className}>
      <PostContainer className="relative" data-testid="postContainer">
        <ArbitrageAdSlot
          slot={2}
          format={ArbitrageAdFormat.Leaderboard}
          reach="100%"
          refreshes
          className="mt-4"
        />

        <div className="my-6">
          <div className="mb-3 flex items-center">
            <PostSourceInfo className="min-w-0 flex-1" post={post} />
          </div>
          <h1
            className="break-words font-bold typo-large-title"
            data-testid="post-modal-title"
          >
            <a
              href={post.permalink}
              title="Go to post"
              target="_blank"
              rel="noopener"
            >
              {post.title}
            </a>
          </h1>
        </div>

        {isVideoType && (
          <YoutubeVideo
            placeholderProps={{ post, onWatchVideo: () => undefined }}
            videoId={post.videoId ?? ''}
            className="mb-7"
          />
        )}

        {!!post.summary && (
          <div className="mb-6 overflow-hidden text-text-secondary">
            <p className="select-text break-words typo-markdown">
              {post.summary}
            </p>
          </div>
        )}

        <ArbitrageAdSlot
          slot={3}
          format={ArbitrageAdFormat.Rectangle}
          reach="75%"
          refreshes
          className="mb-6"
        />

        <PostTagList post={post} />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          isVideoType={isVideoType}
          className="mb-6"
          domain={
            !isVideoType &&
            !!post.domain?.length && (
              <TruncateText>
                From{' '}
                <a
                  href={post.permalink}
                  title={post.domain}
                  target="_blank"
                  rel="noopener"
                  className="hover:underline"
                >
                  {post.domain}
                </a>
              </TruncateText>
            )
          }
        />

        {!isVideoType && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener"
            className="mb-6 block cursor-pointer overflow-hidden rounded-16"
            style={{ maxWidth: '25.625rem' }}
          >
            <LazyImage
              imgSrc={post.image}
              imgAlt="Post cover image"
              ratio="49%"
              eager
              fallbackSrc={cloudinaryPostImageCoverPlaceholder}
              fetchPriority="high"
            />
          </a>
        )}

        <ArbitrageReadButton post={post} />

        <ArbitrageAdSlot
          slot={4}
          format={ArbitrageAdFormat.Video}
          reach="55%"
          className="my-6"
        />

        {!!post.contentHtml && (
          <Markdown
            className="mb-6"
            content={post.contentHtml}
            appendTooltipTo={() => globalThis?.document?.body}
          />
        )}

        <ArbitrageAdSlot
          slot={5}
          format={ArbitrageAdFormat.Rectangle}
          reach="45%"
          className="mb-6"
        />

        <ArbitrageAdSlot
          slot={6}
          format={ArbitrageAdFormat.Rectangle}
          reach="32%"
          className="mb-6"
        />

        <ArbitrageComments post={post} />

        <ArbitrageAdSlot
          slot={9}
          format={ArbitrageAdFormat.RichMedia}
          reach="20%"
          className="mb-10"
        />
      </PostContainer>

      <ArbitragePostWidgets
        post={post}
        className="!gap-2 pb-8 pt-4 tablet:border-l tablet:border-border-subtlest-tertiary"
      />
    </PostContentContainerRaw>
  );
}
