import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
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
import type { TargetId } from '../../../../lib/log';
import { LogEvent, TargetType } from '../../../../lib/log';
import { anchorDefaultRel } from '../../../../lib/strings';
import { visibleOnGroupHover } from '../../common/common';

interface AdOptionsButtonProps {
  targetId: TargetId;
  className?: string;
}

/**
 * The ad card's own links (advertise with us, remove ads) collapsed into the
 * post card's options menu, so the creative keeps the card to itself. The
 * advertise-here impression fires when the menu opens rather than on mount:
 * inside a menu the link is not on screen until then, and the guardrail metric
 * is a click rate over impressions.
 */
export function AdOptionsButton({
  targetId,
  className,
}: AdOptionsButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const { logEvent } = useLogContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (isOpen) {
        logEvent({
          event_name: LogEvent.Impression,
          target_type: TargetType.AdvertiseHereCta,
          target_id: targetId,
        });
      }
    },
    [logEvent, targetId],
  );

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
        action: () =>
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: targetId,
          }),
      });
    }

    return list;
  }, [isPlus, logEvent, logSubscriptionEvent, targetId]);

  // Mirrors the post card's header actions: a span carries the hover reveal and
  // the `ml-auto`, because `.header > button` in Card.module.css would override
  // a margin set on the button itself and pin it next to the favicon.
  return (
    <span
      className={classNames(
        'ml-auto flex flex-row',
        visibleOnGroupHover,
        open && 'laptop:mouse:!visible',
        className,
      )}
    >
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
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
