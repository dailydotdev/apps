import type { ReactElement } from 'react';
import React, { useState } from 'react';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { PREVIEW_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import {
  getPickMoreCopy,
  usePreviewFeed,
  useSyncHandlerTags,
} from '../../previewData';
import { PreviewEnd, PreviewTrigger } from '../../PreviewKit';

const COLUMNS = 2;
const CARDS_MOBILE = 2;
const CARDS_DESKTOP = 4;

export const RealCards = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  useSyncHandlerTags(isTablet ? CARDS_DESKTOP : CARDS_MOBILE);
  const { user } = useAuthContext();
  const { posts, isReady, remaining } = usePreviewFeed();
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
        <section className="flex w-full flex-col items-center">
          <h2 className="font-bold text-text-primary typo-body">
            Top posts this week from your tags
          </h2>
          <div className="w-full tablet:max-w-[44.5rem]">
            <FeedLayoutProvider maxNumCards={COLUMNS}>
              <Feed
                className="relative mx-auto w-full pt-6"
                feedName={OtherFeedPage.Preview}
                feedQueryKey={[RequestKey.FeedPreview, user?.id, 'contained']}
                query={PREVIEW_FEED_QUERY}
                showSearch={false}
                options={{ refetchOnMount: true }}
              />
            </FeedLayoutProvider>
          </div>
          <PreviewEnd />
        </section>
      )}
    </TagStepFrame>
  );
};
