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
import { useLogContext } from '../../../../contexts/LogContext';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { useAdClickUrl } from '../../../../features/monetization/useAdClickUrl';
import { useAdLabel } from '../../../../features/monetization/useAdLabel';
import { businessWebsiteUrl, plusUrl } from '../../../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';
import { anchorDefaultRel, anchorSponsoredRel } from '../../../../lib/strings';

/**
 * The compact ad's actions, which its height has no room for: the call to
 * action, the advertise link and the Plus upsell, under three dots that
 * show on hover or keyboard focus.
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
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          icon={<MenuIcon className="rotate-90" />}
          aria-label="Sponsored options"
          // In the favicon row, where a post card keeps its options. The
          // rail makes the slot inert in edit mode and pins its own label
          // there, so the trigger goes.
          className={classNames(
            'absolute right-2.5 top-5 shadow-2 transition-opacity duration-150 motion-reduce:transition-none mouse:group-focus-within/ad:opacity-100 mouse:group-hover/ad:opacity-100 [[inert]_&]:hidden',
            isOpen ? 'opacity-100' : 'mouse:opacity-0',
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
