import React, { ReactElement, useContext } from 'react';
import FilterIcon from '../icons/Filter';
import { Button, ButtonSize } from '../buttons/Button';
import AlertPointer, {
  AlertPlacement,
  AlertPointerProps,
} from '../alert/AlertPointer';
import { filterAlertMessage } from './FeedFilters';
import { Alerts } from '../../graphql/alerts';
import { FeedHeading } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { useFeature } from '../GrowthBookProvider';
import { Features } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

interface MyFeedHeadingProps {
  hasFiltered: boolean;
  isAlertDisabled: boolean;
  sidebarRendered: boolean;
  onOpenFeedFilters: () => void;
  onUpdateAlerts: (alerts: Alerts) => void;
}

function MyFeedHeading({
  hasFiltered,
  isAlertDisabled,
  sidebarRendered,
  onUpdateAlerts,
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const searchVersion = useFeature(Features.Search);

  const onClick = () => {
    trackEvent({ event_name: AnalyticsEvent.ManageTags });
    onOpenFeedFilters();
  };

  if (!hasFiltered) {
    return <FeedHeading>My feed</FeedHeading>;
  }

  const alertProps: Omit<AlertPointerProps, 'children'> = {
    offset: sidebarRendered ? [4, 0] : [-32, 4],
    isAlertDisabled,
    onClose: () => onUpdateAlerts({ myFeed: null }),
    className: {
      label: 'w-44',
      message: !sidebarRendered ? 'ml-4' : null,
      wrapper: 'mr-auto',
    },
    message: filterAlertMessage,
    placement: sidebarRendered ? AlertPlacement.Right : AlertPlacement.Bottom,
  };

  if (searchVersion === SearchExperiment.Control) {
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

  return (
    // TODO: Fix the placement of the alert pointer
    <AlertPointer {...alertProps} isAlertDisabled>
      <Button
        className="mr-auto btn-tertiary"
        onClick={onClick}
        icon={<FilterIcon />}
      />
    </AlertPointer>
  );
}

export default MyFeedHeading;
