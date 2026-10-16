import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { usePreviewFeed } from '../../previewData';
import { PreviewList } from '../../PreviewKit';

const COLLAPSED_SIZE = 3;
const EXPANDED_SIZE = 6;

export const AutoStrip = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { posts, isReady, isRefreshing, freshIds } = usePreviewFeed();
  const [isExpanded, setIsExpanded] = useState(initialOpen);

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      {isReady && (
        <section className="flex w-full max-w-[27.5rem] flex-col">
          <h2 className="flex items-center gap-1 font-bold text-text-primary typo-body">
            <TrendingIcon className="text-brand-default" />
            Trending in your interests
          </h2>
          <PreviewList
            freshIds={freshIds}
            isRefreshing={isRefreshing}
            posts={posts}
            size={isExpanded ? EXPANDED_SIZE : COLLAPSED_SIZE}
          />
          <Button
            className="self-center"
            onClick={() => setIsExpanded((value) => !value)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        </section>
      )}
    </TagStepFrame>
  );
};
