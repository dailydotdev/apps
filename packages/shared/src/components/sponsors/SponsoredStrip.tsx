import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

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
   * the `logo` image; `logo` is still used for the silhouette.
   */
  Artwork?: () => ReactElement;
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
const PARTNER_CAP = 16;

/**
 * Cap heights are sized to the fixed 48px rail: at PARTNER_CAP the
 * tallest optical result is ~22px, so the marks can grow inside the
 * bar without the bar growing. Raising these past ~18 would start
 * crowding the rail's own padding.
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

  if (!monochrome && sponsor.Artwork) {
    const { Artwork } = sponsor;

    return (
      <span className={classNames('block', className)} style={style}>
        <Artwork />
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

const Label = ({
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
const PrimaryLockup = ({
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
const PartnerRow = ({
  monochrome,
  partners,
}: Pick<SponsoredStripProps, 'partners' | 'monochrome'>): ReactElement => (
  <div
    className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden pr-12"
    style={{
      maskImage:
        'linear-gradient(to right, black calc(100% - 3rem), transparent)',
      WebkitMaskImage:
        'linear-gradient(to right, black calc(100% - 3rem), transparent)',
    }}
  >
    {partners.map((sponsor) => (
      <SponsorSlot
        height={PARTNER_CAP}
        key={sponsor.name}
        monochrome={monochrome}
        sponsor={sponsor}
      />
    ))}
  </div>
);

const Divider = (): ReactElement => (
  <span className="h-5 w-px shrink-0 bg-border-subtlest-tertiary" aria-hidden />
);

// ---------------------------------------------------------------
// A. Pinned rail — the closest translation of the reference.
// Sits on the bottom edge of the viewport for the whole session,
// translucent so cards read through it as they scroll under.
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
      'fixed inset-x-0 bottom-0 z-3 flex h-12 items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default px-4 laptop:px-6',
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
}: SponsoredStripProps): ReactElement => (
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
      {partners.map((sponsor) => (
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
}: SponsoredStripProps): ReactElement => (
  <section
    className={classNames(
      'flex h-full flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5',
      className,
    )}
  >
    <PrimaryLockup onSponsorClick={onSponsorClick} primary={primary} vertical />
    <span
      className="my-4 h-px w-full bg-border-subtlest-tertiary"
      aria-hidden
    />
    <Label className="mb-3">Also backing daily.dev</Label>
    <div className="grid flex-1 grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3">
      {partners.map((sponsor) => (
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
}: SponsoredStripProps): ReactElement => (
  <aside
    className={classNames(
      'flex w-60 shrink-0 flex-col rounded-16 border border-border-subtlest-tertiary p-4',
      className,
    )}
  >
    <PrimaryLockup onSponsorClick={onSponsorClick} primary={primary} vertical />
    <span
      className="my-4 h-px w-full bg-border-subtlest-tertiary"
      aria-hidden
    />
    <div className="grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3">
      {partners.map((sponsor) => (
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
