import React, { useState, ReactElement, useContext, useRef } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import CompanionFilledIcon from '@dailydotdev/shared/icons/filled/companion.svg';
import CompanionOutlineIcon from '@dailydotdev/shared/icons/outline/companion.svg';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { CompanionPermission } from './CompanionPermission';
import { useExtensionPermission } from './useExtensionPermission';

export const COMPANION_ALERTS_LOCAL_KEY = 'companion:alerts';

interface CompanionAlerts {
  displayCompanionPopup?: boolean;
}

export const getCompanionAlerts = (): CompanionAlerts => {
  const data = window.localStorage.getItem(COMPANION_ALERTS_LOCAL_KEY);

  if (!data) {
    return {};
  }

  try {
    return JSON.parse(data);
  } catch (ex) {
    return {};
  }
};

export const updateCompanionAlerts = (
  current: CompanionAlerts,
  updated: CompanionAlerts,
): CompanionAlerts => {
  const data = { ...current, ...updated };
  window.localStorage.setItem(COMPANION_ALERTS_LOCAL_KEY, JSON.stringify(data));
  return data;
};

export const CompanionPopupButton = (): ReactElement => {
  const alerts = useRef(getCompanionAlerts());
  const { trackEvent } = useContext(AnalyticsContext);
  const { contentScriptGranted } = useExtensionPermission();
  const [showCompanionPermission, setShowCompanionPermission] = useState(
    alerts.current.displayCompanionPopup,
  );
  const CompanionIcon = showCompanionPermission
    ? CompanionFilledIcon
    : CompanionOutlineIcon;

  const onButtonClick = () => {
    if (alerts.current.displayCompanionPopup) {
      const data = updateCompanionAlerts(alerts.current, {
        displayCompanionPopup: false,
      });
      alerts.current = data;
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
