import React, { ReactElement } from 'react';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
import AlertPointer, { AlertPlacement } from '../alert/AlertPointer';
import { filterAlertMessage } from './FeedFilters';
import { Alerts } from '../../graphql/alerts';

interface FeedFilterMenuButtonProps {
  isAlertDisabled: boolean;
  sidebarRendered: boolean;
  onOpenFeedFilters: () => void;
  onUpdateAlerts: (alerts: Alerts) => void;
}

function FeedFilterMenuButton({
  isAlertDisabled,
  sidebarRendered,
  onUpdateAlerts,
  onOpenFeedFilters,
}: FeedFilterMenuButtonProps): ReactElement {
  return (
    <AlertPointer
      offset={[4, 8]}
      isAlertDisabled={isAlertDisabled}
      onClose={() => onUpdateAlerts({ myFeed: null })}
      className={{ label: 'w-44', message: 'ml-4' }}
      message={filterAlertMessage}
      placement={sidebarRendered ? AlertPlacement.Right : AlertPlacement.Bottom}
    >
      <Button
        className="btn-tertiary headline"
        onClick={onOpenFeedFilters}
        rightIcon={<FilterIcon />}
      >
        My feed
      </Button>
    </AlertPointer>
  );
}

export default FeedFilterMenuButton;
