import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import { Button } from '../../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../dropdown/DropdownMenu';
import type { MenuItemProps } from '../../../dropdown/common';
import { MenuIcon } from '../../../icons/Menu';
import { visibleOnGroupHover } from '../../common/common';
import { useLogContext } from '../../../../contexts/LogContext';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { useAdClickUrl } from '../../../../features/monetization/useAdClickUrl';
import { useAdLabel } from '../../../../features/monetization/useAdLabel';
import { businessWebsiteUrl, plusUrl } from '../../../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';
import { anchorDefaultRel, anchorSponsoredRel } from '../../../../lib/strings';

/**
 * The compact ad's actions, which its height has no room for: the call to
 * action, the advertise link and the Plus upsell, under the three dots a
 * post card has in its header row.
 */
export const AdCompactMenu = ({
  ad,
  onLinkClick,
}: {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
}): ReactElement | null => {
  const [isOpen, setIsOpen] = useState(false);
  const { logEvent } = useLogContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { showAdvertiseLink } = useAdLabel();
  const clickUrl = useAdClickUrl(ad);

  const options: MenuItemProps[] = [
    ...(ad.callToAction
      ? [
          {
            label: ad.callToAction,
            anchorProps: {
              href: clickUrl,
              target: '_blank',
              rel: anchorSponsoredRel,
            },
            action: () => onLinkClick?.(ad),
          },
        ]
      : []),
    ...(showAdvertiseLink
      ? [
          {
            label: 'Advertise here',
            anchorProps: {
              href: businessWebsiteUrl,
              target: '_blank',
              rel: anchorDefaultRel,
            },
            action: () =>
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.AdvertiseHereCta,
                target_id: TargetId.AdCard,
              }),
          },
        ]
      : []),
    ...(isPlus
      ? []
      : [
          {
            label: 'Remove ads',
            anchorProps: { href: plusUrl },
            action: () =>
              logSubscriptionEvent({
                event_name: LogEvent.UpgradeSubscription,
                target_id: TargetId.Ads,
              }),
          },
        ]),
  ];

  if (!options.length) {
    return null;
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        // The advertise link counts as seen once the menu shows it, as the
        // inline link does on mount.
        if (open && showAdvertiseLink) {
          logEvent({
            event_name: LogEvent.Impression,
            target_type: TargetType.AdvertiseHereCta,
            target_id: TargetId.AdCard,
          });
        }
      }}
    >
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          // The rail makes the slot inert in edit mode and pins its own
          // label over this corner, so the trigger goes.
          className={classNames(
            visibleOnGroupHover,
            'z-1 my-auto [[inert]_&]:hidden',
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
