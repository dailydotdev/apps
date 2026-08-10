import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../dropdown/DropdownMenu';
import type { MenuItemProps } from '../../../dropdown/common';
import { DevPlusIcon, MenuIcon } from '../../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { plusUrl } from '../../../../lib/constants';
import { LogEvent, TargetId } from '../../../../lib/log';
import { visibleOnGroupHover } from '../../common/common';

interface AdOptionsButtonProps {
  className?: string;
}

/**
 * The ad card's remove-ads link collapsed into the post card's options menu,
 * so the creative keeps the card to itself.
 *
 * Deliberately not a home for "Advertise here": the arm that shows this menu
 * is the one whose whole definition is that the advertise link is gone, and
 * putting it back in a menu would leave the arm meaning two different things
 * depending on an unrelated layout flag.
 */
export function AdOptionsButton({
  className,
}: AdOptionsButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const { logSubscriptionEvent } = usePlusSubscription();

  const options = useMemo(
    (): MenuItemProps[] => [
      {
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
      },
    ],
    [logSubscriptionEvent],
  );

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
