import React, { ReactElement, useContext, useEffect } from 'react';
import { PlusIcon } from './icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
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
    <div className="mb-4 flex w-full flex-col items-center">
      <div className="flex flex-col items-center rounded-12 border border-accent-cabbage-default p-2 shadow-2-cabbage tablet:flex-row">
        <p className="ml-2 text-center transition-all typo-footnote tablet:text-left">
          {explainerCopy}
        </p>
        <Button
          className="ml-0 mt-4 tablet:ml-8 tablet:mt-0"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={onClick}
        >
          {buttonCopy}
        </Button>
      </div>
    </div>
  );
}
