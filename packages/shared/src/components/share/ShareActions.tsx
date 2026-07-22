import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { SocialShareList } from '../widgets/SocialShareList';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { Typography, TypographyType } from '../typography/Typography';
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
  /** Tooltip + accessible label for the icon-only trigger. */
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
  label = 'Copy link',
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
          icon={<CopyIcon secondary={copying} />}
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
            icon={<CopyIcon secondary={copying} />}
            aria-label={label}
            pressed={open}
            className={className}
            {...hoverProps}
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="top"
        align="center"
        avoidCollisions
        className="flex w-80 flex-wrap justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        {...hoverProps}
      >
        <Typography type={TypographyType.Callout} bold className="w-full">
          Share
        </Typography>
        {list}
      </PopoverContent>
    </Popover>
  );
}
