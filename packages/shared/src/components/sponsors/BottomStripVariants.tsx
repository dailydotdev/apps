import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { SponsoredStripProps } from './SponsoredStrip';
import {
  Divider,
  Label,
  PARTNER_CAP,
  PartnerRow,
  PrimaryLockup,
  SponsorLogo,
  useShuffledSponsors,
} from './SponsoredStrip';

// =============================================================
// Ten ways to hold a sponsor strip at the bottom of the feed.
//
// The brief: always there, never reading as an ad bar. A bottom
// strip has one problem the other placements do not — it is
// permanent, so it has to justify its permanence every second it
// is on screen. Broadly there are three ways to earn it:
//
//   Get out of the way   — be present but yield while reading
//                          (1 Retract, 2 Condense, 3 Hairline,
//                           9 Idle reveal)
//   Become chrome        — look like part of the tool rather than
//                          part of the page (4 Status bar,
//                           5 Shortcut bar, 10 Browser seam)
//   Do a job             — carry something functional, so the row
//                          is not only inventory (6 Progress)
//
// And one that earns it by restraint rather than utility:
// 7 Broadcast credits shows a single partner at a time, and
// 8 Colophon drops the panel entirely.
//
// The behavioural ones need scroll or idle state, so they are
// best judged over a real feed, not in a static frame.
// =============================================================

type VariantProps = Pick<SponsoredStripProps, 'primary' | 'partners'>;

// --- shared behaviour -----------------------------------------

/** Which way the reader is going: `down` means they are reading. */
const useScrollDirection = (): 'up' | 'down' => {
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      // A threshold keeps sub-pixel jitter from flapping the bar.
      if (Math.abs(y - last) > 8) {
        setDirection(y > last ? 'down' : 'up');
        last = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return direction;
};

/** True once the reader has stopped moving for `delay`. */
const useIdle = (delay = 1200): boolean => {
  const [idle, setIdle] = useState(true);
  const timer = useRef<number>();

  useEffect(() => {
    const bump = () => {
      setIdle(false);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIdle(true), delay);
    };

    window.addEventListener('scroll', bump, { passive: true });
    window.addEventListener('pointermove', bump, { passive: true });
    bump();

    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('scroll', bump);
      window.removeEventListener('pointermove', bump);
    };
  }, [delay]);

  return idle;
};

/** How far down the page the reader is, 0–1. */
const useScrollProgress = (): number => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;

      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
};

/** Cycles an index every `ms`, for the one-at-a-time variants. */
const useRotatingIndex = (length: number, ms: number): number => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length < 2) {
      return undefined;
    }

    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);

    return () => window.clearInterval(id);
  }, [length, ms]);

  return index;
};

const dockBase =
  'sticky bottom-0 z-3 flex w-full items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default px-4 laptop:px-10';

// --- 1. Retract on read ---------------------------------------
// Scrolling down means reading, so the bar leaves. Scrolling up
// means looking for something, so it comes back. The pattern
// mobile browsers use for their own chrome, which is why it reads
// as the product behaving rather than an ad hiding.
export const RetractStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const direction = useScrollDirection();

  return (
    <div
      className={classNames(
        dockBase,
        'h-10 transition-transform duration-300 ease-in-out',
        direction === 'down' && 'translate-y-full',
      )}
    >
      <PrimaryLockup primary={primary} />
      <Divider />
      <PartnerRow partners={partners} />
    </div>
  );
};

// --- 2. Condense on read --------------------------------------
// Never gone, just smaller: the wall collapses to a count while
// the reader moves, and unfolds when they stop. The paid mark is
// on screen the whole time, which is the part that was sold.
export const CondenseStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const direction = useScrollDirection();
  const condensed = direction === 'down';

  return (
    <div className={classNames(dockBase, 'h-10')}>
      <PrimaryLockup primary={primary} />
      <Divider />
      {condensed ? (
        <span className="text-text-quaternary typo-caption1">
          with {partners.length} partners
        </span>
      ) : (
        <PartnerRow partners={partners} />
      )}
    </div>
  );
};

// --- 3. Hairline peek -----------------------------------------
// At rest it is a 6px seam with nothing in it. Approach the
// bottom of the window and it opens. Costs almost no feed and
// asks for no attention, at the price of most impressions.
export const HairlineStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={classNames(
        dockBase,
        'overflow-hidden transition-[height] duration-200 ease-out',
        open ? 'h-10' : 'h-1.5',
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <>
          <PrimaryLockup primary={primary} />
          <Divider />
          <PartnerRow partners={partners} />
        </>
      )}
    </div>
  );
};

// --- 4. Status bar --------------------------------------------
// Dressed as an editor status bar: shorter, monospaced, muted,
// no border radius anywhere. Developers read this shape as part
// of the tool, not as a placement in it.
export const StatusBarStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div
    className={classNames(
      dockBase,
      'bg-surface-invert/[0.03] h-7 gap-4 border-border-subtlest-tertiary font-mono',
    )}
  >
    <span className="shrink-0 text-text-quaternary typo-caption2">
      sponsored
    </span>
    <SponsorLogo height={12} monochrome={false} sponsor={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 5. Shortcut bar ------------------------------------------
// The row carries the keyboard hints the app already supports and
// puts the sponsor at the end of it. Permanence stops needing an
// argument: the bar is useful, and a sponsor sits on it.
export const ShortcutBarStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className={classNames(dockBase, 'h-9 gap-6')}>
    {[
      { keys: '⌘K', label: 'Search' },
      { keys: 'J / K', label: 'Next · previous' },
      { keys: 'B', label: 'Bookmark' },
    ].map(({ keys, label }) => (
      <span
        className="flex shrink-0 items-center gap-1.5 typo-caption1"
        key={keys}
      >
        <kbd className="rounded-4 border border-border-subtlest-tertiary px-1 font-mono text-text-tertiary typo-caption2">
          {keys}
        </kbd>
        <span className="text-text-quaternary">{label}</span>
      </span>
    ))}
    <span className="ml-auto flex min-w-0 items-center gap-4">
      <PrimaryLockup primary={primary} />
      <Divider />
      <span className="hidden min-w-0 max-w-[28rem] flex-1 laptop:flex">
        <PartnerRow partners={partners} />
      </span>
    </span>
  </div>
);

// --- 6. Progress rail -----------------------------------------
// The strip's top edge is the feed's scroll progress. It does a
// job the page needs done, so it is chrome that happens to be
// sponsored rather than a banner that happens to be pinned.
export const ProgressStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const progress = useScrollProgress();

  return (
    <div className={classNames(dockBase, 'h-10 border-t-0')}>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-border-subtlest-tertiary"
      >
        <span
          className="block h-full bg-accent-cabbage-default transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </span>
      <PrimaryLockup primary={primary} />
      <Divider />
      <PartnerRow partners={partners} />
    </div>
  );
};

// --- 7. Broadcast credits -------------------------------------
// One partner at a time, crossfading — the way closing credits or
// a lower third actually behave. Twelve logos at once is a wall;
// one logo at a time is a mention, and reads far more premium.
export const CreditsStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const rotated = useShuffledSponsors(partners);
  const index = useRotatingIndex(rotated.length, 4000);
  const current = rotated[index];

  return (
    <div className={classNames(dockBase, 'h-10')}>
      <PrimaryLockup primary={primary} />
      <Divider />
      <Label>with</Label>
      <span className="flex min-w-0 items-center text-text-secondary">
        {current && (
          <SponsorLogo
            height={PARTNER_CAP}
            key={current.name}
            sponsor={current}
          />
        )}
      </span>
      <span className="ml-auto shrink-0 text-text-quaternary typo-caption2">
        {index + 1} / {rotated.length}
      </span>
    </div>
  );
};

// --- 8. Colophon ----------------------------------------------
// No panel, no border, no ground: the marks sit straight on the
// page at low contrast, the way a colophon or a print credit
// does. The least ad-like option available, and the easiest to
// miss entirely.
export const ColophonStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className="via-background-default/90 opacity-60 sticky bottom-0 z-3 flex w-full items-center gap-5 bg-gradient-to-t from-background-default to-transparent px-4 pb-2 pt-6 transition-opacity duration-200 hover:opacity-100 laptop:px-10">
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 9. Idle reveal -------------------------------------------
// The inverse of retracting: minimal while anything is happening,
// full when the reader stops. Sponsors get the pause, the reader
// gets the motion.
export const IdleRevealStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const idle = useIdle(1200);

  return (
    <div
      className={classNames(
        dockBase,
        'transition-[height] duration-300 ease-out',
        idle ? 'h-10' : 'h-6',
      )}
    >
      <PrimaryLockup primary={primary} />
      {idle && (
        <>
          <Divider />
          <PartnerRow partners={partners} />
        </>
      )}
    </div>
  );
};

// --- 10. Browser seam -----------------------------------------
// Styled as a continuation of the browser's own bottom edge
// rather than the page's: darker than the feed, inset shadow, no
// top border. On a new tab the effect is that the window is
// slightly taller than the page, and the strip is part of the
// frame.
export const SeamStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div
    className={classNames(
      'sticky bottom-0 z-3 flex h-10 w-full items-center gap-5 bg-raw-pepper-90 px-4 laptop:px-10',
    )}
    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
  >
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

export const BOTTOM_VARIANTS: {
  id: string;
  name: string;
  family: string;
  note: string;
  Strip: (props: VariantProps) => ReactElement;
}[] = [
  {
    id: 'retract',
    name: 'Retract on read',
    family: 'Get out of the way',
    note: 'leaves on scroll down, returns on scroll up — the pattern browsers use for their own chrome',
    Strip: RetractStrip,
  },
  {
    id: 'condense',
    name: 'Condense on read',
    family: 'Get out of the way',
    note: 'the wall collapses to a count while moving; the paid mark never leaves',
    Strip: CondenseStrip,
  },
  {
    id: 'hairline',
    name: 'Hairline peek',
    family: 'Get out of the way',
    note: '6px seam at rest, opens on approach — cheapest in feed, dearest in impressions',
    Strip: HairlineStrip,
  },
  {
    id: 'status',
    name: 'Status bar',
    family: 'Become chrome',
    note: 'dressed as an editor status bar; developers read this shape as tooling',
    Strip: StatusBarStrip,
  },
  {
    id: 'shortcuts',
    name: 'Shortcut bar',
    family: 'Become chrome',
    note: 'carries the app’s keyboard hints, so the row is useful before it is sold',
    Strip: ShortcutBarStrip,
  },
  {
    id: 'progress',
    name: 'Progress rail',
    family: 'Do a job',
    note: 'its top edge is the feed’s scroll progress — chrome that happens to be sponsored',
    Strip: ProgressStrip,
  },
  {
    id: 'credits',
    name: 'Broadcast credits',
    family: 'Earn it by restraint',
    note: 'one partner at a time, crossfading — a mention rather than a wall',
    Strip: CreditsStrip,
  },
  {
    id: 'colophon',
    name: 'Colophon',
    family: 'Earn it by restraint',
    note: 'no panel at all: low-contrast marks on the page, brightening on hover',
    Strip: ColophonStrip,
  },
  {
    id: 'idle',
    name: 'Idle reveal',
    family: 'Get out of the way',
    note: 'minimal while anything moves, full when the reader stops',
    Strip: IdleRevealStrip,
  },
  {
    id: 'seam',
    name: 'Browser seam',
    family: 'Become chrome',
    note: 'reads as the window’s bottom edge rather than the page’s',
    Strip: SeamStrip,
  },
];
