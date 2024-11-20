import React, { ReactElement, useState } from 'react';
import { FeedPreviewControls } from '../feeds';
import { OnboardingStep, REQUIRED_TAGS_THRESHOLD } from './common';
import { Origin } from '../../lib/log';
import Feed from '../Feed';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import { FeedSettings } from '../../graphql/feedSettings';
import { CreateFeedButton } from './CreateFeedButton';
import { TagSelection } from '../tags/TagSelection';
import { FeedLayoutProvider } from '../../contexts/FeedContext';

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  onClick: () => void;
  customActionName?: string;
  activeScreen?: OnboardingStep;
}
export const EditTag = ({
  feedSettings,
  userId,
  onClick,
  customActionName,
  activeScreen,
}: EditTagProps): ReactElement => {
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

  return (
    <>
      <h2 className="text-center font-bold typo-large-title">
        Pick tags that are relevant to you
      </h2>
      <TagSelection className="mt-10 max-w-4xl" />
      <FeedPreviewControls
        isOpen={isPreviewVisible}
        isDisabled={!isPreviewEnabled}
        textDisabled={`${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
        origin={Origin.EditTag}
        onClick={setPreviewVisible}
      />
      {isPreviewEnabled && isPreviewVisible && (
        <FeedLayoutProvider>
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
          <CreateFeedButton
            className="mt-20"
            onClick={onClick}
            customActionName={customActionName}
            activeScreen={activeScreen}
          />
        </FeedLayoutProvider>
      )}
    </>
  );
};
