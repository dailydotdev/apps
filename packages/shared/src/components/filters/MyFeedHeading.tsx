import React, { ReactElement, useContext } from 'react';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
import AlertPointer, { AlertPlacement } from '../alert/AlertPointer';
import { filterAlertMessage } from './FeedFilters';
import { Alerts } from '../../graphql/alerts';
import { FeedHeading } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';

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
  if (!hasFiltered) {
    return <FeedHeading>My feed</FeedHeading>;
  }

  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.ManageTags,
      target_type: TargetType.ManageTag,
      target_id: TargetId.MyFeedHeading,
    });
    onOpenFeedFilters();
  };

  return (
    <AlertPointer
      offset={[4, 8]}
      isAlertDisabled={isAlertDisabled}
      onClose={() => onUpdateAlerts({ myFeed: null })}
      className={{ label: 'w-44', message: 'ml-4', wrapper: 'mr-auto' }}
      message={filterAlertMessage}
      placement={sidebarRendered ? AlertPlacement.Right : AlertPlacement.Bottom}
    >
      <Button
        className="mr-auto btn-tertiary headline"
        onClick={onClick}
        rightIcon={<FilterIcon />}
      >
        My feed
      </Button>
    </AlertPointer>
  );
}

export default MyFeedHeading;
