import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { usePreviewFeed } from '../previewData';
import { PreviewEnd, PreviewList, PreviewTrigger } from '../PreviewKit';
import {
  TAG_MILESTONES,
  TagProgressBar,
  TagProgressHeader,
  useMilestoneBurst,
} from './TagProgress';

export type ProgressPlacement = 'top' | 'docked';

const [UNLOCK, SMARTER, DIALED_IN] = TAG_MILESTONES;

const getBuiltFrom = (count: number): string => {
  if (count < SMARTER) {
    return `Built from ${count} tags. A few more and it gets smarter.`;
  }

  if (count < DIALED_IN) {
    return `Built from ${count} tags and getting smarter.`;
  }

  return `Built from ${count} tags.`;
};

export const ShortList = ({
  onContinue,
  initialOpen = false,
  progressPlacement = 'top',
}: VariantProps & { progressPlacement?: ProgressPlacement }): ReactElement => {
  const { tags, posts, isReady, isRefreshing } = usePreviewFeed();
  const burstKey = useMilestoneBurst(tags.length);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isVisible = isOpen && isReady;
  const isDocked = progressPlacement === 'docked';

  return (
    <TagStepFrame
      header={
        isDocked ? undefined : (
          <TagProgressHeader burstKey={burstKey} count={tags.length} />
        )
      }
      docked={
        isDocked && (
          <TagProgressBar
            burstKey={burstKey}
            className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 pb-2 pt-3"
            count={tags.length}
          />
        )
      }
      isPreviewOpen={initialOpen}
      onContinue={onContinue}
    >
      <div key={String(isReady)} className="w-full animate-composer-in">
        <PreviewTrigger
          disabledLabel={`Feed preview unlocks at ${UNLOCK} tags`}
          isDisabled={!isReady}
          isOpen={isVisible}
          onClick={() => setIsOpen((value) => !value)}
          posts={posts}
        />
      </div>
      {isVisible && (
        <section className="flex w-full max-w-[27.5rem] flex-col">
          <h2 className="font-bold text-text-primary typo-body">
            Top posts this week from your tags
          </h2>
          <p className="text-text-tertiary typo-footnote">
            {getBuiltFrom(tags.length)}
          </p>
          <PreviewList
            className="mt-2"
            isRefreshing={isRefreshing}
            posts={posts}
          />
          <PreviewEnd />
        </section>
      )}
    </TagStepFrame>
  );
};
