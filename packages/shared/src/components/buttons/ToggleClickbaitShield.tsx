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
import type { IconSize } from '../Icon';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePlusSubscription, useClickbaitTries } from '../../hooks';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetId } from '../../lib/log';
import { useActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { webappUrl } from '../../lib/constants';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { Tooltip } from '../tooltip/Tooltip';
import { useHasIntroQuests } from '../../hooks/useHasIntroQuests';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

export const ToggleClickbaitShield = ({
  origin,
  buttonProps = {},
  iconButtonProps = {},
  iconSize,
}: {
  origin: Origin;
  buttonProps?: ButtonProps<'button'>;
  iconButtonProps?: ButtonProps<'button'>;
  iconSize?: IconSize;
}): ReactElement | null => {
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useActiveFeedContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, showLogin } = useAuthContext();
  const { maxTries, hasUsedFreeTrial, triesLeft } = useClickbaitTries();
  const isClickbaitShieldEnabled = flags?.clickbaitShieldEnabled ?? false;
  const hasIntroQuests = useHasIntroQuests({ shouldEvaluate: !isPlus });
  // v2 dual-sidebar laptop renders this button inside the page-header
  // strip alongside MyFeedHeading; use the consistent Medium + Tertiary
  // sizing so the whole strip reads as one button family.
  const { isV2 } = useLayoutVariant();
  const isV2Compact = isV2;

  const commonIconProps: ButtonProps<'button'> = {
    size: ButtonSize.Medium,
    variant: isV2Compact ? ButtonVariant.Tertiary : ButtonVariant.Float,
    iconSecondaryOnHover: true,
  };
  const sizedIcon = (icon: ReactElement, className?: string) =>
    iconSize
      ? React.cloneElement(icon, { size: iconSize, className })
      : React.cloneElement(icon, { className });

  if (!isPlus) {
    if (hasIntroQuests) {
      return null;
    }
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
          {...buttonProps}
          icon={
            hasUsedFreeTrial
              ? sizedIcon(<ShieldWarningIcon />, 'text-accent-ketchup-default')
              : sizedIcon(<ShieldPlusIcon />)
          }
          onClick={() => {
            if (!user) {
              showLogin({
                trigger: AuthTriggers.MainButton,
                options: { isLogin: false },
              });
              return;
            }
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
        isClickbaitShieldEnabled ? 'off' : 'on'
      }`}
    >
      <Button
        {...commonIconProps}
        {...iconButtonProps}
        icon={
          isClickbaitShieldEnabled
            ? sizedIcon(<ShieldCheckIcon />, 'text-status-success')
            : sizedIcon(<ShieldIcon />)
        }
        loading={loading}
        onClick={async () => {
          if (!user) {
            showLogin({
              trigger: AuthTriggers.MainButton,
              options: { isLogin: false },
            });
            return;
          }
          const newState = !isClickbaitShieldEnabled;
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
