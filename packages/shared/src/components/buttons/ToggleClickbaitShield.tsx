import React, { type ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { ShieldCheckIcon, ShieldIcon, ShieldPlusIcon } from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription } from '../../hooks';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { SimpleTooltip } from '../tooltips';
import { LazyModal } from '../modals/common/types';
import { FilterMenuTitle } from '../filters/helpers';

export const ToggleClickbaitShield = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();

  if (!isPlus) {
    return (
      <SimpleTooltip
        placement="bottom"
        content="Enable Clickbait Shield to get clearer more informative titles"
        container={{
          className: 'max-w-64 text-center',
        }}
      >
        <Button
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
          icon={<ShieldPlusIcon />}
          onClick={() => {
            openModal({
              type: LazyModal.FeedFilters,
              props: {
                defaultView: FilterMenuTitle.ContentTypes,
              },
            });
          }}
        />
      </SimpleTooltip>
    );
  }

  return (
    <SimpleTooltip
      placement="bottom"
      content={`Toggle Clickbait Shield ${
        flags.clickbaitShieldEnabled ? 'off' : 'on'
      }`}
    >
      <Button
        size={ButtonSize.Medium}
        variant={ButtonVariant.Float}
        icon={
          flags.clickbaitShieldEnabled ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        onClick={() => {
          updateFlag(
            SidebarSettingsFlags.ClickbaitShieldEnabled,
            !flags.clickbaitShieldEnabled,
          );

          logEvent({
            event_name: LogEvent.ToggleClickbaitShield,
            target_id: !flags.clickbaitShieldEnabled
              ? TargetId.On
              : TargetId.Off,
          });
        }}
      />
    </SimpleTooltip>
  );
};
