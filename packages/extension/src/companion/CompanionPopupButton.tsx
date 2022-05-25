import React, { useState, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import CompanionFilledIcon from '@dailydotdev/shared/icons/filled/companion.svg';
import CompanionOutlineIcon from '@dailydotdev/shared/icons/outline/companion.svg';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { CompanionPermission } from './CompanionPermission';
import { useExtensionPermission } from './useExtensionPermission';
import useExtensionAlerts from '../lib/useExtensionAlerts';

export const CompanionPopupButton = (): ReactElement => {
  const { alerts, updateAlerts } = useExtensionAlerts();
  const { trackEvent } = useContext(AnalyticsContext);
  const { contentScriptGranted } = useExtensionPermission({
    origin: 'companion permission button',
  });
  const [showCompanionPermission, setShowCompanionPermission] = useState(
    alerts.displayCompanionPopup,
  );
  const CompanionIcon = showCompanionPermission
    ? CompanionFilledIcon
    : CompanionOutlineIcon;

  const onButtonClick = () => {
    if (alerts.displayCompanionPopup) {
      updateAlerts({
        displayCompanionPopup: false,
      });
    }

    const state = showCompanionPermission ? 'open' : 'close';
    trackEvent({ event_name: `companion popup ${state}` });
    setShowCompanionPermission(!showCompanionPermission);
  };

  if (contentScriptGranted) {
    return null;
  }

  return (
    <SimpleTooltip
      content={<CompanionPermission />}
      placement="bottom-start"
      offset={[-140, 12]}
      container={{
        paddingClassName: 'px-6 py-4',
        bgClassName: 'bg-theme-bg-primary',
        textClassName: 'text-theme-label-primary typo-callout',
        className:
          'border border-theme-status-cabbage w-[30.75rem] whitespace-pre-wrap shadow-2',
        arrow: false,
      }}
      interactive
      visible={showCompanionPermission}
    >
      <Button
        onClick={onButtonClick}
        className={classNames(
          'mr-4 border-theme-status-cabbage hidden laptop:flex',
          showCompanionPermission
            ? 'btn-primary-cabbage'
            : 'btn-secondary-cabbage',
        )}
        icon={
          <CompanionIcon
            className={
              showCompanionPermission
                ? 'w-7 h-7 text-theme-label-primary'
                : 'w-6 h-6 text-theme-status-cabbage'
            }
          />
        }
      />
    </SimpleTooltip>
  );
};
