import React, { useState, ReactElement, useContext, useEffect } from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { AppIcon as CompanionIcon } from '@dailydotdev/shared/src/components/icons';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { useContentScriptStatus } from '@dailydotdev/shared/src/hooks';
import { CompanionPermission } from './CompanionPermission';

export const CompanionPopupButton = (): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const { contentScriptGranted, isFetched } = useContentScriptStatus();
  const [showCompanionPermission, setShowCompanionPermission] = useState(false);

  const companionNotificationLog = (extra: string, value: boolean) => {
    const state = value ? 'open' : 'close';
    logEvent({
      event_name: `${state} companion permission popup`,
      extra: JSON.stringify({ origin: extra }),
    });
  };

  const onButtonClick = () => {
    companionNotificationLog('manual', !showCompanionPermission);
    setShowCompanionPermission(!showCompanionPermission);
  };

  const closeCompanionPopupButton = () => {
    setShowCompanionPermission(false);
  };

  useEffect(() => {
    if (contentScriptGranted || !isFetched) {
      return;
    }

    logEvent({
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
        textClassName: 'text-text-primary typo-callout',
        className:
          'border border-accent-cabbage-default w-[30.75rem] whitespace-pre-wrap shadow-2',
      }}
      interactive
      visible={showCompanionPermission}
      onClickOutside={closeCompanionPopupButton}
    >
      <Button
        onClick={onButtonClick}
        variant={ButtonVariant.Float}
        className="hidden laptop:flex"
        icon={
          <CompanionIcon
            secondary={showCompanionPermission}
            className={
              showCompanionPermission ? 'size-7 text-text-primary' : 'size-6'
            }
          />
        }
      />
    </SimpleTooltip>
  );
};
