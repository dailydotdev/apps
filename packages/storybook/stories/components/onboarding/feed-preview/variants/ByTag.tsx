import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import {
  getPickMoreCopy,
  getPostsForTag,
  usePreviewFeed,
} from '../previewData';
import { PreviewEnd, PreviewPostTile, PreviewTrigger } from '../PreviewKit';

const TILES_PER_TAG = 3;

export const ByTag = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags, posts, isReady, remaining } = usePreviewFeed();
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
        <section className="flex w-full max-w-[27.5rem] flex-col gap-6 tablet:max-w-[44rem]">
          <p className="text-center text-text-tertiary typo-footnote">
            What each tag adds to your feed this week.
          </p>
          {tags.map((tag) => (
            <div key={tag} className="flex flex-col gap-3">
              <h2 className="font-bold text-text-primary typo-body">#{tag}</h2>
              <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6">
                {getPostsForTag(tag)
                  .slice(0, TILES_PER_TAG)
                  .map((post) => (
                    <PreviewPostTile
                      key={post.id}
                      post={post}
                      matchedTags={[]}
                    />
                  ))}
              </div>
            </div>
          ))}
          <PreviewEnd />
        </section>
      )}
    </TagStepFrame>
  );
};
