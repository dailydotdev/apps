import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export type SidebarSegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  /** When true the label is hidden and only the icon is shown. */
  iconOnly?: boolean;
  ariaLabel?: string;
};

export type SidebarSegmentedProps<T extends string> = {
  value: T;
  options: ReadonlyArray<SidebarSegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
};

export const SidebarSegmented = <T extends string>({
  value,
  options,
  onChange,
  className,
  size = 'md',
}: SidebarSegmentedProps<T>): ReactElement => (
  <div
    role="radiogroup"
    className={classNames(
      'flex w-full items-stretch rounded-12 bg-surface-float p-1 typo-footnote',
      className,
    )}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={classNames(
            'flex flex-1 items-center justify-center gap-1.5 rounded-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
            size === 'sm' ? 'h-7 px-2' : 'h-9 px-3',
            selected
              ? 'bg-background-default text-text-primary ring-1 ring-border-subtlest-tertiary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {option.icon}
          {!option.iconOnly && <span className="truncate">{option.label}</span>}
        </button>
      );
    })}
  </div>
);
