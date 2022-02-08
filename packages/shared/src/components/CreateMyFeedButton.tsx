import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { IFlags } from 'flagsmith';
import PlusIcon from '../../icons/plus.svg';
import UserIcon from '../../icons/user.svg';
import { Button } from './buttons/Button';
import { Features, getFeatureValue } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { getThemeColor, ThemeColor } from './utilities';

interface CreateMyFeedButtonProps {
  type: string;
  sidebarExpanded?: boolean;
  flags: IFlags;
  action: () => unknown;
}

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
  type: string,
): Partial<AnalyticsEvent> => ({
  event_name: eventName,
  target_type: 'my feed button',
  target_id: type,
  feed_item_title: copy,
});

interface ClassProps {
  explainerColor?: ThemeColor;
  sidebarExpanded?: boolean;
}
const wrapperClasses = ({ sidebarExpanded }: ClassProps) => {
  return {
    sidebar: classNames('h-[8.125rem]', sidebarExpanded && 'justify-center'),
    feed_top: 'w-full items-center mb-8',
  };
};

const innerWrapClasses = ({ explainerColor, sidebarExpanded }: ClassProps) => {
  return {
    sidebar: classNames(
      'flex-col',
      sidebarExpanded ? `${explainerColor.shadow} border p-3 m-4` : 'mx-3',
    ),
    feed_title: `flex-row-reverse`,
    feed_top: `${explainerColor.shadow} p-2 border`,
    feed_ad: `${explainerColor.shadow} p-2 border flex-col flex-1 justify-center`,
  };
};
const textClass = ({ sidebarExpanded }: ClassProps) => {
  return {
    sidebar: classNames(
      'typo-footnote w-[11.25rem] mb-3 transform',
      sidebarExpanded
        ? 'opacity-100 ease-linear duration-200 delay-200'
        : 'duration-0 delay-0 opacity-0',
    ),
    feed_top: 'typo-footnote ml-2',
    feed_title: 'typo-footnote',
    feed_ad: 'typo-body font-bold mx-6 text-center mb-6',
  };
};
const buttonClass = {
  sidebar: 'w-full',
  feed_title: 'w-auto mr-4',
  feed_top: 'ml-8',
};

export default function CreateMyFeedButton({
  sidebarExpanded,
  flags,
  type,
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
    trackEvent(getAnalyticsEvent('click', buttonCopy, type));
    action();
  };
  const isSidebar = type === 'sidebar';

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', buttonCopy, type));
  }, [buttonCopy]);

  return (
    <div
      className={classNames(
        wrapperClasses({ sidebarExpanded })[type],
        'flex flex-col',
      )}
    >
      <div
        className={classNames(
          innerWrapClasses({ explainerColor, sidebarExpanded })[type],
          `flex items-center rounded-12`,
          explainerColor.border,
        )}
      >
        {type === 'feed_ad' && <UserIcon className="mb-4 typo-giga1" />}
        <p
          className={classNames(
            textClass({ sidebarExpanded })[type],
            ' transition-all',
          )}
        >
          {explainerCopy}
        </p>
        <Button
          className={classNames(buttonClass[type], buttonColor.button)}
          buttonSize={isSidebar && !sidebarExpanded ? 'xsmall' : 'small'}
          icon={<PlusIcon />}
          iconOnly={isSidebar && sidebarExpanded}
          onClick={onClick}
        >
          {((isSidebar && sidebarExpanded) || !isSidebar) && buttonCopy}
        </Button>
      </div>
    </div>
  );
}
