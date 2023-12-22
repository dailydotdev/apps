import React, { ReactElement, useContext } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

interface MobileMenuIconProps {
  sidebarExpanded: boolean;
  toggleSidebarExpanded: () => void;
}

export function MobileMenuIcon({
  sidebarExpanded,
  toggleSidebarExpanded,
}: MobileMenuIconProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const trackAndToggleSidebarExpanded = () => {
    trackEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  };

  return (
    <SimpleTooltip
      placement="right"
      content={`${sidebarExpanded ? 'Close' : 'Open'} sidebar`}
    >
      <Button
        onClick={trackAndToggleSidebarExpanded}
        position="absolute"
        className={`btn btn-primary -right-3 top-3 z-3 h-6 w-6 ${
          sidebarExpanded &&
          'invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'
        }`}
        buttonSize={ButtonSize.XSmall}
      >
        <ArrowIcon
          className={`typo-title3 ${
            sidebarExpanded ? '-rotate-90' : 'rotate-90'
          }`}
        />
      </Button>
    </SimpleTooltip>
  );
}
