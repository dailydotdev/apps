import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Tooltip } from '../tooltip/Tooltip';
import { CopyStateIcon, EASE_OUT_EXPO } from './CopyStateIcon';

export interface SplitShareButtonProps {
  /** Tooltip and accessible name for the copy half. */
  label: string;
  /** Accessible name for the chevron half. */
  dropdownLabel: string;
  /** Visible text on the copy half; falls back to `label`. */
  triggerText?: string;
  /** Contents of the dropdown the chevron opens. */
  menu: ReactNode;
  /** Drives the copy-glyph confirmation swap. */
  copied: boolean;
  onCopy: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * The halves meet at a single hairline, so the standard side paddings would
 * leave a canyon around it. Both sides tighten by one step from the DS value —
 * the outer edges keep the standard padding, so the control still reads as one
 * button.
 */
const MAIN_INNER_PADDING: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: '!pr-5',
  [ButtonSize.Large]: '!pr-4',
  [ButtonSize.Medium]: '!pr-3',
  [ButtonSize.Small]: '!pr-2',
  [ButtonSize.XSmall]: '!pr-1.5',
};

/** Drops the icon-only square so the chevron hugs the seam symmetrically. */
const CHEVRON_PADDING: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: '!w-auto !px-3',
  [ButtonSize.Large]: '!w-auto !px-2.5',
  [ButtonSize.Medium]: '!w-auto !px-2',
  [ButtonSize.Small]: '!w-auto !px-1.5',
  [ButtonSize.XSmall]: '!w-auto !px-1',
};

const DIVIDER_BASE =
  "relative border-l-0 before:absolute before:left-0 before:w-px before:content-['']";

/**
 * Variants that paint `--button-default-border-color: transparent` have no
 * border for the divider to match, so they draw their own 1px rule. Every other
 * variant returns nothing and keeps its real border as the divider.
 *
 * Alpha is mixed into the colour rather than applied as a separate utility:
 * `before:opacity-*` does not survive this project's Tailwind build on
 * pseudo-elements and silently renders at full strength. `bg-current` is
 * likewise unusable — the theme replaces Tailwind's `colors` wholesale and has
 * no `current` key, so it compiles to nothing at all.
 */
const dividerFor = (variant: ButtonVariant): string | false => {
  // Sits on a solid fill, where only the label colour is guaranteed to read.
  if (variant === ButtonVariant.Primary) {
    return classNames(
      DIVIDER_BASE,
      'before:inset-y-0 before:bg-[color-mix(in_srgb,var(--button-color,var(--button-default-color)),transparent_80%)]',
    );
  }

  // A bare ghost button: a full-height rule would float with nothing to anchor
  // it, so it gets a shorter one in the colour `tailwind/buttons.ts` gives the
  // Subtle variant's border.
  if (variant === ButtonVariant.Tertiary) {
    return classNames(
      DIVIDER_BASE,
      'before:inset-y-1.5 before:bg-[color-mix(in_srgb,var(--theme-border-subtlest-primary),transparent_70%)]',
    );
  }

  return false;
};

/**
 * The halves keep their clicks to themselves: a parent that acts on clicks
 * steals focus the moment the menu opens, which dismisses it right away — e.g.
 * a TextField, whose container focuses its input on click.
 */
const stopParentClick = (event: React.MouseEvent): void =>
  event.stopPropagation();

/**
 * Two real buttons that read as one control: the left half runs the primary
 * action, the right half drops the standard menu. Geometry matches a standard
 * button at every size — only the shared edge deviates.
 */
export const SplitShareButton = ({
  label,
  dropdownLabel,
  triggerText,
  menu,
  copied,
  onCopy,
  variant = ButtonVariant.Tertiary,
  size = ButtonSize.Small,
  className,
}: SplitShareButtonProps): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <div className={classNames('flex items-stretch', className)}>
      <Tooltip content={label}>
        <Button
          type="button"
          variant={variant}
          size={size}
          icon={<CopyStateIcon copied={copied} />}
          // Both halves carry the DS 1px border, and two of them meeting at the
          // seam is what reads as a double rule on the outlined variants.
          className={classNames(
            'rounded-r-none border-r-0',
            MAIN_INNER_PADDING[size],
          )}
          onClick={(event: React.MouseEvent) => {
            stopParentClick(event);
            onCopy();
          }}
        >
          {triggerText ?? label}
        </Button>
      </Tooltip>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            // A chevron is a secondary affordance, so it sits a step below the
            // button's default glyph size.
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
            // Radix opens the menu on pointerdown, so the click that follows is
            // free to be stopped here.
            onClick={stopParentClick}
            // Deliberately no `pressed`: it renders `aria-pressed`, which the
            // button styles paint as a held-down fill, and the rotating chevron
            // is the only open-state signal this control wants. Radix already
            // puts `aria-expanded` on the trigger, which is the correct
            // semantic for a menu anyway.
            // This half keeps its own DS border as the divider, so it is full
            // height and matches the outer edge in width, colour and hover
            // transition by construction. Borderless variants draw their own —
            // see `dividerFor`.
            className={classNames(
              'rounded-l-none',
              dividerFor(variant),
              CHEVRON_PADDING[size],
            )}
          />
        </DropdownMenuTrigger>
        {/* `!p-4` because the dropdown's CSS module applies `p-1.5` at the same
            specificity — a plain `p-4` loses on stylesheet order and silently
            does nothing. */}
        <DropdownMenuContent align="end" className="w-80 !p-4">
          {/* DropdownMenuContent wraps its children in a scroll container, so
              the grid has to live inside that wrapper, not on the content.
              A 4-column grid rather than `flex-wrap`: the columns divide the
              content box exactly, so no leftover width collects on one side and
              the padding reads equal on all four. */}
          <div className="grid grid-cols-4 justify-items-center gap-2">
            {menu}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
