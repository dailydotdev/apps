import React, { useState, ReactElement, useContext, useEffect } from 'react';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { AppIcon as CompanionIcon } from '@dailydotdev/shared/src/components/icons';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { useContentScriptStatus } from '@dailydotdev/shared/src/hooks';
import { CompanionPermission } from './CompanionPermission';

export const CompanionPopupButton = (): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { contentScriptGranted, isFetched } = useContentScriptStatus();
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
      target_id: ExperimentWinner.CompanionPermissionPlacement,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentScriptGranted, isFetched]);

  if (contentScriptGranted || !isFetched) {
    return null;
  }

  return (
    <SimpleTooltip
      content={<CompanionPermission />}
      placement="bottom-start"
      showArrow={false}
      container={{
        paddingClassName: 'px-6 py-4',
        bgClassName: 'bg-background-default',
        textClassName: 'text-theme-label-primary typo-callout',
        className:
          'border border-accent-cabbage-default w-[30.75rem] whitespace-pre-wrap shadow-2',
      }}
      interactive
      visible={showCompanionPermission}
    >
      <Button
        onClick={onButtonClick}
        variant={
          showCompanionPermission
            ? ButtonVariant.Primary
            : ButtonVariant.Secondary
        }
        color={ButtonColor.Cabbage}
        className="hidden border-accent-cabbage-default laptop:flex"
        icon={
          <CompanionIcon
            secondary={showCompanionPermission}
            className={
              showCompanionPermission
                ? 'h-7 w-7 text-theme-label-primary'
                : 'h-6 w-6 text-accent-cabbage-default'
            }
          />
        }
      />
    </SimpleTooltip>
  );
};
