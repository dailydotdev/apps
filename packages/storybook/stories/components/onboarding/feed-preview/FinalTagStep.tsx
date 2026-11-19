import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FeedPreviewControls } from '@dailydotdev/shared/src/components/feeds/FeedPreviewControls';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { REQUIRED_TAGS_THRESHOLD } from '@dailydotdev/shared/src/components/onboarding/common';
import { FunnelTargetId } from '@dailydotdev/shared/src/features/onboarding/types/funnelEvents';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { PREVIEW_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { TagStepFrame } from './TagStepFrame';
import type { VariantProps } from './TagStepFrame';
import { usePickedTags, useSyncHandlerTags } from './previewData';
import { TagProgressHeader, useMilestoneBurst } from './TagProgress';

// Production's preview constants from EditTag, unchanged.
const PREVIEW_MAX_COLUMNS = 3;
const PREVIEW_MAX_WIDTH = 'tablet:max-w-[70.75rem]';

// The production tag step with one change: the headline becomes the
// progress header. The feed preview below is EditTag's, untouched.
export const FinalTagStep = ({ onContinue }: VariantProps): ReactElement => {
  useSyncHandlerTags();
  const { user, trackingId } = useAuthContext();
  const { tags } = usePickedTags();
  const burstKey = useMilestoneBurst(tags.length);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const isPreviewEnabled = tags.length >= REQUIRED_TAGS_THRESHOLD;

  return (
    <TagStepFrame
      header={<TagProgressHeader burstKey={burstKey} count={tags.length} />}
      onContinue={onContinue}
    >
      <FeedPreviewControls
        isTagStyle
        isOpen={isPreviewVisible}
        isDisabled={!isPreviewEnabled}
        textDisabled={`${tags.length}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
        origin={Origin.EditTag}
        onClick={setPreviewVisible}
        data-funnel-track={FunnelTargetId.FeedPreview}
      />
      {isPreviewEnabled && isPreviewVisible && (
        <FeedLayoutProvider maxNumCards={PREVIEW_MAX_COLUMNS}>
          <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
            Change your tag selection until you&apos;re happy with your feed
            preview.
          </p>
          <Feed
            className={classNames(
              'relative mx-auto px-6 pt-14 tablet:left-1/2 tablet:w-screen tablet:-translate-x-1/2 laptop:pt-10',
              PREVIEW_MAX_WIDTH,
            )}
            feedName={OtherFeedPage.Preview}
            feedQueryKey={[RequestKey.FeedPreview, user?.id ?? trackingId]}
            query={PREVIEW_FEED_QUERY}
            showSearch={false}
            options={{ refetchOnMount: true }}
            allowPin
          />
        </FeedLayoutProvider>
      )}
    </TagStepFrame>
  );
};
