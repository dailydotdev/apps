import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { DevPlusIcon } from '../icons/DevPlus';
import { VIcon } from '../icons/V';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { plusUrl } from '../../lib/constants';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { plusPreviewPerks } from './PlusList';

const PREVIEW_OPEN_DELAY = 400;
const PREVIEW_CLOSE_DELAY = 300;

interface PlusTileProps {
  muted?: boolean;
  className?: string;
  iconSize?: IconSize;
}

export const PlusTile = ({
  muted = false,
  className = 'size-8 rounded-10',
  iconSize = IconSize.Size16,
}: PlusTileProps): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex shrink-0 items-center justify-center',
      muted
        ? 'bg-surface-float text-text-tertiary'
        : 'bg-action-plus-float text-action-plus-default',
      className,
    )}
  >
    <DevPlusIcon secondary size={iconSize} />
  </span>
);

interface PlusPreviewCardProps {
  onAction?: (event: MouseEvent<HTMLAnchorElement>) => void;
  context?: ReactNode;
}

export const PlusPreviewCard = ({
  onAction,
  context,
}: PlusPreviewCardProps): ReactElement => (
  <div className="flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-4 shadow-2">
    {context && (
      <div className="border-b border-border-subtlest-tertiary pb-3">
        {context}
      </div>
    )}
    <div className="flex items-center gap-2">
      <PlusTile />
      <div className="flex flex-col">
        <Typography type={TypographyType.Callout} bold>
          daily.dev Plus
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          On top of everything in Free
        </Typography>
      </div>
    </div>
    <ul className="flex flex-col gap-1.5">
      {plusPreviewPerks.map((perk) => (
        <li key={perk} className="flex items-center gap-2">
          <VIcon
            aria-hidden
            size={IconSize.Size16}
            className="text-action-plus-default"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {perk}
          </Typography>
        </li>
      ))}
    </ul>
    <Link href={plusUrl} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Primary}
        color={ButtonColor.Bacon}
        size={ButtonSize.Small}
        icon={<DevPlusIcon secondary />}
        className="w-full"
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          event.stopPropagation();
          onAction?.(event);
        }}
      >
        Get Plus
      </Button>
    </Link>
  </div>
);

interface PlusPreviewProps extends PlusPreviewCardProps {
  children: ReactElement;
  onOpen?: () => void;
  side?: HoverCardPrimitive.HoverCardContentProps['side'];
  align?: HoverCardPrimitive.HoverCardContentProps['align'];
}

// Radix ignores touch pointers, so phones never see the card and a tap goes
// straight to the entry's own destination.
export const PlusPreview = ({
  children,
  side = 'right',
  align = 'start',
  onAction,
  onOpen,
  context,
}: PlusPreviewProps): ReactElement => {
  // After a click the card stays shut until the pointer leaves, otherwise the
  // open delay re-fires on the trigger while the next page loads.
  const [open, setOpen] = useState(false);
  const suppressOpenRef = useRef(false);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next && suppressOpenRef.current) {
        return;
      }
      if (next) {
        onOpen?.();
      }
      setOpen(next);
    },
    [onOpen],
  );

  return (
    <HoverCardPrimitive.Root
      openDelay={PREVIEW_OPEN_DELAY}
      closeDelay={PREVIEW_CLOSE_DELAY}
      open={open}
      onOpenChange={onOpenChange}
    >
      <HoverCardPrimitive.Trigger
        asChild
        onClick={() => {
          suppressOpenRef.current = true;
          setOpen(false);
        }}
        onPointerLeave={() => {
          suppressOpenRef.current = false;
        }}
        onBlur={() => {
          suppressOpenRef.current = false;
        }}
      >
        {children}
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className="rail-popup-panel z-tooltip"
        >
          <PlusPreviewCard onAction={onAction} context={context} />
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
};
