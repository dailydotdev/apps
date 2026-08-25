import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { pagePaddings } from '../utilities/common';

// =============================================================
// Sponsored strip — a TBPN-style "presented by" lockup plus a
// row of partner logos, sized for the extension new tab.
//
// The reference format (a live show's lower third) can afford a
// permanently pinned bar because there is no content to cover.
// A feed cannot: every pixel the strip holds is a pixel of post.
// So each concept below trades visibility against how much feed
// it displaces, and they are meant to be judged side by side in
// `SponsoredStrip.stories.tsx` rather than shipped all at once.
// =============================================================

/**
 * What an inline lockup is told when it renders. `monochrome` is the
 * wall treatment: draw in `currentColor` and punch any knockout out
 * of the shape, because the wall masks by alpha and painted detail
 * comes through solid.
 */
export type LockupProps = { monochrome?: boolean };

export type Sponsor = {
  name: string;
  /**
   * Absolute URL of a horizontal SVG wordmark. Optional only for a
   * sponsor supplied as inline `Artwork`; the silhouette treatment
   * needs the file, so every partner must have one.
   */
  logo?: string;
  /**
   * Intrinsic width / height. Logo files vary from square marks to
   * 5:1 wordmarks, so a strip that fixes only the height needs the
   * ratio to reserve the right width and keep cap heights optical.
   */
  ratio: number;
  /**
   * Click-through destination. Only the lead sponsor gets one — the
   * partner wall is a credit, not a row of links.
   */
  href?: string;
  /**
   * Optional inline artwork, for a lockup that cannot be one flat
   * file — typically a brand symbol that must hold its colour beside
   * a wordmark that has to flip with the theme. Rendered in place of
   * the `logo` image in both treatments: the lockup is told which one
   * it is drawing, because a silhouette needs its knockouts punched
   * out rather than painted.
   */
  Artwork?: (props: LockupProps) => ReactElement;
};

export type SponsoredStripProps = {
  /** The single paid-out slot, given the "Presented by" lockup. */
  primary: Sponsor;
  /** Secondary logo wall, ~10 slots. */
  partners: Sponsor[];
  /**
   * Render the *partner* logos as single-colour silhouettes that
   * inherit the surrounding text colour. Full colour is available for
   * comparison but fails the theme test — see the stories. The
   * presenting sponsor always keeps its brand colour.
   */
  monochrome?: boolean;
  onSponsorClick?: (sponsor: Sponsor) => void;
  className?: string;
};

// The lead mark reads a step above the wall, not a tier above it: at
// these caps it lands ~20% taller than the median partner wordmark
// (18px against 15px), which is enough to rank it without turning the
// rail into a billboard.
const PRIMARY_CAP = 23;
export const PARTNER_CAP = 16;

/**
 * Cap heights are sized to the 40px rail: at PARTNER_CAP the tallest
 * optical result is ~22px, leaving 9px of air above and below, which
 * is what sets the floor on the bar's height. Raising PARTNER_CAP
 * past ~18 would crowd it.
 *
 * Logo files run from square marks (GitLab, 1:1) to long lockups
 * (LaunchDarkly, 6.4:1). Sizing them all to one cap height makes the
 * square ones illegible and the long ones dominate the row, so the
 * height is normalised by area instead — every mark gets roughly the
 * same ink — and clamped so nothing blows out the strip.
 */
const REFERENCE_RATIO = 3.5;

const opticalHeight = (ratio: number, cap: number): number =>
  Math.round(
    Math.min(
      cap * 1.6,
      Math.max(cap * 0.8, cap * Math.sqrt(REFERENCE_RATIO / ratio)),
    ),
  );

/** Fisher-Yates. Callers own when this runs; it is not pure. */
const shuffle = <T,>(items: T[]): T[] => {
  const out = [...items];

  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
};

/**
 * A fresh order of the partner wall per page load, so no advertiser
 * is permanently first and — once the row starts trimming to fit —
 * none is permanently the one that gets dropped.
 *
 * The shuffle deliberately waits for mount. Randomising during render
 * would produce different markup on the server and the client, which
 * React would flag as a hydration mismatch; this way the server order
 * is what hydrates and the rotation lands immediately after.
 */
export const useShuffledSponsors = (partners: Sponsor[]): Sponsor[] => {
  const [order, setOrder] = useState(partners);

  useEffect(() => {
    setOrder(shuffle(partners));
  }, [partners]);

  return order;
};

/** Covers the layout's 300ms padding transition, plus a little. */
const LAYOUT_SETTLE_MS = 400;

/**
 * Narrower than any single mark, so a row this size cannot have been
 * laid out yet. Treated as "not measured" rather than "nothing fits":
 * a transient narrow reading must not be able to strand the wall
 * empty, because nothing else is guaranteed to come along and correct
 * it — ResizeObserver is the only other corrector, and an environment
 * that throttles it would leave the strip permanently blank.
 */
const MIN_MEASURABLE_WIDTH = 80;

/** Rendered width of a mark at a given cap height. */
const markWidth = (sponsor: Sponsor, cap: number): number =>
  opticalHeight(sponsor.ratio, cap) * sponsor.ratio;

/**
 * How many marks fit the measured row, in order, at `gap` apart.
 * The marks' widths are known from their ratios, so this needs no
 * DOM measurement beyond the row itself.
 */
const countThatFit = (
  partners: Sponsor[],
  available: number,
  cap: number,
  gap: number,
): number => {
  let used = 0;

  for (let i = 0; i < partners.length; i += 1) {
    const next = used + (i > 0 ? gap : 0) + markWidth(partners[i], cap);

    if (next > available) {
      return i;
    }

    used = next;
  }

  return partners.length;
};

/**
 * Trims the wall to what the row can actually hold, rather than
 * letting it overflow and clipping the remainder. Twelve marks at the
 * widest, fewer as the window narrows — an advertiser is either shown
 * whole or not at all, never as a half logo under a fade.
 */
const useFittedSponsors = (
  partners: Sponsor[],
  cap: number,
  gap: number,
): { ref: React.RefObject<HTMLDivElement>; fitted: Sponsor[] } => {
  const ref = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return undefined;
    }

    const measure = () => setAvailable(el.getBoundingClientRect().width);

    // Measure directly rather than waiting on ResizeObserver's first
    // callback: the row has to be trimmed on the initial paint, and
    // not every environment delivers that callback.
    measure();

    // The layout animates its padding when the sidebar opens or
    // closes, so the first measurement can be of a width that is on
    // its way somewhere else. Re-measure once the transition is over.
    const settle = window.setTimeout(measure, LAYOUT_SETTLE_MS);

    if (typeof ResizeObserver === 'undefined') {
      // Window resizes are the common case; without RO the row still
      // reflows on those, it just misses element-only changes such as
      // the sidebar expanding.
      window.addEventListener('resize', measure);

      return () => {
        window.clearTimeout(settle);
        window.removeEventListener('resize', measure);
      };
    }

    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );

    observer.observe(el);

    return () => {
      window.clearTimeout(settle);
      observer.disconnect();
    };
  }, []);

  const fitted = useMemo(() => {
    // Render the full wall until a real width arrives; the row clips,
    // so a frame of overflow is invisible and the server markup stays
    // complete.
    if (available === null || available < MIN_MEASURABLE_WIDTH) {
      return partners;
    }

    // Never fewer than one: a clipped mark is a worse look than a
    // tidy row, but an empty sponsor wall is a broken one.
    return partners.slice(
      0,
      Math.max(1, countThatFit(partners, available, cap, gap)),
    );
  }, [partners, available, cap, gap]);

  return { ref, fitted };
};

type SponsorLogoProps = {
  sponsor: Sponsor;
  /** Cap height in px; width follows from the intrinsic ratio. */
  height: number;
  monochrome?: boolean;
  className?: string;
};

/**
 * Not lazy-loaded: eleven inline SVGs weigh nothing, and deferring
 * them would let the paid slot be the last thing on the page to
 * appear — the masked partner marks are CSS and never defer at all,
 * so a lazy <img> only buys an inconsistent strip.
 *
 * Painting a currentColor block through the logo as a mask, rather
 * than filtering an <img>, keeps a single
 * implementation working in both themes: the mark simply takes the
 * text colour of whatever it sits in. The cost is that knockouts
 * (Notion's white "N", Postman's white glyph) fill in, so a real
 * rollout wants monochrome assets from the advertiser.
 */
export const SponsorLogo = ({
  className,
  height,
  monochrome = true,
  sponsor,
}: SponsorLogoProps): ReactElement => {
  const optical = opticalHeight(sponsor.ratio, height);
  const style: CSSProperties = {
    height: optical,
    width: optical * sponsor.ratio,
  };

  if (sponsor.Artwork) {
    const { Artwork } = sponsor;

    return (
      <span className={classNames('block', className)} style={style}>
        <Artwork monochrome={monochrome} />
      </span>
    );
  }

  if (!monochrome) {
    return (
      <img
        alt={sponsor.name}
        className={classNames('object-contain', className)}
        src={sponsor.logo}
        style={style}
      />
    );
  }

  return (
    <span
      aria-label={sponsor.name}
      className={classNames('block', className)}
      role="img"
      style={{
        ...style,
        // Tailwind's `bg-current` is not in this palette — the design
        // tokens replace the default colours — so paint it directly.
        backgroundColor: 'currentColor',
        maskImage: `url(${sponsor.logo})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskImage: `url(${sponsor.logo})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
      }}
    />
  );
};

type SponsorSlotProps = {
  sponsor: Sponsor;
  height: number;
  monochrome?: boolean;
  className?: string;
};

/**
 * A partner mark: shown, not clickable. Ten inert logos beside one
 * live link keep the click target unambiguous, and spare the wall a
 * row of hover states competing with the posts around it.
 */
const SponsorSlot = ({
  className,
  height,
  monochrome,
  sponsor,
}: SponsorSlotProps): ReactElement => (
  <span className={classNames('block shrink-0 text-text-secondary', className)}>
    <SponsorLogo height={height} monochrome={monochrome} sponsor={sponsor} />
  </span>
);

export const Label = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'whitespace-nowrap text-text-quaternary typo-caption2',
      className,
    )}
  >
    {children}
  </span>
);

/**
 * "Made possible by" + the primary mark. The paid slot is the one place
 * that keeps its brand colour — it is what the advertiser is buying,
 * and one coloured mark against a neutral wall is the hierarchy. It
 * only works with a logo whose inks survive both themes: anything
 * near-black or near-white disappears on one of them. See the
 * LogoTreatment story for the check.
 */
export const PrimaryLockup = ({
  onSponsorClick,
  primary,
  vertical = false,
}: Pick<SponsoredStripProps, 'primary' | 'onSponsorClick'> & {
  vertical?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex shrink-0 gap-x-2.5 gap-y-1.5',
      vertical ? 'flex-col items-start' : 'items-center',
    )}
  >
    <Label>Made possible by</Label>
    {primary.href ? (
      <a
        aria-label={`${primary.name} (lead sponsor)`}
        className="inline-flex shrink-0 origin-left text-text-primary transition-transform duration-200 ease-in-out hover:scale-105"
        href={primary.href}
        onClick={() => onSponsorClick?.(primary)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SponsorLogo
          height={PRIMARY_CAP}
          monochrome={false}
          sponsor={primary}
        />
      </a>
    ) : (
      <span className="inline-flex shrink-0 text-text-primary">
        <SponsorLogo
          height={PRIMARY_CAP}
          monochrome={false}
          sponsor={primary}
        />
      </span>
    )}
  </div>
);

/**
 * Partner logos spread across the full run, the way the reference
 * bar distributes its wall. `gap-4` is the floor and `justify-between`
 * hands out whatever is left, so the row breathes on a wide new tab
 * and tightens before it clips. The `pr-12` keeps the last mark clear
 * of the fade when everything fits; only genuine overflow runs into
 * it. Clipped, not scrolled or animated: a marquee in the periphery
 * of a reading surface is exactly the distraction we are avoiding.
 */
const PARTNER_GAP = 16;

export const PartnerRow = ({
  monochrome,
  partners,
}: Pick<SponsoredStripProps, 'partners' | 'monochrome'>): ReactElement => {
  const rotated = useShuffledSponsors(partners);
  const { ref, fitted } = useFittedSponsors(rotated, PARTNER_CAP, PARTNER_GAP);

  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden"
      ref={ref}
    >
      {fitted.map((sponsor) => (
        <SponsorSlot
          height={PARTNER_CAP}
          key={sponsor.name}
          monochrome={monochrome}
          sponsor={sponsor}
        />
      ))}
    </div>
  );
};

export const Divider = (): ReactElement => (
  <span className="h-5 w-px shrink-0 bg-border-subtlest-tertiary" aria-hidden />
);

// ---------------------------------------------------------------
// A. Pinned rail — the closest translation of the reference.
// Held near the bottom edge of the viewport for the whole session.
//
// The ground stays opaque — `surface-float` is a translucent token,
// and cards scrolling through the marks costs more legibility than
// it buys.
//
// It sits flush on the edge. An earlier version floated 28px clear to
// dodge the browser's link-status bubble, but a detached island reads
// as a widget bolted onto the product rather than part of it. The
// bubble is handled by what sits underneath instead — see
// SponsorDock, where a value rail takes the hit.
//
// `sticky`, not `fixed`. A fixed bar is positioned against the
// viewport, so it runs the full width of the window and slides under
// the left sidebar. Sticky keeps the bar in flow inside the layout's
// padded main, which is where the sidebar offset already lives — so
// the bar spans the feed and nothing else, and follows that offset
// across layout variants and sidebar states without having to know
// what either is. The horizontal inset is the app's own
// `pagePaddings`, so the strip lines up with every other page
// surface rather than inventing its own number.
// ---------------------------------------------------------------
export const SponsorRailPinned = ({
  className,
  monochrome = true,
  onSponsorClick,
  partners,
  primary,
}: SponsoredStripProps): ReactElement => (
  <div
    className={classNames(
      'sticky bottom-0 z-3 flex h-10 w-full items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default',
      pagePaddings,
      className,
    )}
  >
    <PrimaryLockup onSponsorClick={onSponsorClick} primary={primary} />
    <Divider />
    <PartnerRow monochrome={monochrome} partners={partners} />
  </div>
);

// ---------------------------------------------------------------
// B. Inline rail — same bar, but in flow above the first card row.
// Costs one scroll of feed height and then leaves.
// ---------------------------------------------------------------
export const SponsorRailInline = ({
  className,
  monochrome = true,
  onSponsorClick,
  partners,
  primary,
}: SponsoredStripProps): ReactElement => (
  <div
    className={classNames(
      'mb-4 flex h-11 items-center gap-5 border-y border-border-subtlest-tertiary',
      className,
    )}
  >
    <PrimaryLockup onSponsorClick={onSponsorClick} primary={primary} />
    <Divider />
    <PartnerRow monochrome={monochrome} partners={partners} />
  </div>
);

// ---------------------------------------------------------------
// C. Feed band — a full-width row between card rows. Reads as part
// of the feed, wraps instead of clipping, scrolls away like a post.
// ---------------------------------------------------------------
export const SponsorFeedBand = ({
  className,
  monochrome = true,
  onSponsorClick,
  partners,
  primary,
}: SponsoredStripProps): ReactElement => {
  const rotated = useShuffledSponsors(partners);

  return (
    <section
      className={classNames(
        'col-span-full flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-5 py-4 tablet:flex-row tablet:items-center tablet:gap-6',
        className,
      )}
    >
      <PrimaryLockup onSponsorClick={onSponsorClick} primary={primary} />
      <div className="hidden tablet:block">
        <Divider />
      </div>
      {/*
       * A grid rather than a wrapped flex row: fixed column counts break
       * cleanly into rows, where a wrapped `justify-between` flex would
       * strand the last one. The columns are `auto`, not equal fractions
       * — the marks differ in width by 2x, so equal cells make the wide
       * ones overlap their neighbours — and the grid's own
       * `justify-between` hands the leftover space to the gaps.
       */}
      <div className="grid flex-1 grid-cols-[repeat(3,auto)] items-center justify-between gap-x-4 gap-y-3 tablet:grid-cols-[repeat(4,auto)] laptop:grid-cols-[repeat(6,auto)]">
        {rotated.map((sponsor) => (
          <SponsorSlot
            height={PARTNER_CAP}
            key={sponsor.name}
            monochrome={monochrome}
            sponsor={sponsor}
          />
        ))}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// D. Card slot — takes one post's place in the grid. Maximum
// native feel, and the only concept whose cost is a whole card.
// ---------------------------------------------------------------
export const SponsorFeedCard = ({
  className,
  monochrome = true,
  onSponsorClick,
  partners,
  primary,
}: SponsoredStripProps): ReactElement => {
  const rotated = useShuffledSponsors(partners);

  return (
    <section
      className={classNames(
        'flex h-full flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5',
        className,
      )}
    >
      <PrimaryLockup
        onSponsorClick={onSponsorClick}
        primary={primary}
        vertical
      />
      <span
        className="my-4 h-px w-full bg-border-subtlest-tertiary"
        aria-hidden
      />
      <Label className="mb-3">Also backing daily.dev</Label>
      <div className="grid flex-1 grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3">
        {rotated.map((sponsor) => (
          <SponsorSlot
            height={PARTNER_CAP}
            key={sponsor.name}
            monochrome={monochrome}
            sponsor={sponsor}
          />
        ))}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------
// E. Side rail — zero feed displacement, lowest attention. Only
// viable on laptop and up, where the rail exists at all.
// ---------------------------------------------------------------
export const SponsorSideRail = ({
  className,
  monochrome = true,
  onSponsorClick,
  partners,
  primary,
}: SponsoredStripProps): ReactElement => {
  const rotated = useShuffledSponsors(partners);

  return (
    <aside
      className={classNames(
        'flex w-60 shrink-0 flex-col rounded-16 border border-border-subtlest-tertiary p-4',
        className,
      )}
    >
      <PrimaryLockup
        onSponsorClick={onSponsorClick}
        primary={primary}
        vertical
      />
      <span
        className="my-4 h-px w-full bg-border-subtlest-tertiary"
        aria-hidden
      />
      <div className="grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3">
        {rotated.map((sponsor) => (
          <SponsorSlot
            height={PARTNER_CAP}
            key={sponsor.name}
            monochrome={monochrome}
            sponsor={sponsor}
          />
        ))}
      </div>
    </aside>
  );
};
