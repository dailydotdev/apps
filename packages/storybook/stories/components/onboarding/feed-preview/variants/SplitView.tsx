import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../previewData';
import {
  PreviewEnd,
  PreviewPostRowPlaceholder,
  SourceStack,
} from '../PreviewKit';
import { PreviewList, ShortList } from './ShortList';

const SPLIT_LIST_SIZE = 4;

export const SplitView = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { tags, posts, isReady, remaining, isRefreshing, freshIds } =
    usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isVisible = isOpen && isReady;

  if (!isLaptop) {
    return <ShortList initialOpen={initialOpen} onContinue={onContinue} />;
  }

  return (
    <TagStepFrame
      onContinue={onContinue}
      aside={
        <aside className="sticky top-6 flex flex-col rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <h2 className="font-bold text-text-primary typo-body">
                Your feed
              </h2>
              <p className="text-text-tertiary typo-footnote">
                {isReady
                  ? `Built from ${tags.length} tags`
                  : getPickMoreCopy(remaining)}
              </p>
            </div>
            {isVisible && (
              <Button
                onClick={() => setIsOpen(false)}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
              >
                Hide
              </Button>
            )}
          </header>
          {isVisible ? (
            <>
              <PreviewList
                className="mt-2"
                freshIds={freshIds}
                isRefreshing={isRefreshing}
                posts={posts}
                size={SPLIT_LIST_SIZE}
              />
              <PreviewEnd isOnSurface />
            </>
          ) : (
            <div className="relative mt-4 flex flex-col">
              <div aria-hidden className="flex flex-col opacity-40">
                {Array.from({ length: 3 }, (_, index) => (
                  <PreviewPostRowPlaceholder key={index} />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Button
                  className="!pl-2"
                  disabled={!isReady}
                  icon={isReady ? <SourceStack posts={posts} /> : <EyeIcon />}
                  onClick={() => setIsOpen(true)}
                  size={ButtonSize.Medium}
                  variant={ButtonVariant.Primary}
                >
                  Preview your feed
                </Button>
              </div>
            </div>
          )}
        </aside>
      }
    />
  );
};
