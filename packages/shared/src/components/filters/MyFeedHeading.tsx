import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
import AlertPointer, {
  AlertPlacement,
  AlertPointerProps,
} from '../alert/AlertPointer';
import { filterAlertMessage } from './FeedFilters';
import { Alerts } from '../../graphql/alerts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

interface MyFeedHeadingProps {
  isAlertDisabled: boolean;
  sidebarRendered: boolean;
  onOpenFeedFilters: () => void;
  onUpdateAlerts: (alerts: Alerts) => void;
}

function MyFeedHeading({
  isAlertDisabled,
  sidebarRendered,
  onUpdateAlerts,
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const searchVersion = useFeature(feature.search);

  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    onOpenFeedFilters();
  };

  const alertProps: Omit<AlertPointerProps, 'children'> = {
    offset: sidebarRendered ? [4, 0] : [-32, 4],
    isAlertDisabled,
    onClose: () => onUpdateAlerts({ myFeed: null }),
    className: {
      label: 'w-44',
      message: classNames(
        'bg-theme-bg-primary',
        !sidebarRendered ? 'ml-4' : null,
        searchVersion === SearchExperiment.V1 && '-left-20',
      ),
      wrapper: 'mr-auto',
      container: 'z-tooltip',
    },
    message: filterAlertMessage,
    placement:
      sidebarRendered && searchVersion === SearchExperiment.Control
        ? AlertPlacement.Right
        : AlertPlacement.Bottom,
  };

  if (searchVersion === SearchExperiment.V1) {
    return (
      <AlertPointer {...alertProps} offset={[0, 0]}>
        <Button
          className="mr-auto btn-tertiaryFloat"
          onClick={onClick}
          icon={<FilterIcon />}
        />
      </AlertPointer>
    );
  }

  return (
    <AlertPointer {...alertProps}>
      <Button
        className="mr-auto btn-tertiary"
        onClick={onClick}
        rightIcon={<FilterIcon />}
      >
        My feed
      </Button>
    </AlertPointer>
  );
}

export default MyFeedHeading;
