import React, { useState, ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import CompanionFilledIcon from '@dailydotdev/shared/icons/filled/companion.svg';
import CompanionOutlineIcon from '@dailydotdev/shared/icons/outline/companion.svg';
import { CompanionPermission } from './CompanionPermission';
import { useExtensionPermission } from './useExtensionPermission';

interface CompanionPopupButtonProps {
  placement: string;
}

export const CompanionPopupButton = ({
  placement,
}: CompanionPopupButtonProps): ReactElement => {
  if (placement === 'off') {
    return null;
  }

  const { user, loadedUserFromCache } = useContext(AuthContext);
  const { contentScriptGranted } = useExtensionPermission();
  const [showCompanionPermission, setShowCompanionPermission] = useState(false);
  const CompanionIcon = showCompanionPermission
    ? CompanionFilledIcon
    : CompanionOutlineIcon;

  useEffect(() => {
    if (!loadedUserFromCache) {
      return;
    }

    setShowCompanionPermission(!!user);
  }, [user, loadedUserFromCache]);

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
        onClick={() => setShowCompanionPermission(!showCompanionPermission)}
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
