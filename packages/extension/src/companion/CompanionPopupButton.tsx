import React, { useState, ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import CompanionFilledIcon from '@dailydotdev/shared/icons/filled/companion.svg';
import CompanionOutlineIcon from '@dailydotdev/shared/icons/outline/companion.svg';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { CompanionPermission } from './CompanionPermission';
import { useExtensionPermission } from './useExtensionPermission';

export const CompanionPopupButton = (): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, loadedUserFromCache } = useContext(AuthContext);
  const { alerts, updateAlerts, loadedAlerts } = useContext(AlertContext);
  const { contentScriptGranted } = useExtensionPermission();
  const [showCompanionPermission, setShowCompanionPermission] = useState(false);
  const CompanionIcon = showCompanionPermission
    ? CompanionFilledIcon
    : CompanionOutlineIcon;

  useEffect(() => {
    if (!loadedUserFromCache || !loadedAlerts || !user) {
      return;
    }

    if (alerts.displayCompanionPopup) {
      setShowCompanionPermission(true);
    }
  }, [user, alerts, loadedUserFromCache, loadedAlerts]);

  const onButtonClick = () => {
    if (alerts.displayCompanionPopup) {
      updateAlerts({ displayCompanionPopup: false });
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
