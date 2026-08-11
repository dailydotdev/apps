import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../dropdown/DropdownMenu';
import type { MenuItemProps } from '../../../dropdown/common';
import { DevPlusIcon, MegaphoneIcon, MenuIcon } from '../../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { useLogContext } from '../../../../contexts/LogContext';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { businessWebsiteUrl, plusUrl } from '../../../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';
import { anchorDefaultRel } from '../../../../lib/strings';
import { visibleOnGroupHover } from '../../common/common';

interface AdOptionsButtonProps {
  targetId: TargetId;
  className?: string;
}

/**
 * The ad card's own links (advertise with us, remove ads) collapsed into the
 * post card's options menu, so the creative keeps the card to itself.
 */
export function AdOptionsButton({
  targetId,
  className,
}: AdOptionsButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const { logEvent } = useLogContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  // Counted on mount, exactly like the inline `AdvertiseLink`: one impression
  // per rendered ad card, whether or not the menu is opened. Counting opens
  // instead would divide the same clicks by a far smaller denominator and read
  // as a large lift in the guardrail rate that is purely instrumentation.
  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.AdvertiseHereCta,
      target_id: targetId,
    });
  }, [logEvent, targetId]);

  const options = useMemo(() => {
    const list: MenuItemProps[] = [
      {
        label: 'Advertise with us',
        icon: <MegaphoneIcon />,
        anchorProps: {
          href: businessWebsiteUrl,
          target: '_blank',
          rel: anchorDefaultRel,
        },
        action: () =>
          logEvent({
            event_name: LogEvent.Click,
            target_type: TargetType.AdvertiseHereCta,
            target_id: targetId,
          }),
      },
    ];

    if (!isPlus) {
      list.push({
        label: 'Remove ads',
        icon: <DevPlusIcon />,
        anchorProps: { href: plusUrl },
        // TargetId.Ads, not the card's own target: this is the same upgrade
        // funnel RemoveAd feeds, and the two have to stay comparable.
        action: () =>
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.Ads,
          }),
      });
    }

    return list;
  }, [isPlus, logEvent, logSubscriptionEvent, targetId]);

  return (
    <span
      className={classNames(
        'ml-auto flex flex-row',
        visibleOnGroupHover,
        // The trigger is the only route to the menu's actions, so it also has
        // to appear for a keyboard reader: `visibleOnGroupHover` is
        // `visibility: hidden`, which takes it out of the tab order until
        // something inside the card holds focus.
        'laptop:mouse:group-focus-within:!visible',
        open && 'laptop:mouse:!visible',
        className,
      )}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
          <Button
            aria-label="Ad options"
            variant={ButtonVariant.Tertiary}
            icon={<MenuIcon />}
            size={ButtonSize.Small}
            className="z-1"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuOptions options={options} />
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
