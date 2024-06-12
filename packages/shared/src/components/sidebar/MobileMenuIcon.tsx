import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import LogContext from '../../contexts/LogContext';
import { ArrowIcon } from '../icons';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

interface MobileMenuIconProps {
  sidebarExpanded: boolean;
  toggleSidebarExpanded: () => void;
}

export function MobileMenuIcon({
  sidebarExpanded,
  toggleSidebarExpanded,
}: MobileMenuIconProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const logAndToggleSidebarExpanded = () => {
    logEvent({
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
        onClick={logAndToggleSidebarExpanded}
        variant={ButtonVariant.Primary}
        className={classNames(
          'absolute -right-3 top-3 z-3 h-6 w-6',
          sidebarExpanded &&
            'invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100',
        )}
        size={ButtonSize.XSmall}
      >
        <ArrowIcon
          className={classNames(
            'typo-title3',
            sidebarExpanded ? '-rotate-90' : 'rotate-90',
          )}
        />
      </Button>
    </SimpleTooltip>
  );
}
