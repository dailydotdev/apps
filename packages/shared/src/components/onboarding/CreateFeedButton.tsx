import React, { HTMLAttributes, ReactElement } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Button, ButtonElementType, ButtonVariant } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips';
import { isTesting } from '../../lib/constants';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { REQUIRED_TAGS_THRESHOLD } from './common';

export type CreateFeedButtonProps = {
  className?: string;
  customActionName?: string;
} & Pick<HTMLAttributes<ButtonElementType<'button'>>, 'onClick'>;

export const CreateFeedButton = ({
  className,
  onClick,
  customActionName,
}: CreateFeedButtonProps): ReactElement => {
  const { feedSettings } = useFeedSettings();
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const canCreateFeed = tagsCount >= REQUIRED_TAGS_THRESHOLD;
  const { sidebarRendered } = useSidebarRendered();
  const buttonName =
    customActionName ??
    `Create ${!sidebarRendered ? '' : 'personalized'} feed ➔`;

  return (
    <SimpleTooltip
      content={
        canCreateFeed ? '' : `Choose at least ${REQUIRED_TAGS_THRESHOLD} tags`
      }
      forceLoad={!isTesting}
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
