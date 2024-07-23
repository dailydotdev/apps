import React, { ReactElement, useState } from 'react';
import { CreateFeedButton, FilterOnboardingV4 } from '../../onboarding';
import { FeedPreviewControls } from '../../feeds';
import { REQUIRED_TAGS_THRESHOLD } from '../../onboarding/common';
import { Origin } from '../../../lib/log';
import FeedLayout from '../../FeedLayout';
import Feed from '../../Feed';
import { OtherFeedPage, RequestKey } from '../../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../../graphql/feed';
import { FeedSettings } from '../../../graphql/feedSettings';

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  onClick: () => void;
}
export const EditTag = ({
  feedSettings,
  userId,
  onClick,
}: EditTagProps): ReactElement => {
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

  return (
    <>
      <h2 className="text-center font-bold typo-large-title">
        Pick tags that are relevant to you
      </h2>
      <FilterOnboardingV4 className="mt-10 max-w-4xl" />
      <FeedPreviewControls
        isOpen={isPreviewVisible}
        isDisabled={!isPreviewEnabled}
        textDisabled={`${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
        origin={Origin.EditTag}
        onClick={setPreviewVisible}
      />
      {isPreviewEnabled && isPreviewVisible && (
        <FeedLayout>
          <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
            Change your tag selection until you&apos;re happy with your feed
            preview.
          </p>
          <Feed
            className="px-6 pt-14 laptop:pt-10"
            feedName={OtherFeedPage.Preview}
            feedQueryKey={[RequestKey.FeedPreview, userId]}
            query={PREVIEW_FEED_QUERY}
            showSearch={false}
            options={{ refetchOnMount: true }}
            allowPin
          />
          <CreateFeedButton className="mt-20" onClick={onClick} />
        </FeedLayout>
      )}
    </>
  );
};
