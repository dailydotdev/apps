import React, { HTMLAttributes, ReactElement } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Button, ButtonElementType, ButtonVariant } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips';
import { isTesting } from '../../lib/constants';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { OnboardingStep, REQUIRED_TAGS_THRESHOLD } from './common';
import { useAdvancedSettings, useViewSize, ViewSize } from '../../hooks';
import { getContentTypeNotEmpty } from '../auth/OnboardingSteps/ContentTypes/helpers';

export type CreateFeedButtonProps = {
  className?: string;
  customActionName?: string;
  activeScreen?: OnboardingStep;
} & Pick<HTMLAttributes<ButtonElementType<'button'>>, 'onClick'>;

export const CreateFeedButton = ({
  className,
  onClick,
  customActionName,
  activeScreen,
}: CreateFeedButtonProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { advancedSettings } = useFeedSettings();
  const { selectedSettings, checkSourceBlocked } = useAdvancedSettings();

  const contentTypeStep = activeScreen === OnboardingStep.ContentTypes;

  const contentTypeNotEmpty =
    !!getContentTypeNotEmpty({
      advancedSettings,
      selectedSettings,
      checkSourceBlocked,
    }) && contentTypeStep;
  const { feedSettings } = useFeedSettings();

  const tagsCount = feedSettings?.includeTags?.length || 0;
  const tagsCountMatch =
    tagsCount >= REQUIRED_TAGS_THRESHOLD &&
    activeScreen === OnboardingStep.EditTag;

  const canCreateFeed = tagsCountMatch || contentTypeNotEmpty;
  const { sidebarRendered } = useSidebarRendered();
  const buttonName =
    customActionName ??
    `Create ${!sidebarRendered ? '' : 'personalized'} feed ➔`;

  const tooltipName = () => {
    if (activeScreen === OnboardingStep.EditTag && !canCreateFeed) {
      return `Choose at least ${REQUIRED_TAGS_THRESHOLD} tags`;
    }
    if (contentTypeStep && !canCreateFeed) {
      return 'Choose at least one content type';
    }
    return '';
  };

  const tooltipProps = {
    ...(contentTypeStep ? { visible: !canCreateFeed && isLaptop } : {}),
  };

  return (
    <SimpleTooltip
      content={tooltipName()}
      forceLoad={!isTesting}
      {...tooltipProps}
    >
      <div className="relative">
        <Button
          className={className}
          variant={ButtonVariant.Primary}
          disabled={!canCreateFeed}
          onClick={onClick}
        >
          {buttonName}
        </Button>
      </div>
    </SimpleTooltip>
  );
};
