import React, { useContext, type ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonSize, ButtonVariant, type ButtonProps } from './Button';
import { ShieldCheckIcon, ShieldIcon, ShieldPlusIcon } from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription } from '../../hooks';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { SimpleTooltip } from '../tooltips';
import { LazyModal } from '../modals/common/types';
import { FilterMenuTitle } from '../filters/helpers';
import { ActiveFeedContext } from '../../contexts';

export const ToggleClickbaitShield = ({
  origin,
}: {
  origin: Origin;
}): ReactElement => {
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();
  const { openModal } = useLazyModal();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();

  const commonIconProps: ButtonProps<'button'> = {
    size: ButtonSize.Medium,
    variant: ButtonVariant.Float,
    iconSecondaryOnHover: true,
  };

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
          {...commonIconProps}
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
        {...commonIconProps}
        icon={
          flags.clickbaitShieldEnabled ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        onClick={async () => {
          const newSatate = !flags?.clickbaitShieldEnabled;
          await queryClient.cancelQueries({
            queryKey: feedQueryKey,
          });
          await queryClient.invalidateQueries({
            queryKey: feedQueryKey,
            stale: true,
          });
          await updateFlag(
            SidebarSettingsFlags.ClickbaitShieldEnabled,
            newSatate,
          );
          logEvent({
            event_name: LogEvent.ToggleClickbaitShield,
            target_id: newSatate ? TargetId.On : TargetId.Off,
            extra: JSON.stringify({
              origin,
            }),
          });
        }}
      />
    </SimpleTooltip>
  );
};
