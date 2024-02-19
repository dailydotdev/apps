import React, { useState } from 'react';
import classNames from 'classnames';
import { FilterOnboardingV4 } from './FilterOnboardingV4';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/ButtonV2';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ArrowIcon } from '../icons';

export const NewFilter = (): JSX.Element => {
  const { feedSettings } = useFeedSettings();
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

  return (
    <div className="flex max-w-full flex-col">
      <div className="fixed">
        <span>Pick tags that are relevant to you</span>
        <span>You can always modify your tags later</span>

        <Button>Create my feed</Button>
      </div>
      <FilterOnboardingV4 />
      <Button
        className="mt-10"
        variant={
          isPreviewVisible ? ButtonVariant.Primary : ButtonVariant.Secondary
        }
        disabled={!isPreviewEnabled}
        icon={
          <ArrowIcon
            className={classNames(!isPreviewVisible && 'rotate-180')}
          />
        }
        iconPosition={ButtonIconPosition.Right}
        onClick={() => {
          setPreviewVisible((current) => {
            const newValue = !current;

            // trackEvent({
            //   event_name: AnalyticsEvent.ToggleFeedPreview,
            //   target_id: newValue,
            //   extra: JSON.stringify({ origin: Origin.EditTag }),
            // });

            return newValue;
          });
        }}
      >
        {isPreviewEnabled
          ? `${isPreviewVisible ? 'Hide' : 'Show'} feed preview`
          : `${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
      </Button>
    </div>
  );
};
