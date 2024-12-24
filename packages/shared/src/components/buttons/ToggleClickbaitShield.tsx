import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { ShieldCheckIcon, ShieldIcon, ShieldPlusIcon } from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription } from '../../hooks';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetId } from '../../lib/log';
import { SimpleTooltip } from '../tooltips';
import { useActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { webappUrl } from '../../lib/constants';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';

export const ToggleClickbaitShield = ({
  origin,
}: {
  origin: Origin;
}): ReactElement => {
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useActiveFeedContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();

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
            router.push(
              `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.AI}`,
            );
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
        loading={loading}
        onClick={async () => {
          const newState = !flags?.clickbaitShieldEnabled;
          setLoading(true);
          await updateFlag(
            SidebarSettingsFlags.ClickbaitShieldEnabled,
            newState,
          );
          await queryClient.cancelQueries({
            queryKey: feedQueryKey,
          });
          await queryClient.invalidateQueries({
            queryKey: feedQueryKey,
            stale: true,
          });
          setLoading(false);
          logEvent({
            event_name: LogEvent.ToggleClickbaitShield,
            target_id: newState ? TargetId.On : TargetId.Off,
            extra: JSON.stringify({
              origin,
            }),
          });
        }}
      />
    </SimpleTooltip>
  );
};
