import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EyeCancelIcon, MenuIcon as KebabIcon, PinIcon } from '../../icons';
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
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useLogContext } from '../../../contexts/LogContext';
import {
  HighlightsPlacement,
  SidebarSettingsFlags,
} from '../../../graphql/settings';
import { LogEvent, Origin } from '../../../lib/log';
import { labels } from '../../../lib';

interface HighlightCardOptionsProps {
  className?: string;
}

const HighlightCardOptionsContent = ({
  className,
}: HighlightCardOptionsProps): ReactElement => {
  const [isPending, setIsPending] = useState(false);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useActiveFeedContext();

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

  const options = useMemo<MenuItemProps[]>(
    () => [
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPinned, isPending],
  );

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

  if (!auth?.user) {
    return null;
  }

  return <HighlightCardOptionsContent className={className} />;
};

export default HighlightCardOptions;
