import type { ReactElement } from 'react';
import React, { cloneElement, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../dropdown/DropdownMenu';
import { IconSize } from '../../../Icon';
import { composerVariants } from './registry';
import type { ComposerKind } from './types';

interface KindModePickerProps {
  kind: ComposerKind;
  onKindChange: (next: ComposerKind) => void;
  disabled?: boolean;
}

/** Display order for the mode dropdown. */
const MENU_ORDER: ComposerKind[] = ['text', 'poll', 'standup'];

/**
 * Neutral Subtle chip — soft gray border, primary text/icon. Same design
 * across all post types so the picker reads as a quiet, system-default
 * affordance.
 */
const TRIGGER_CLASSES = {
  border: 'border-border-subtlest-tertiary',
  borderHover: 'hover:border-border-subtlest-secondary',
  bgHover: 'hover:bg-surface-float',
  bgOpen: 'bg-surface-float',
  text: 'text-text-primary',
};

export const KindModePicker = ({
  kind,
  onKindChange,
  disabled,
}: KindModePickerProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const variant = composerVariants[kind];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`${variant.picker.label} mode — change post type`}
          className={classNames(
            'group inline-flex h-8 shrink-0 items-center justify-center rounded-8 border transition-colors',
            TRIGGER_CLASSES.text,
            TRIGGER_CLASSES.border,
            TRIGGER_CLASSES.borderHover,
            open ? TRIGGER_CLASSES.bgOpen : 'bg-transparent',
            !open && TRIGGER_CLASSES.bgHover,
            disabled && 'opacity-60 cursor-default',
          )}
        >
          {/* Square 32×32 icon area at rest. */}
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center"
          >
            {cloneElement(variant.picker.icon, { size: IconSize.Size16 })}
          </span>
          {/* Label morph: column collapses to 0 (using minmax(0,0fr)
              so no glyph leaks out at rest) and expands to 1fr on
              hover/open. */}
          <span
            className={classNames(
              'grid overflow-hidden transition-[grid-template-columns] duration-200',
              open
                ? 'grid-cols-[minmax(0,1fr)]'
                : 'grid-cols-[minmax(0,0fr)] group-hover:grid-cols-[minmax(0,1fr)] group-focus-visible:grid-cols-[minmax(0,1fr)]',
            )}
          >
            <span className="min-w-0 overflow-hidden whitespace-nowrap pr-2 typo-caption1">
              {variant.picker.label} mode
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        variant="action"
        className="!min-w-36"
      >
        {MENU_ORDER.map((optionKind) => {
          const optionVariant = composerVariants[optionKind];
          const isActive = kind === optionKind;
          return (
            <DropdownMenuItem
              key={optionKind}
              onSelect={(event: Event) => {
                event.preventDefault();
                onKindChange(optionKind);
                setOpen(false);
              }}
              aria-checked={isActive}
              className="!gap-2"
            >
              {cloneElement(optionVariant.picker.icon, {
                size: IconSize.XXSmall,
                className: 'shrink-0 text-text-primary',
              })}
              <span
                className={classNames(
                  'min-w-0 flex-1 truncate text-left text-text-primary',
                  isActive && 'font-bold',
                )}
              >
                {optionVariant.picker.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
