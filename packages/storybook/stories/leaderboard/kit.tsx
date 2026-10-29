import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  BellIcon,
  CompassIcon,
  HomeIcon,
  SearchIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { TopRankBadge } from '@dailydotdev/shared/src/components/cards/Leaderboard/TopRankBadge';
import type { Dev, Range } from './data';
import { formatNumber, RANGES, unitFor } from './data';

/* ------------------------------------------------------------ primitives */

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

/** The score with its unit, so "1304" always says what it counts. */
export const Score = ({
  value,
  unit,
  strong = true,
  className,
}: {
  value: number;
  unit: string;
  strong?: boolean;
  className?: string;
}): ReactElement => (
  <span
    title={value >= 1000 ? value.toLocaleString('en-US') : undefined}
    className={classNames(
      'shrink-0 whitespace-nowrap tabular-nums typo-callout',
      className,
    )}
  >
    <span className={strong ? 'font-bold text-text-primary' : ''}>
      {formatNumber(value)}
    </span>{' '}
    <span className="text-text-quaternary typo-footnote">
      {unitFor(value, unit)}
    </span>
  </span>
);

export const Delta = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}): ReactElement => {
  if (!value) {
    return (
      <span
        className={classNames(
          'w-9 shrink-0 text-center text-text-quaternary typo-caption1',
          className,
        )}
      >
        –
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={classNames(
        'flex w-9 shrink-0 items-center justify-center gap-0.5 font-bold tabular-nums typo-caption1',
        up ? 'text-accent-avocado-default' : 'text-accent-ketchup-default',
        className,
      )}
    >
      <ArrowIcon size={IconSize.Size16} className={up ? '' : 'rotate-180'} />
      {Math.abs(value)}
    </span>
  );
};

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}): ReactElement => (
  <div className="flex shrink-0 rounded-12 bg-surface-float p-0.5">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => onChange(option.id)}
        className={classNames(
          'rounded-10 font-bold transition-colors',
          size === 'md' ? 'h-8 px-3 typo-callout' : 'h-7 px-2.5 typo-footnote',
          value === option.id
            ? 'bg-background-default text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const RangeSwitch = ({
  value,
  onChange,
  size,
}: {
  value: Range;
  onChange: (value: Range) => void;
  size?: 'sm' | 'md';
}): ReactElement => (
  <Segmented value={value} options={RANGES} onChange={onChange} size={size} />
);

export const Chip = ({
  active,
  children,
  onClick,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex h-8 shrink-0 items-center gap-1.5 rounded-10 border px-3 font-bold typo-footnote transition-colors',
      active
        ? 'border-transparent bg-text-primary text-surface-invert'
        : 'border-border-subtlest-tertiary text-text-secondary hover:border-border-subtlest-secondary hover:text-text-primary',
    )}
  >
    {icon}
    {children}
  </button>
);

/**
 * One size and one style everywhere: a small primary Follow. People you
 * already follow get no button, and following someone removes it.
 */
export const FollowButton = ({ dev }: { dev: Dev }): ReactElement | null => {
  const [following, setFollowing] = useState(dev.isFollowing);
  if (dev.isMe || following) {
    return null;
  }
  return (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Primary}
      className="shrink-0"
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setFollowing(true);
      }}
    >
      Follow
    </Button>
  );
};

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle',
      className,
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-4">
    <div className="flex min-w-0 flex-col gap-0.5">
      <h3 className="font-bold typo-body">{title}</h3>
      {subtitle && (
        <span className="text-text-tertiary typo-footnote">{subtitle}</span>
      )}
    </div>
    {action}
  </div>
);

export const SeeAll = ({ label = 'Top 100' }: { label?: string }) => (
  <button
    type="button"
    className="flex shrink-0 items-center gap-1 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
  >
    {label}
    <ArrowIcon size={IconSize.Size16} className="rotate-90" />
  </button>
);

/** Name and handle, with a profile card on hover. */
export const DevName = ({
  dev,
  showBio = false,
  showHandle = true,
}: {
  dev: Dev;
  showBio?: boolean;
  showHandle?: boolean;
}): ReactElement => (
  <span className="group/name relative flex min-w-0 flex-1 flex-col">
    <span className="flex min-w-0 items-center gap-1">
      <span
        className={classNames(
          'min-w-0 truncate font-bold typo-callout',
          dev.isMe && 'text-accent-cabbage-default',
        )}
      >
        {dev.name}
      </span>
      {showHandle && !dev.isMe && (
        <span className="min-w-0 shrink-[4] truncate text-text-quaternary typo-footnote">
          @{dev.username}
        </span>
      )}
    </span>
    {showBio && (
      <span className="truncate text-text-tertiary typo-footnote">
        {dev.bio}
      </span>
    )}
  </span>
);

export const HoverCard = ({ dev }: { dev: Dev }): ReactElement => (
  <div className="pointer-events-auto flex w-72 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2">
    <div className="flex items-center gap-3">
      <Avatar dev={dev} size="size-12" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-callout">{dev.name}</span>
        <span className="truncate text-text-tertiary typo-footnote">
          @{dev.username} · Level {dev.level} ·{' '}
          {formatNumber(dev.scores.reputation.all)} rep
        </span>
      </div>
    </div>
    <p className="text-text-secondary typo-footnote">{dev.bio}</p>
    <div className="flex flex-wrap gap-1">
      {dev.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1"
        >
          #{tag}
        </span>
      ))}
    </div>
    <div className="flex gap-2">
      <FollowButton dev={dev} />
      <Button
        type="button"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
      >
        Profile
      </Button>
    </div>
  </div>
);

export const Row = ({
  rank,
  dev,
  children,
  highlight,
  dense = false,
  hoverCard = false,
  onClick,
  selected,
  showLevel = false,
}: {
  rank: number;
  dev: Dev;
  children?: ReactNode;
  highlight?: boolean;
  dense?: boolean;
  hoverCard?: boolean;
  /** Without one, the row opens the profile, as rows do today. */
  onClick?: () => void;
  selected?: boolean;
  /** The level badge today's Highest level list shows. */
  showLevel?: boolean;
}): ReactElement => (
  <li
    title={onClick || dev.isMe ? undefined : `Open ${dev.name}’s profile`}
    className={classNames(
      'group group/row relative flex cursor-pointer items-center gap-3 rounded-12 px-2',
      dense ? 'h-10' : 'h-12',
      highlight ? youHighlight : 'hover:bg-surface-hover',
      selected && 'bg-surface-float',
    )}
    onClick={onClick}
  >
    <Rank rank={rank} />
    {showLevel && (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-accent-cabbage-default font-bold tabular-nums typo-caption2">
        {dev.level}
      </span>
    )}
    <Avatar dev={dev} size={dense ? 'size-7' : 'size-8'} />
    <DevName dev={dev} showHandle={false} />
    {children}
    {hoverCard && !dev.isMe && (
      <div className="pointer-events-none invisible absolute left-14 top-full z-3 pt-1 opacity-0 transition-opacity delay-150 group-hover/row:visible group-hover/row:opacity-100">
        <HoverCard dev={dev} />
      </div>
    )}
  </li>
);

export const Divider = ({ label }: { label?: string }): ReactElement => (
  <li className="flex items-center gap-2 px-3 py-1 text-text-quaternary typo-caption1">
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    {label ?? '⋯'}
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
  </li>
);

/* ------------------------------------------------------------- dropdown */

export interface Option<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  meta?: ReactNode;
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
        {current.icon && (
          <span className="text-text-tertiary">{current.icon}</span>
        )}
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
                  {option.icon && (
                    <span className="text-text-tertiary">{option.icon}</span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.meta && (
                    <span className="text-text-quaternary typo-footnote">
                      {option.meta}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </span>
  );
};

/* ----------------------------------------------------------------- frame */

const RailItem = ({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex w-16 flex-col items-center gap-1 rounded-12 py-2 typo-caption2',
      active ? 'bg-background-default text-text-primary' : 'text-text-tertiary',
    )}
  >
    {icon}
    {label}
  </span>
);

const DESKTOP = { width: 1440, height: 900 };

/**
 * A 1440×900 browser window scaled to the column, with the v2 rail and a
 * header, so each layout is judged at the size people see it.
 */
export const DesktopFrame = ({
  children,
  height = DESKTOP.height,
  search = true,
}: {
  children: ReactNode;
  height?: number;
  /** Off for layouts that carry their own header row. */
  search?: boolean;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (!box.current) {
      return undefined;
    }
    const element = box.current;
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1, element.clientWidth / DESKTOP.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="w-full min-w-0">
      <div
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
        style={{ width: DESKTOP.width * scale, height: height * scale + 40 }}
      >
        <div className="flex h-10 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-3">
          <span className="size-3 rounded-full bg-accent-ketchup-default opacity-60" />
          <span className="size-3 rounded-full bg-accent-cheese-default opacity-60" />
          <span className="size-3 rounded-full bg-accent-avocado-default opacity-60" />
          <span className="ml-3 flex h-7 flex-1 items-center rounded-8 bg-surface-float px-3 text-text-tertiary typo-footnote">
            app.daily.dev<span className="text-text-primary">/users</span>
          </span>
        </div>
        <div
          style={{
            width: DESKTOP.width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="flex overflow-hidden"
        >
          <nav className="flex w-20 shrink-0 flex-col items-center gap-1 bg-background-subtle pt-3">
            <span className="mb-3 flex h-8 items-center">
              <LogoIcon className={{ container: 'h-6' }} />
            </span>
            <RailItem icon={<HomeIcon />} label="Home" />
            <RailItem icon={<CompassIcon secondary />} label="Explore" active />
            <RailItem icon={<SquadIcon />} label="Squads" />
            <RailItem icon={<BellIcon />} label="Activity" />
          </nav>
          <div className="flex min-w-0 flex-1 flex-col">
            {search && (
              <header className="flex h-14 shrink-0 items-center gap-6 border-b border-border-subtlest-tertiary px-6">
                <span className="ml-auto flex h-9 w-80 items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-callout">
                  <SearchIcon /> Search people
                </span>
              </header>
            )}
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------- doc furniture */

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="font-bold uppercase tracking-widest text-text-quaternary typo-caption1">
    {children}
  </span>
);

export const Callout = ({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'good' | 'bad' | 'brand';
  title?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1 rounded-16 border p-4 typo-callout',
      tone === 'neutral' && 'border-border-subtlest-tertiary',
      tone === 'good' && 'border-accent-avocado-default bg-accent-avocado-flat',
      tone === 'bad' && 'border-accent-ketchup-default bg-accent-ketchup-flat',
      tone === 'brand' &&
        'border-accent-cabbage-default bg-accent-cabbage-flat',
    )}
  >
    {title && <strong className="text-text-primary">{title}</strong>}
    <div className="text-text-secondary">{children}</div>
  </div>
);

export const Bullets = ({ items }: { items: ReactNode[] }): ReactElement => (
  <ul className="flex flex-col gap-1.5">
    {items.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index} className="flex gap-2">
        <span className="text-text-quaternary">•</span>
        <span className="min-w-0 flex-1">{item}</span>
      </li>
    ))}
  </ul>
);
