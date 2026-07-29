import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { SocialShareList } from '../widgets/SocialShareList';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ShareIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { shouldUseNativeShare } from '../../lib/func';
import { ShareProvider } from '../../lib/share';
import type { ReferralCampaignKey } from '../../lib/referral';

export type ShareActionsVariant = 'icon' | 'inline';

export interface ShareActionsProps {
  link: string;
  /** Share text / description used for native share + pre-filled network text. */
  text: string;
  cid?: ReferralCampaignKey;
  variant?: ShareActionsVariant;
  /** Desktop only: reveal the popover on hover as well as click. */
  openOnHover?: boolean;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  /**
   * Tooltip + accessible label for the icon-only trigger, which always renders
   * the share arrow: the arrow means "opens a share surface" (social popover on
   * desktop, native sheet on mobile), while a link/copy glyph is reserved for
   * controls that copy straight to the clipboard. Keep the two distinct — a
   * copy glyph here reads as a one-tap copy and misleads.
   */
  label?: string;
  emailTitle?: string;
  emailSummary?: string;
  className?: string;
  /** Called for any share/copy so the caller can log with its own origin. */
  onShare?: (provider: ShareProvider) => void;
}

const HOVER_CLOSE_DELAY = 120;

export function ShareActions({
  link,
  text,
  cid,
  variant = 'icon',
  openOnHover = false,
  buttonVariant = ButtonVariant.Tertiary,
  buttonSize = ButtonSize.Small,
  label = 'Share',
  emailTitle,
  emailSummary,
  className,
  onShare,
}: ShareActionsProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [open, setOpen] = useState(false);
  const [copying, shareOrCopy] = useShareOrCopyLink({ link, text, cid });
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const list = (
    <SocialShareList
      link={link}
      description={text}
      emailTitle={emailTitle}
      emailSummary={emailSummary}
      isCopying={copying}
      onCopy={() => {
        onShare?.(ShareProvider.CopyLink);
        shareOrCopy();
      }}
      onNativeShare={() => {
        onShare?.(ShareProvider.Native);
        shareOrCopy();
      }}
      onClickSocial={(provider) => onShare?.(provider)}
    />
  );

  if (variant === 'inline') {
    return (
      <div className={classNames('flex flex-wrap gap-2', className)}>
        {list}
      </div>
    );
  }

  // Mobile: a single tap goes straight to the native share sheet (or copy when
  // native share is unavailable) — no popover, per sharing UX guidance.
  if (!isLaptop) {
    return (
      <Tooltip content={label}>
        <Button
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          icon={<ShareIcon secondary={copying} />}
          aria-label={label}
          className={className}
          onClick={() => {
            onShare?.(
              shouldUseNativeShare()
                ? ShareProvider.Native
                : ShareProvider.CopyLink,
            );
            shareOrCopy();
          }}
        />
      </Tooltip>
    );
  }

  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
  };
  const hoverProps = openOnHover
    ? {
        onMouseEnter: () => {
          cancelClose();
          setOpen(true);
        },
        onMouseLeave: () => {
          closeTimeout.current = setTimeout(
            () => setOpen(false),
            HOVER_CLOSE_DELAY,
          );
        },
      }
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content={label} visible={!open}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={buttonVariant}
            size={buttonSize}
            icon={<ShareIcon secondary={copying} />}
            aria-label={label}
            pressed={open}
            className={className}
            {...hoverProps}
          />
        </PopoverTrigger>
      </Tooltip>
      {/* A 4-column grid at `w-fit` rather than a fixed-width wrapping flex
          row: the tiles are a fixed `w-16`, so a fixed width left slack that
          `justify-center` split into uneven side gutters, and a short final
          row floated to the middle. This hugs the tiles exactly, so the
          padding is equal on all four sides and every row starts at the left
          edge. No heading — the trigger and the tiles already say "share". */}
      <PopoverContent
        side="top"
        align="center"
        avoidCollisions
        className="grid w-fit grid-cols-4 gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        {...hoverProps}
      >
        {list}
      </PopoverContent>
    </Popover>
  );
}
