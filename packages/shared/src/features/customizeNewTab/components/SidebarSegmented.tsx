import type { KeyboardEvent, ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Rendered instead of `label` when you want an icon-only pill. */
  iconOnly?: boolean;
  icon?: React.ComponentType<IconProps>;
  disabled?: boolean;
}

interface Props<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * iOS-style segmented control with a tinted track and an elevated
 * "thumb". Shared across Mode, Theme, Layout, Source and Focus-length
 * pickers so states (hover, selected, focus-visible) stay identical
 * everywhere in the Customize sidebar.
 *
 * Arrow keys cycle the selection for proper `role="radiogroup"` a11y;
 * focus-visible rings are on by default.
 */
export const SidebarSegmented = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  fullWidth = true,
  className,
}: Props<T>): ReactElement => {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const focusIndex = useCallback((index: number) => {
    const next = buttonsRef.current[index];
    if (next) {
      next.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const enabledIndexes = options
        .map((option, index) => (option.disabled ? -1 : index))
        .filter((index) => index !== -1);
      const position = enabledIndexes.indexOf(currentIndex);
      if (position === -1) {
        return;
      }

      let nextPosition: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextPosition = (position + 1) % enabledIndexes.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextPosition =
            (position - 1 + enabledIndexes.length) % enabledIndexes.length;
          break;
        case 'Home':
          nextPosition = 0;
          break;
        case 'End':
          nextPosition = enabledIndexes.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextIndex = enabledIndexes[nextPosition];
      const nextValue = options[nextIndex].value;
      onChange(nextValue);
      focusIndex(nextIndex);
    },
    [focusIndex, onChange, options],
  );

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={classNames(
        'flex gap-1 rounded-10 bg-surface-float p-1',
        fullWidth ? 'w-full' : 'inline-flex',
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const Icon = option.icon;
        const showLabel = !option.iconOnly;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.iconOnly ? option.label : undefined}
            disabled={option.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => !option.disabled && onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={classNames(
              'flex min-w-0 items-center justify-center gap-1.5 rounded-8 px-2 py-1.5 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
              fullWidth && 'flex-1',
              option.disabled && 'opacity-50',
              selected
                ? 'bg-background-default text-text-primary ring-1 ring-border-subtlest-tertiary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {Icon ? (
              <Icon
                size={IconSize.Size16}
                secondary={selected}
                className="shrink-0"
              />
            ) : null}
            {showLabel ? (
              <Typography
                type={TypographyType.Footnote}
                bold={selected}
                color={
                  selected ? TypographyColor.Primary : TypographyColor.Tertiary
                }
                className="truncate"
              >
                {option.label}
              </Typography>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
