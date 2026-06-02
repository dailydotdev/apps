import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import usePostContent from '../../../hooks/usePostContent';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import PostMetadata from '../../cards/common/PostMetadata';
import YoutubeVideo from '../../video/YoutubeVideo';
import { PostHero } from '../experience/PostHero';
import { PostInsightPanel } from '../experience/PostInsightPanel';
import { PostTopicChips } from '../PostTopicChips';
import {
  getPostTopicLabel,
  getPostTopicTags,
} from '../anonymousPostExperience';
import { PostDiscussionPanel } from './PostDiscussionPanel';

export type FocusCardLeftVariant = 'lean' | 'rich';

interface PostFocusCardProps {
  post: Post;
  origin: PostOrigin;
  leftVariant?: FocusCardLeftVariant;
  /**
   * Anchor id the "jump to related" teaser scrolls to (the discovery feed).
   */
  discoveryAnchorId?: string;
}

/**
 * Pulls the first sentences out of the summary to fake "key takeaways" for the
 * Rich mockup variant. Real key points would come from the backend.
 */
const getKeyPoints = (summary?: string): string[] => {
  if (!summary) {
    return [];
  }

  return summary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 24)
    .slice(0, 3);
};

export const PostFocusCard = ({
  post,
  origin,
  leftVariant = 'rich',
  discoveryAnchorId,
}: PostFocusCardProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  const { title } = useSmartTitle(post);
  const { onReadArticle } = usePostContent({ origin, post });
  const { onReadClick: onReaderInstallGateClick } =
    useReaderInstallPromptGate(post);
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };

  const topics = getPostTopicTags(post);
  const topicLabel = getPostTopicLabel(topics);
  const keyPoints = leftVariant === 'rich' ? getKeyPoints(post.summary) : [];

  return (
    <article
      className="relative flex w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2"
      data-testid="post-focus-card"
    >
      <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -left-20 -top-20 size-80 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/10 pointer-events-none absolute -right-16 top-16 size-72 rounded-full blur-3xl" />

      <div className="relative z-1">
        <PostHero
          isVideoType={isVideoType}
          metadata={
            <PostMetadata
              className="!typo-callout"
              createdAt={post.createdAt}
              isVideoType={isVideoType}
              readTime={post.readTime}
            />
          }
          onImageClick={handleImageClick}
          onReadArticle={onReadArticle}
          post={post}
          title={title}
        />
      </div>

      <div className="relative z-1 grid gap-6 border-t border-border-subtlest-tertiary p-4 tablet:p-6 laptop:grid-cols-[minmax(0,1fr)_24rem] laptop:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          {isVideoType && post.videoId && (
            <YoutubeVideo
              className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3"
              placeholderProps={{ post, onWatchVideo: onReadArticle }}
              videoId={post.videoId}
            />
          )}

          <PostInsightPanel post={post} />

          {leftVariant === 'rich' && keyPoints.length > 0 && (
            <section className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4">
              <p className="font-bold text-text-primary typo-title3">
                Key takeaways
              </p>
              <ul className="flex flex-col gap-2">
                {keyPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-text-secondary typo-callout"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-cabbage-default"
                    />
                    <span className="min-w-0">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {leftVariant === 'rich' && (
            <a
              href={discoveryAnchorId ? `#${discoveryAnchorId}` : undefined}
              className={classNames(
                'flex flex-col gap-3 rounded-24 border border-dashed border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors',
                discoveryAnchorId && 'hover:border-accent-cabbage-default',
              )}
            >
              <p className="text-accent-cabbage-default typo-caption1">
                Keep exploring
              </p>
              <p className="font-bold text-text-primary typo-title3">
                More developer stories on {topicLabel}
              </p>
              <PostTopicChips topics={topics} />
            </a>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3 laptop:max-h-[44rem] laptop:overflow-y-auto laptop:pr-1">
          <div className="flex flex-col gap-1">
            <p className="text-text-tertiary typo-caption1">Community</p>
            <h2 className="font-bold text-text-primary typo-title2">
              What developers are saying
            </h2>
          </div>
          <PostDiscussionPanel post={post} origin={origin} />
        </div>
      </div>
    </article>
  );
};
