import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../previewData';
import type { PreviewPost } from '../previewData';
import {
  PreviewEnd,
  PreviewPostRow,
  PreviewPostRowPlaceholder,
  PreviewTrigger,
} from '../PreviewKit';

export const SHORT_LIST_SIZE = 5;

export const PreviewList = ({
  posts,
  isRefreshing,
  freshIds,
  size = SHORT_LIST_SIZE,
  className,
}: {
  posts: PreviewPost[];
  isRefreshing: boolean;
  freshIds: Set<string>;
  size?: number;
  className?: string;
}): ReactElement => (
  <div
    aria-busy={isRefreshing}
    className={classNames(
      'flex w-full flex-col divide-y divide-border-subtlest-tertiary',
      className,
    )}
  >
    {isRefreshing
      ? Array.from({ length: size }, (_, index) => (
          <PreviewPostRowPlaceholder key={index} />
        ))
      : posts
          .slice(0, size)
          .map((item) => (
            <PreviewPostRow
              key={item.post.id}
              {...item}
              isFresh={freshIds.has(item.post.id)}
            />
          ))}
  </div>
);

export const ShortList = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { posts, isReady, remaining, isRefreshing, freshIds } =
    usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isVisible = isOpen && isReady;

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      <PreviewTrigger
        disabledLabel={getPickMoreCopy(remaining)}
        isDisabled={!isReady}
        isOpen={isVisible}
        onClick={() => setIsOpen((value) => !value)}
        posts={posts}
      />
      {isVisible && (
        <section className="flex w-full max-w-[27.5rem] flex-col">
          <h2 className="font-bold text-text-primary typo-body">
            Top posts this week from your tags
          </h2>
          <p className="text-text-tertiary typo-footnote">
            Changes as you pick tags.
          </p>
          <PreviewList
            className="mt-2"
            freshIds={freshIds}
            isRefreshing={isRefreshing}
            posts={posts}
          />
          <PreviewEnd />
        </section>
      )}
    </TagStepFrame>
  );
};
