import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import {
  ShieldCheckIcon,
  ShieldIcon,
  ShieldPlusIcon,
  ShieldWarningIcon,
} from '../icons';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription, useClickbaitTries } from '../../hooks';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetId } from '../../lib/log';
import { useActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { webappUrl } from '../../lib/constants';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { Tooltip } from '../tooltip/Tooltip';

export const ToggleClickbaitShield = ({
  origin,
  buttonProps = {},
}: {
  origin: Origin;
  buttonProps?: ButtonProps<'button'>;
}): ReactElement => {
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useActiveFeedContext();
  const { isPlus, isPlusLoading } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();
  const { maxTries, hasUsedFreeTrial, triesLeft } = useClickbaitTries();

  const commonIconProps: ButtonProps<'button'> = {
    size: ButtonSize.Medium,
    variant: ButtonVariant.Float,
    iconSecondaryOnHover: true,
    ...buttonProps,
  };

  // Don't show anything while loading user's plus status
  if (isPlusLoading) {
    return null;
  }

  if (!isPlus) {
    return (
      <Tooltip
        side="bottom"
        content={
          hasUsedFreeTrial
            ? 'Enable Clickbait Shield to get clearer more informative titles'
            : `Get clear, more informative titles with Clickbait Shield. You can try it ${triesLeft} more times for free this month.`
        }
        className="max-w-64 text-center"
      >
        <Button
          {...commonIconProps}
          icon={
            hasUsedFreeTrial ? (
              <ShieldWarningIcon className="text-accent-ketchup-default" />
            ) : (
              <ShieldPlusIcon />
            )
          }
          onClick={() => {
            router.push(
              `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.AI}`,
            );
          }}
        >
          {triesLeft}/{maxTries}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      side="bottom"
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
    </Tooltip>
  );
};
