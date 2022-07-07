import React, { useState, ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import CompanionIcon from '@dailydotdev/shared/src/components/icons/App';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { CompanionPermission } from './CompanionPermission';
import { useExtensionPermission } from './useExtensionPermission';

interface CompanionPopupButtonProps {
  placement?: string;
}

export const CompanionPopupButton = ({
  placement,
}: CompanionPopupButtonProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { contentScriptGranted, isFetched } = useExtensionPermission({
    origin: 'companion permission button',
  });
  const [showCompanionPermission, setShowCompanionPermission] = useState(false);

  const companionNotificationTracking = (extra: string, value: boolean) => {
    const state = value ? 'open' : 'close';
    trackEvent({
      event_name: `${state} companion permission popup`,
      extra: JSON.stringify({ origin: extra }),
    });
  };

  const onButtonClick = () => {
    companionNotificationTracking('manual', !showCompanionPermission);
    setShowCompanionPermission(!showCompanionPermission);
  };

  useEffect(() => {
    if (contentScriptGranted || !isFetched) {
      return;
    }

    trackEvent({
      event_name: 'impression',
      target_type: 'companion permission',
      target_id: placement,
    });
  }, [contentScriptGranted, isFetched]);

  if (contentScriptGranted || !isFetched) {
    return null;
  }

  return (
    <SimpleTooltip
      content={<CompanionPermission />}
      placement="bottom-start"
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
            secondary={showCompanionPermission}
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
