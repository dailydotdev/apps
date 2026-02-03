import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SidebarArrowLeft, SidebarArrowRight } from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { Tooltip } from '../tooltip/Tooltip';

export const SidebarMenuIcon = (): ReactElement => {
  const { sidebarExpanded, toggleSidebarExpanded } = useSettingsContext();
  const { logEvent } = useLogContext();
  const logAndToggleSidebarExpanded = () => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  };
  return (
    <div
      className={classNames(
        'flex h-9 items-center justify-between px-2 transition-[padding,justify-content] duration-300',
        !sidebarExpanded && 'justify-center px-1',
      )}
    >
      <span
        className={classNames(
          'overflow-hidden whitespace-nowrap text-text-quaternary transition-opacity duration-300 typo-callout',
          sidebarExpanded ? 'opacity-100' : 'w-0 opacity-0',
        )}
      >
        Menu
      </span>
      <Tooltip
        side="right"
        content={`${sidebarExpanded ? 'Collapse' : 'Expand'} sidebar`}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={logAndToggleSidebarExpanded}
          className="text-text-tertiary hover:text-text-primary"
          icon={sidebarExpanded ? <SidebarArrowLeft /> : <SidebarArrowRight />}
          aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
        />
      </Tooltip>
    </div>
  );
};
