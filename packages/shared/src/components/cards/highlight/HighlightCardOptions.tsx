import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  BellAddIcon,
  BellSubscribedIcon,
  EyeCancelIcon,
  MenuIcon as KebabIcon,
  PinIcon,
} from '../../icons';
import { MenuIcon } from '../../MenuIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import type { MenuItemProps } from '../../dropdown/common';
import { useActiveFeedContext } from '../../../contexts/ActiveFeedContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useMajorHeadlinesSubscription } from '../../../hooks/notifications/useMajorHeadlinesSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureMajorHeadlinesPush } from '../../../lib/featureManagement';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useLogContext } from '../../../contexts/LogContext';
import {
  HighlightsPlacement,
  SidebarSettingsFlags,
} from '../../../graphql/settings';
import { LogEvent, Origin } from '../../../lib/log';
import { labels } from '../../../lib';

const NOTIFICATION_SETTINGS_PATH = '/settings/notifications';

interface HighlightCardOptionsProps {
  className?: string;
}

const HighlightCardOptionsContent = ({
  className,
}: HighlightCardOptionsProps): ReactElement => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useActiveFeedContext();
  const { isSubscribed, isLoading, subscribe, unsubscribe } =
    useMajorHeadlinesSubscription();

  const placement = flags?.highlightsPlacement ?? HighlightsPlacement.Default;
  const isPinned = placement === HighlightsPlacement.Pinned;

  const updatePlacement = async (next: HighlightsPlacement) => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    try {
      await updateFlag(SidebarSettingsFlags.Highlights, next);
      if (feedQueryKey) {
        await queryClient.invalidateQueries({ queryKey: feedQueryKey });
      }
      displayToast(
        labels.feed.settings.globalPreferenceNotice.highlightsPlacement,
      );
      logEvent({
        event_name: LogEvent.SetHighlightsPlacement,
        target_id: next,
        extra: JSON.stringify({ origin: Origin.FeedCard }),
      });
    } finally {
      setIsPending(false);
    }
  };

  const toggleSubscription = async () => {
    if (isPending || isLoading) {
      return;
    }
    setIsPending(true);
    try {
      if (isSubscribed) {
        await unsubscribe('feed_card');
        displayToast('Real-time alerts turned off.');
        return;
      }
      await subscribe('feed_card');
      displayToast("You'll be the first to know when news breaks.", {
        action: {
          copy: 'Settings',
          onClick: () => router.push(NOTIFICATION_SETTINGS_PATH),
        },
      });
    } finally {
      setIsPending(false);
    }
  };

  const options = useMemo<MenuItemProps[]>(() => {
    const SubscribeIcon = isSubscribed ? BellSubscribedIcon : BellAddIcon;
    return [
      {
        label: isPinned ? 'Unpin from top' : 'Pin to top',
        icon: <MenuIcon Icon={PinIcon} />,
        action: () =>
          updatePlacement(
            isPinned ? HighlightsPlacement.Default : HighlightsPlacement.Pinned,
          ),
        disabled: isPending,
      },
      {
        label: 'Disable',
        icon: <MenuIcon Icon={EyeCancelIcon} />,
        action: () => updatePlacement(HighlightsPlacement.Disabled),
        disabled: isPending,
      },
      {
        label: isSubscribed
          ? 'Turn off real-time alerts'
          : 'Get real-time alerts',
        icon: <MenuIcon Icon={SubscribeIcon} />,
        action: toggleSubscription,
        disabled: isPending || isLoading,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinned, isSubscribed, isPending, isLoading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<KebabIcon />}
          className={classNames(
            'invisible z-1 my-auto group-hover:visible',
            className,
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const HighlightCardOptions = ({
  className,
}: HighlightCardOptionsProps): ReactElement | null => {
  const auth = useAuthContext();
  const user = auth?.user;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureMajorHeadlinesPush,
    shouldEvaluate: !!user,
  });

  if (!isFeatureEnabled || !user) {
    return null;
  }

  return <HighlightCardOptionsContent className={className} />;
};

export default HighlightCardOptions;
