import React, { type ReactElement, useContext } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SidebarArrowLeft, SidebarArrowRight } from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import LogContext from '../../contexts/LogContext';

export const SidebarMenuIcon = (): ReactElement => {
  const { sidebarExpanded, toggleSidebarExpanded } = useSettingsContext();
  const { logEvent } = useContext(LogContext);
  const logAndToggleSidebarExpanded = () => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  };
  return (
    <div
      className={classNames(
        'flex h-12 items-center',
        sidebarExpanded ? undefined : 'justify-center',
      )}
    >
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Quaternary}
        bold
        className={classNames(
          'transition-all',
          sidebarExpanded
            ? 'w-auto pl-4 opacity-100 delay-150'
            : 'hidden opacity-0',
        )}
      >
        Menu
      </Typography>
      <SimpleTooltip
        placement="right"
        content={`${sidebarExpanded ? 'Close' : 'Open'} sidebar`}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={logAndToggleSidebarExpanded}
          className={classNames(
            'z-1',
            sidebarExpanded ? 'ml-auto mr-2' : undefined,
          )}
          icon={sidebarExpanded ? <SidebarArrowLeft /> : <SidebarArrowRight />}
        />
      </SimpleTooltip>
    </div>
  );
};
