import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { StreakMilestone } from './data';
import { tierArt, weekDays } from './data';

// The celebration half of the moment: flame tier artwork, embers, the streak
// number. Everything here belongs to daily.dev, so no partner paint touches it.
//
// Artwork and the ember burst come from the streak progression PR (#5613).

// The streak's own fire: bacon pink through to a warm red, matching the
// accent the app already uses for streaks.
const PARTICLE_COLORS = [
  'rgba(236, 82, 122, 0.9)',
  'rgba(255, 116, 84, 0.85)',
  'rgba(248, 103, 137, 0.85)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(211, 68, 56, 0.75)',
];

// Seeded so the embers land in the same place on every render, which keeps
// story screenshots and visual review stable.
const seeded = (seed: number): number => {
  const value = Math.sin(seed * 9301 + 49297) * 49297;

  return value - Math.floor(value);
};

const embers = (count: number, seed: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    left: 14 + seeded(seed + index * 7) * 72,
    top: 10 + seeded(seed + index * 13) * 62,
    size: 4 + seeded(seed + index * 3) * 7,
    delay: seeded(seed + index * 5) * 1400,
    duration: 1.4 + seeded(seed + index * 11) * 1.4,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  }));

export enum FlameSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

// A small badge with fourteen embers looks like static. Scale the burst too.
const emberCount: Record<FlameSize, number> = {
  [FlameSize.Small]: 7,
  [FlameSize.Medium]: 10,
  [FlameSize.Large]: 14,
};

const flameSizeClass: Record<FlameSize, string> = {
  [FlameSize.Small]: 'h-20 w-20',
  [FlameSize.Medium]: 'h-32 w-32',
  [FlameSize.Large]: 'h-40 w-40',
};

/** The tier badge: real artwork, a warm glow under it, embers rising off it. */
export const FlameBadge = ({
  milestone,
  size = FlameSize.Large,
  withEmbers = true,
  className,
}: {
  milestone: StreakMilestone;
  size?: FlameSize;
  withEmbers?: boolean;
  className?: string;
}): ReactElement => (
  <div className={classNames('relative flex items-center justify-center', className)}>
    <span
      aria-hidden
      className="absolute inset-0 rounded-full opacity-70 blur-2xl"
      style={{
        background:
          'radial-gradient(circle, rgba(236,82,122,0.55) 0%, rgba(177,75,215,0.25) 45%, transparent 70%)',
      }}
    />
    {withEmbers &&
      embers(emberCount[size], milestone.day).map((ember) => (
        <span
          key={ember.id}
          aria-hidden
          className="mr-particle pointer-events-none absolute rounded-full"
          style={
            {
              left: `${ember.left}%`,
              top: `${ember.top}%`,
              width: ember.size,
              height: ember.size,
              background: ember.color,
              '--mr-delay': `${ember.delay}ms`,
              '--mr-duration': `${ember.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    <img
      src={tierArt(milestone.tier)}
      alt={`${milestone.label} streak badge`}
      className={classNames('mr-badge-in relative object-contain', flameSizeClass[size])}
      style={{ filter: 'drop-shadow(0 8px 34px rgba(236, 82, 122, 0.5))' }}
    />
  </div>
);

/** Streak count, digits rolling in one after another. */
export const StreakCount = ({
  day,
  className,
}: {
  day: number;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-baseline font-bold tabular-nums',
      className,
    )}
  >
    {String(day)
      .split('')
      .map((digit, index) => (
        <span
          // Digits of a fixed number: index is the only identity they have.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="mr-digit inline-block overflow-hidden"
          style={{ '--mr-delay': `${140 + index * 90}ms` } as CSSProperties}
        >
          {digit}
        </span>
      ))}
  </span>
);

/**
 * The tier name, flat. The day number is already the biggest thing on the
 * panel, so the label carries the name and nothing else.
 */
export const TierName = ({
  milestone,
  className,
}: {
  milestone: StreakMilestone;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'w-fit rounded-8 bg-accent-bacon-default px-2 py-1 font-bold uppercase tracking-[0.16em] text-white typo-caption1',
      className,
    )}
  >
    {milestone.label}
  </span>
);

/** Seven days behind the streak. Small, but it is the proof the number is real. */
export const DayStrip = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    {weekDays.map((label, index) => (
      <span
        key={`${label}-${weekDays.length - index}`}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-bacon-default text-text-primary typo-caption2"
        style={{ background: 'rgba(255, 131, 61, 0.18)' }}
      >
        {label}
      </span>
    ))}
  </div>
);

/**
 * The gift framing, and the only headline on the gift side of the popup.
 *
 * One sentence, one subline. The streak detail lives on the celebration side,
 * so this half never repeats it: a reader should be able to take the whole
 * right column in at a glance.
 */
export const GiftHeadline = ({
  eyebrow,
  count,
  className,
  centered,
}: {
  eyebrow?: string;
  count?: number;
  className?: string;
  centered?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1',
      centered && 'items-center text-center',
      className,
    )}
  >
    {eyebrow && (
      <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
        {eyebrow}
      </span>
    )}
    <h3 className="mr-balance font-bold typo-title2">
      Here&apos;s a little{' '}
      <span className="text-accent-bacon-default">gift</span> from us
    </h3>
    <p className="mr-pretty text-text-tertiary typo-callout">
      {count && count > 1
        ? 'Choose one of our partner offers below'
        : 'A partner offer, on your streak'}
    </p>
  </div>
);

/**
 * The whole of the small print, in one line. Everything it used to say twice
 * (sponsorship, commission, expiry, renewal) is either here or on the claim
 * sheet, and never in both places.
 */
export const FinePrint = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <p className={classNames('text-text-quaternary typo-caption1', className)}>
    Sponsored offers. No charge until a trial ends, cancel anytime.
  </p>
);

/**
 * How the popup ends when the user does not want anything.
 *
 * On a phone the decline has to be a real target near the thumb, because the
 * close button is a small X in a far corner. On desktop the X is already right
 * there under the cursor, so a full-width button underneath it says the same
 * thing twice.
 */
export enum DeclineStyle {
  /** Desktop default: the X is the decline. Nothing at the bottom. */
  CloseOnly = 'closeOnly',
  /** A quiet link that names what closing actually does. */
  SaveLink = 'saveLink',
  /** Mobile: a real button at the end of the flow. */
  Button = 'button',
}

/** The link version: a forward action rather than a refusal. */
export const SaveForLater = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'w-fit text-text-tertiary underline decoration-dotted underline-offset-2 typo-caption1 hover:text-text-primary',
      className,
    )}
  >
    Save these to my gift vault
  </button>
);

/**
 * The single secondary action. Declining keeps the gift in the vault, so the
 * word can stay this light.
 */
export const NoThanks = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}): ReactElement => (
  <Button
    className={classNames('w-full', className)}
    size={ButtonSize.Medium}
    variant={ButtonVariant.Float}
    onClick={onClick}
  >
    No thanks
  </Button>
);

/**
 * The popup frame. Wide by default: these moments are landscape so the
 * celebration and the gift sit side by side instead of stacking into a scroll.
 *
 * Not the app `Modal` because this is a prototype. Production would use
 * `Modal` (Kind.FlexibleCenter, isDrawerOnMobile).
 */
export const MomentShell = ({
  onClose,
  children,
  className,
  width = 'w-full max-w-[54rem]',
}: {
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
}): ReactElement => (
  // The container has to be an ancestor of what it styles, so the query lives
  // on this wrapper and the card inside it is what collapses.
  <div className={classNames('mr-shell shrink-0', width)}>
    <div
      className={classNames(
        'mr-rise mr-elevated relative flex w-full overflow-hidden rounded-24 bg-background-default',
        className,
      )}
    >
      {children}
      {onClose && (
        <CloseButton
          size={ButtonSize.Small}
          className="absolute right-4 top-4 z-2"
          onClick={onClose}
        />
      )}
    </div>
  </div>
);

/** The warm half of a split popup: ember gradient behind the flame artwork. */
export enum PanelTone {
  /** A live streak. */
  Fire = 'fire',
  /** A streak that ended: same geometry, same layering, no heat. */
  Ash = 'ash',
}

const panelBackground: Record<PanelTone, string> = {
  [PanelTone.Fire]:
    'radial-gradient(120% 100% at 20% 0%, rgba(236,82,122,0.38) 0%, rgba(236,82,122,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(160deg, rgba(177,75,215,0.18) 0%, rgba(15,18,24,0) 60%)',
  [PanelTone.Ash]:
    'radial-gradient(120% 100% at 20% 0%, rgba(236,82,122,0.14) 0%, rgba(98,74,211,0.10) 45%, rgba(15,18,24,0) 76%), linear-gradient(160deg, rgba(168,179,206,0.08) 0%, rgba(15,18,24,0) 60%)',
};

export const EmberPanel = ({
  children,
  className,
  tone = PanelTone.Fire,
}: {
  children: ReactNode;
  className?: string;
  tone?: PanelTone;
}): ReactElement => (
  // No direction here: callers pick flex-col (split) or flex-row (band), and a
  // base direction would win or lose the class-order fight at random.
  <div
    className={classNames('relative flex overflow-hidden', className)}
    style={{ background: panelBackground[tone] }}
  >
    {children}
  </div>
);

/**
 * The broken-streak counterpart to the flame badge: the same artwork slot, the
 * same entrance, but the particles fall instead of rising and the palette is
 * cold. Using the same machinery is the point, so the two moments read as one
 * family with different weather.
 */
export const AshBadge = ({
  src,
  className,
}: {
  src: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames('relative flex items-center justify-center', className)}
  >
    <span
      aria-hidden
      className="mr-halo absolute inset-0 rounded-full blur-2xl"
      style={{
        background:
          'radial-gradient(circle, rgba(236,82,122,0.28) 0%, rgba(98,74,211,0.14) 45%, transparent 72%)',
      }}
    />
    {embers(6, 99).map((mote) => (
      <span
        key={mote.id}
        aria-hidden
        className="mr-ash pointer-events-none absolute rounded-full"
        style={
          {
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: mote.size * 0.7,
            height: mote.size * 0.7,
            background: 'rgba(168, 179, 206, 0.55)',
            '--mr-delay': `${mote.delay}ms`,
            '--mr-duration': `${2.8 + mote.duration}s`,
          } as CSSProperties
        }
      />
    ))}
    <img
      src={src}
      alt="A shattered streak flame"
      className="mr-badge-in relative h-full w-full object-contain"
    />
  </div>
);

/**
 * Dismissal is a first-class action, not a grey afterthought: the gift moves to
 * the vault instead of being destroyed, so declining costs the user nothing.
 */
export const KeepForLater = ({
  onClick,
  label = 'Keep it in my vault',
  className,
}: {
  onClick?: () => void;
  label?: string;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'text-text-tertiary typo-callout hover:text-text-primary',
      className,
    )}
  >
    {label}
  </button>
);

export const OptOutRow = ({
  onOptOut,
  className,
}: {
  onOptOut?: () => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onOptOut}
    className={classNames(
      'text-text-quaternary underline decoration-dotted underline-offset-2 typo-caption1 hover:text-text-secondary',
      className,
    )}
  >
    Don&apos;t offer me gifts
  </button>
);
