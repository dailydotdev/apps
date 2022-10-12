import classNames from 'classnames';
import React, { ReactElement } from 'react';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
import PointedAlert, { AlertPlacement } from '../alert/PointedAlert';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
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
    <PointedAlert
      offset={[12, 8]}
      isAlertDisabled={isAlertDisabled}
      onClose={() => onUpdateAlerts({ myFeed: null })}
      className={{ label: 'w-44', message: 'ml-4' }}
      message={filterAlertMessage}
      placement={sidebarRendered ? AlertPlacement.Right : AlertPlacement.Bottom}
    >
      <SimpleTooltip content="Feed filters">
        <Button
          className={classNames('mx-3 btn-tertiary')}
          onClick={onOpenFeedFilters}
          icon={<FilterIcon />}
        />
      </SimpleTooltip>
    </PointedAlert>
  );
}

export default FeedFilterMenuButton;
