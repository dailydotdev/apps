import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { IFlags } from 'flagsmith';
import PlusIcon from './icons/Plus';
import { Button } from './buttons/Button';
import { Features, getFeatureValue } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { getThemeColor } from './utilities';

interface CreateMyFeedButtonProps {
  flags: IFlags;
  action: () => unknown;
}

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): Partial<AnalyticsEvent> => ({
  event_name: eventName,
  target_type: 'my feed button',
  target_id: 'feed_top',
  feed_item_title: copy,
});

export default function CreateMyFeedButton({
  flags,
  action,
}: CreateMyFeedButtonProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const buttonCopy = getFeatureValue(Features.MyFeedButtonCopy, flags);
  const buttonColor = getThemeColor(
    getFeatureValue(Features.MyFeedButtonColor, flags),
    Features.MyFeedButtonColor.defaultValue,
  );
  const explainerCopy = getFeatureValue(Features.MyFeedExplainerCopy, flags);
  const explainerColor = getThemeColor(
    getFeatureValue(Features.MyFeedExplainerColor, flags),
    Features.MyFeedExplainerColor.defaultValue,
  );
  const onClick = () => {
    trackEvent(getAnalyticsEvent('click', buttonCopy));
    action();
  };

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', buttonCopy));
  }, [buttonCopy]);

  return (
    <div className="flex flex-col items-center mb-4 w-full">
      <div
        className={classNames(
          'p-2 border flex-col tablet:flex-row flex items-center rounded-12',
          explainerColor.border,
          explainerColor.shadow,
        )}
      >
        <p className="ml-2 text-center tablet:text-left transition-all typo-footnote">
          {explainerCopy}
        </p>
        <Button
          className={classNames(
            'ml-0 mt-4 tablet:ml-8 tablet:mt-0',
            buttonColor.button,
          )}
          buttonSize="small"
          icon={<PlusIcon />}
          onClick={onClick}
        >
          {buttonCopy}
        </Button>
      </div>
    </div>
  );
}
