import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import {
  getPickMoreCopy,
  getPostsForTag,
  usePreviewFeed,
} from '../previewData';
import { PreviewPostRow } from '../PreviewKit';

const SEGMENT_COLORS = [
  'bg-accent-cabbage-default',
  'bg-accent-water-default',
  'bg-accent-avocado-default',
  'bg-accent-cheese-default',
  'bg-accent-bacon-default',
  'bg-accent-blueCheese-default',
  'bg-accent-onion-default',
  'bg-accent-lettuce-default',
  'bg-accent-burger-default',
  'bg-accent-ketchup-default',
];

// A tag's share of the feed by the attention its posts get this week, so the
// bar says what the feed will mostly talk about, not just which tags exist.
const getMix = (tags: string[]) => {
  const weights = tags.map((tag) =>
    getPostsForTag(tag).reduce(
      (sum, post) => sum + (post.numUpvotes ?? 0) + (post.numComments ?? 0),
      1,
    ),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  return tags
    .map((tag, index) => ({
      tag,
      share: weights[index] / total,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    }))
    .sort((a, b) => b.share - a.share);
};

export const FeedMix = ({ onContinue }: VariantProps): ReactElement => {
  const { tags, isReady, remaining } = usePreviewFeed();
  const mix = getMix(tags);
  const [focusedTag, setFocusedTag] = useState<string>();
  const activeTag =
    focusedTag && tags.includes(focusedTag) ? focusedTag : mix[0]?.tag;
  const [topPost] = activeTag ? getPostsForTag(activeTag) : [];

  return (
    <TagStepFrame onContinue={onContinue}>
      <section className="flex w-full max-w-[27.5rem] flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold typo-body">Your feed&apos;s mix</h2>
          {!isReady && (
            <span className="text-text-tertiary typo-footnote">
              {getPickMoreCopy(remaining)}
            </span>
          )}
        </div>
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-max bg-surface-float">
          {mix.map(({ tag, share, color }) => (
            <button
              key={tag}
              aria-label={`#${tag}, ${Math.round(share * 100)}%`}
              className={classNames(
                'h-full transition-[flex-grow,opacity] duration-500 ease-out',
                color,
                activeTag !== tag && 'opacity-64',
              )}
              onClick={() => setFocusedTag(tag)}
              style={{ flexGrow: share, flexBasis: 0 }}
              type="button"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {mix.map(({ tag, share, color }) => (
            <button
              key={tag}
              className={classNames(
                'flex items-center gap-1.5 typo-footnote',
                activeTag === tag ? 'text-text-primary' : 'text-text-tertiary',
              )}
              onClick={() => setFocusedTag(tag)}
              type="button"
            >
              <span className={classNames('size-2 rounded-max', color)} />#{tag}
              <span className="tabular-nums">{Math.round(share * 100)}%</span>
            </button>
          ))}
        </div>
        {isReady && topPost && (
          <div className="rounded-16 border border-border-subtlest-tertiary px-3">
            <PreviewPostRow
              key={topPost.id}
              className="animate-composer-in"
              matchedTags={activeTag ? [activeTag] : []}
              post={topPost}
            />
          </div>
        )}
      </section>
    </TagStepFrame>
  );
};
