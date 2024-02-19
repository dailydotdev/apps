import React from 'react';
import classNames from 'classnames';
import { FilterOnboardingV4 } from './FilterOnboardingV4';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/ButtonV2';
import { REQUIRED_TAGS_THRESHOLD } from './common';
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
        <div className="mt-10 flex items-center justify-center gap-10 text-theme-label-quaternary typo-callout">
          <div className="h-px flex-1 bg-theme-divider-tertiary" />
          <Button
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
              setPreviewFeedVisible((current) => !current);
            }}
          >
            {isFeedPreviewEnabled
              ? `${isPreviewFeedVisible ? 'Hide' : 'Show'} feed preview`
              : `${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
          </Button>
          <div className="h-px flex-1 bg-theme-divider-tertiary" />
        </div>
      </div>
    </LayoutHeader>
  );
};
