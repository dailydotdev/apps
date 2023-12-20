import React, { ReactElement, useContext, useEffect } from 'react';
import PlusIcon from './icons/Plus';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/ButtonV2';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';

interface CreateMyFeedButtonProps {
  action: () => unknown;
}

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): AnalyticsEvent => ({
  event_name: eventName,
  target_type: 'my feed button',
  target_id: 'feed_top',
  feed_item_title: copy,
});

export default function CreateMyFeedButton({
  action,
}: CreateMyFeedButtonProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const buttonCopy = 'Choose tags';
  const explainerCopy = 'Get the content you need by creating a personal feed';
  const onClick = () => {
    trackEvent(getAnalyticsEvent('click', buttonCopy));
    action();
  };

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', buttonCopy));
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonCopy]);

  return (
    <div className="flex flex-col items-center mb-4 w-full">
      <div className="flex flex-col tablet:flex-row items-center p-2 rounded-12 border shadow-2-cabbage border-theme-color-cabbage">
        <p className="ml-2 text-center tablet:text-left transition-all typo-footnote">
          {explainerCopy}
        </p>
        <Button
          className="mt-4 tablet:mt-0 ml-0 tablet:ml-8"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={onClick}
          data-testid="create_myfeed"
        >
          {buttonCopy}
        </Button>
      </div>
    </div>
  );
}
