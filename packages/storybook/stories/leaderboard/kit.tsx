import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TopRankBadge } from '@dailydotdev/shared/src/components/cards/Leaderboard/TopRankBadge';
import type { Dev } from './data';

/** Your own row and card: a soft tint, no border. */
export const youHighlight =
  'bg-[color-mix(in_srgb,var(--theme-accent-cabbage-default)_24%,transparent)]';

export const Avatar = ({
  dev,
  size = 'size-8',
  className,
}: {
  dev: Pick<Dev, 'image' | 'name'>;
  size?: string;
  className?: string;
}): ReactElement => (
  <img
    src={dev.image}
    alt=""
    className={classNames(
      'shrink-0 rounded-10 bg-surface-float object-cover',
      size,
      className,
    )}
  />
);

/** A medal for the top 3, the number for everyone else. Never blank. */
export const Rank = ({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex w-8 shrink-0 items-center justify-center tabular-nums',
      className,
    )}
  >
    {rank <= 3 ? (
      <>
        <TopRankBadge rankIndex={rank - 1} />
        <span className="sr-only">{rank}</span>
      </>
    ) : (
      <span className="font-bold text-text-tertiary typo-callout">
        {rank.toLocaleString('en-US')}
      </span>
    )}
  </span>
);

/* ------------------------------------------------------------- dropdown */

export interface Option<T extends string> {
  id: T;
  label: string;
}

/** A plain menu: a quiet trigger, a popover list, closes on choice. */
export const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value) ?? options[0];
  return (
    <span className={classNames('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 rounded-12 border border-border-subtlest-tertiary px-3 font-bold transition-colors typo-callout hover:bg-surface-hover"
      >
        {current.label}
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames(
            'text-text-tertiary transition-transform',
            open ? '' : 'rotate-180',
          )}
        />
      </button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-2"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <ul className="absolute left-0 top-full z-3 mt-1 flex min-w-[16rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2 typo-callout">
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={classNames(
                    'flex w-full items-center gap-3 rounded-12 px-3 py-2 text-left font-normal hover:bg-surface-hover',
                    option.id === value && 'bg-surface-float font-bold',
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </span>
  );
};

/* --------------------------------------------------------- doc furniture */

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="font-bold uppercase tracking-widest text-text-quaternary typo-caption1">
    {children}
  </span>
);

export const Callout = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4 typo-callout">
    <strong className="text-text-primary">{title}</strong>
    <div className="text-text-secondary">{children}</div>
  </div>
);
