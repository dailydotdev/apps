import React, { useContext } from 'react';
import classNames from 'classnames';
import { FilterOnboardingV4 } from './FilterOnboardingV4';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/ButtonV2';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ArrowIcon } from '../icons';
import { LayoutHeader } from '../layout/common';

export const OnboardingFeedHeader = ({
  isPreviewFeedVisible,
  setPreviewFeedVisible,
  isFeedPreviewEnabled,
  tagsCount,
}): JSX.Element => {
  return (
    <LayoutHeader className="flex-col overflow-x-visible">
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
            isPreviewFeedVisible
              ? ButtonVariant.Primary
              : ButtonVariant.Secondary
          }
          disabled={!isFeedPreviewEnabled}
          icon={
            <ArrowIcon
              className={classNames(!isPreviewFeedVisible && 'rotate-180')}
            />
          }
          iconPosition={ButtonIconPosition.Right}
          onClick={() => {
            setPreviewFeedVisible((current) => {
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
          {isFeedPreviewEnabled
            ? `${isPreviewFeedVisible ? 'Hide' : 'Show'} feed preview`
            : `${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
        </Button>
      </div>
    </LayoutHeader>
  );
};
