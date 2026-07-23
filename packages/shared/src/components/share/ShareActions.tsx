import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { SocialShareList } from '../widgets/SocialShareList';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, CopyIcon, VIcon } from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Tooltip } from '../tooltip/Tooltip';
import { Typography, TypographyType } from '../typography/Typography';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { shouldUseNativeShare } from '../../lib/func';
import { ShareProvider } from '../../lib/share';
import type { ReferralCampaignKey } from '../../lib/referral';

export type ShareActionsVariant = 'icon' | 'inline' | 'split';

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
  /**
   * Render `triggerText` beside the icon instead of an icon-only trigger. Gated
   * so existing icon-only consumers keep their exact DOM.
   */
  triggerText?: string;
  /** `split` variant only: label for the chevron half that opens the list. */
  dropdownLabel?: string;
  emailTitle?: string;
  emailSummary?: string;
  /** Off for links that are already short and carry their own attribution. */
  shortenUrl?: boolean;
  className?: string;
  /** Called for any share/copy so the caller can log with its own origin. */
  onShare?: (provider: ShareProvider) => void;
}

const HOVER_CLOSE_DELAY = 120;

/**
 * easeOutExpo — the same curve the design-system dropdown animates on. It
 * decelerates into the target with no overshoot, which is what keeps a swap
 * from reading as a wobble.
 */
const EASE_OUT_EXPO = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/**
 * The halves meet at a single hairline, so the standard side paddings would
 * leave a canyon around it. Both sides tighten by one step from the DS value —
 * the outer edges keep the standard padding, so the control still reads as one
 * button.
 */
const SPLIT_MAIN_INNER_PADDING: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: '!pr-5',
  [ButtonSize.Large]: '!pr-4',
  [ButtonSize.Medium]: '!pr-3',
  [ButtonSize.Small]: '!pr-2',
  [ButtonSize.XSmall]: '!pr-1.5',
};

const DIVIDER_BASE =
  "relative border-l-0 before:absolute before:left-0 before:w-px before:content-['']";

/**
 * Variants that paint `--button-default-border-color: transparent` have no
 * border for the divider to match, so they draw their own 1px rule:
 *
 * - `Primary` sits on a solid fill, where only the label colour is guaranteed
 *   to read, and runs full height like a real border would.
 * - `Tertiary` is a bare ghost button, so a full-height rule floats with
 *   nothing to anchor it. It gets a shorter rule in the same colour the
 *   `Subtle` variant borders with — `border-subtlest-primary` at 30 %, per
 *   `tailwind/buttons.ts`.
 *
 * Every other variant returns nothing and keeps its real border as the divider.
 */
const dividerFor = (buttonVariant: ButtonVariant): string | false => {
  if (buttonVariant === ButtonVariant.Primary) {
    return classNames(
      DIVIDER_BASE,
      // Alpha is mixed into the colour rather than applied as a separate
      // opacity utility: `before:opacity-*` does not survive this project's
      // Tailwind build on pseudo-elements, and silently renders at full
      // strength.
      'before:inset-y-0 before:bg-[color-mix(in_srgb,var(--button-color,var(--button-default-color)),transparent_80%)]',
    );
  }

  if (buttonVariant === ButtonVariant.Tertiary) {
    return classNames(
      DIVIDER_BASE,
      // The literal expression `tailwind/buttons.ts` gives the Subtle variant's
      // border, rather than a token plus an opacity utility that only
      // approximates it.
      'before:inset-y-1.5 before:bg-[color-mix(in_srgb,var(--theme-border-subtlest-primary),transparent_70%)]',
    );
  }

  return false;
};

/**
 * The split halves keep their clicks to themselves: a parent that acts on
 * clicks steals focus the moment the menu opens, which dismisses it right away
 * (e.g. a TextField, whose container focuses its input on click).
 */
const stopParentClick = (event: React.MouseEvent): void =>
  event.stopPropagation();

/** Drops the icon-only square so the chevron hugs the seam symmetrically. */
const SPLIT_CHEVRON_PADDING: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: '!w-auto !px-3',
  [ButtonSize.Large]: '!w-auto !px-2.5',
  [ButtonSize.Medium]: '!w-auto !px-2',
  [ButtonSize.Small]: '!w-auto !px-1.5',
  [ButtonSize.XSmall]: '!w-auto !px-1',
};

/**
 * A copy is a rare, deliberate moment, so the confirmation earns real motion:
 * the two glyphs cross-fade in place on opacity + scale + blur (all
 * compositor-only) rather than snapping. They share one grid cell so the label
 * never shifts mid-swap, and the whole thing collapses to an instant swap under
 * `prefers-reduced-motion`.
 */
const CopyStateIcon = ({
  copied,
  className,
  ...props
}: IconProps & { copied: boolean }): ReactElement => {
  const layer = classNames(
    className,
    'col-start-1 row-start-1 transition-[opacity,transform,filter] duration-200 motion-reduce:transition-none',
    EASE_OUT_EXPO,
  );

  return (
    <span className="inline-grid">
      <CopyIcon
        {...props}
        className={classNames(layer, copied && 'scale-50 opacity-0 blur-[2px]')}
      />
      <VIcon
        {...props}
        secondary
        className={classNames(
          layer,
          'text-status-success',
          !copied && 'scale-50 opacity-0 blur-[2px]',
        )}
      />
    </span>
  );
};

export function ShareActions({
  link,
  text,
  cid,
  variant = 'icon',
  openOnHover = false,
  buttonVariant = ButtonVariant.Tertiary,
  buttonSize = ButtonSize.Small,
  label = 'Copy link',
  triggerText,
  dropdownLabel = 'More share options',
  emailTitle,
  emailSummary,
  shortenUrl = true,
  className,
  onShare,
}: ShareActionsProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [open, setOpen] = useState(false);
  const [copying, shareOrCopy] = useShareOrCopyLink({ link, text, cid });
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  // `copying` stays true for a second after a copy, which is the whole window
  // for the confirmation swap.
  const copyIcon = <CopyStateIcon copied={copying} />;

  const list = (
    <SocialShareList
      link={link}
      description={text}
      emailTitle={emailTitle}
      emailSummary={emailSummary}
      shortenUrl={shortenUrl}
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
          icon={copyIcon}
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
        >
          {triggerText}
        </Button>
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

  const shareList = (
    <>
      <Typography type={TypographyType.Callout} bold className="w-full">
        Share
      </Typography>
      {list}
    </>
  );

  // Two real buttons that read as one control: the left half copies straight
  // away, the right half drops the standard share menu.
  if (variant === 'split') {
    return (
      <div className={classNames('flex items-stretch', className)}>
        <Tooltip content={label}>
          <Button
            type="button"
            variant={buttonVariant}
            size={buttonSize}
            icon={copyIcon}
            // `border-r-0` matters: both halves carry the DS 1px border, and
            // two of them meeting at the seam is what reads as a double rule on
            // the outlined variants.
            className={classNames(
              'rounded-r-none border-r-0',
              SPLIT_MAIN_INNER_PADDING[buttonSize],
            )}
            onClick={(event: React.MouseEvent) => {
              stopParentClick(event);
              onShare?.(ShareProvider.CopyLink);
              shareOrCopy();
            }}
          >
            {triggerText ?? label}
          </Button>
        </Tooltip>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={buttonVariant}
              size={buttonSize}
              // A chevron is a secondary affordance, so it sits a step below the
              // button's default glyph size; the button itself stays a standard
              // icon-only box (square, DS padding) apart from the shared edge.
              icon={
                <ArrowIcon
                  size={IconSize.Size16}
                  // Flips to point back at the menu it opened — the one piece of
                  // state the trigger can show once the list covers the button.
                  className={classNames(
                    'transition-transform duration-200 motion-reduce:transition-none',
                    EASE_OUT_EXPO,
                    open ? 'rotate-0' : 'rotate-180',
                  )}
                />
              }
              aria-label={dropdownLabel}
              pressed={open}
              // Radix opens the menu on pointerdown, so the click that follows
              // is free to be stopped here.
              onClick={stopParentClick}
              // The divider is this half's own DS border, kept while the main
              // half drops its right border — two borders meeting is what read
              // as a double rule. Being the real border, it is full height and
              // matches the outer edge in width, colour and hover transition by
              // construction, with nothing to keep in sync. Borderless variants
              // have no border to match and draw their own rule — see
              // `dividerFor`.
              className={classNames(
                'rounded-l-none',
                dividerFor(buttonVariant),
                SPLIT_CHEVRON_PADDING[buttonSize],
              )}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-4">
            {/* DropdownMenuContent wraps its children in a scroll container, so
                the grid has to live inside that wrapper, not on the content. */}
            <div className="flex flex-wrap justify-center gap-2">
              {shareList}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content={label} visible={!open}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={buttonVariant}
            size={buttonSize}
            icon={copyIcon}
            aria-label={label}
            pressed={open}
            className={className}
            {...hoverProps}
          >
            {triggerText}
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="top"
        align="center"
        avoidCollisions
        className="flex w-80 flex-wrap justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        {...hoverProps}
      >
        {shareList}
      </PopoverContent>
    </Popover>
  );
}
