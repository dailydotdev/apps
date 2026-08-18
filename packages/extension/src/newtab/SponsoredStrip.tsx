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
  /** Absolute URL of a horizontal SVG wordmark. */
  logo: string;
  /**
   * Intrinsic width / height. Logo files vary from square marks to
   * 5:1 wordmarks, so a strip that fixes only the height needs the
   * ratio to reserve the right width and keep cap heights optical.
   */
  ratio: number;
  /** Click-through destination. Storybook passes none. */
  href?: string;
};

export type SponsoredStripProps = {
  /** The single paid-out slot, given the "Presented by" lockup. */
  primary: Sponsor;
  /** Secondary logo wall, ~10 slots. */
  partners: Sponsor[];
  /**
   * Render logos as single-colour silhouettes that inherit the
   * surrounding text colour. Full colour is available for
   * comparison but fails the theme test — see the stories.
   */
  monochrome?: boolean;
  onSponsorClick?: (sponsor: Sponsor) => void;
  className?: string;
};

const PRIMARY_CAP = 18;
const PARTNER_CAP = 13;

/**
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

  if (!monochrome) {
    return (
      <img
        alt={sponsor.name}
        className={classNames('object-contain', className)}
        loading="lazy"
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
  onSponsorClick?: (sponsor: Sponsor) => void;
  className?: string;
};

/** Every logo is inventory, so every logo is a tracked click target. */
const SponsorSlot = ({
  className,
  height,
  monochrome,
  onSponsorClick,
  sponsor,
}: SponsorSlotProps): ReactElement => (
  <button
    aria-label={`${sponsor.name} (sponsor)`}
    className={classNames(
      'shrink-0 text-text-tertiary transition-colors duration-150 hover:text-text-primary',
      className,
    )}
    onClick={() => onSponsorClick?.(sponsor)}
    type="button"
  >
    <SponsorLogo height={height} monochrome={monochrome} sponsor={sponsor} />
  </button>
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
      'whitespace-nowrap uppercase tracking-wide text-text-quaternary typo-caption2',
      className,
    )}
  >
    {children}
  </span>
);

/** "Presented by" + the primary mark, at full text contrast. */
const PresentedBy = ({
  monochrome,
  onSponsorClick,
  primary,
  vertical = false,
}: Pick<SponsoredStripProps, 'primary' | 'monochrome' | 'onSponsorClick'> & {
  vertical?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex shrink-0 gap-x-2.5 gap-y-1.5',
      vertical ? 'flex-col items-start' : 'items-center',
    )}
  >
    <Label>Presented by</Label>
    <button
      aria-label={`${primary.name} (presenting sponsor)`}
      className="shrink-0 text-text-primary"
      onClick={() => onSponsorClick?.(primary)}
      type="button"
    >
      <SponsorLogo
        height={PRIMARY_CAP}
        monochrome={monochrome}
        sponsor={primary}
      />
    </button>
  </div>
);

/**
 * Partner logos on one line. Overflow is clipped behind a fade
 * rather than scrolled or animated: a marquee in the periphery of
 * a reading surface is exactly the distraction we are avoiding.
 */
const PartnerRow = ({
  monochrome,
  onSponsorClick,
  partners,
}: Pick<
  SponsoredStripProps,
  'partners' | 'monochrome' | 'onSponsorClick'
>): ReactElement => (
  <div
    className="flex min-w-0 flex-1 items-center gap-6 overflow-hidden"
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
        onSponsorClick={onSponsorClick}
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
      'bg-background-default/80 sticky bottom-0 z-3 flex h-12 items-center gap-5 border-t border-border-subtlest-tertiary px-4 backdrop-blur-xl laptop:px-6',
      className,
    )}
  >
    <PresentedBy
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      primary={primary}
    />
    <Divider />
    <PartnerRow
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      partners={partners}
    />
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
    <PresentedBy
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      primary={primary}
    />
    <Divider />
    <PartnerRow
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      partners={partners}
    />
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
    <PresentedBy
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      primary={primary}
    />
    <div className="hidden tablet:block">
      <Divider />
    </div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {partners.map((sponsor) => (
        <SponsorSlot
          height={PARTNER_CAP}
          key={sponsor.name}
          monochrome={monochrome}
          onSponsorClick={onSponsorClick}
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
    <PresentedBy
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      primary={primary}
      vertical
    />
    <span
      className="my-4 h-px w-full bg-border-subtlest-tertiary"
      aria-hidden
    />
    <Label className="mb-3">Also backing daily.dev</Label>
    <div className="grid flex-1 grid-cols-2 items-center gap-x-4 gap-y-3">
      {partners.map((sponsor) => (
        <SponsorSlot
          height={PARTNER_CAP}
          key={sponsor.name}
          monochrome={monochrome}
          onSponsorClick={onSponsorClick}
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
    <PresentedBy
      monochrome={monochrome}
      onSponsorClick={onSponsorClick}
      primary={primary}
      vertical
    />
    <span
      className="my-4 h-px w-full bg-border-subtlest-tertiary"
      aria-hidden
    />
    <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3">
      {partners.map((sponsor) => (
        <SponsorSlot
          height={PARTNER_CAP}
          key={sponsor.name}
          monochrome={monochrome}
          onSponsorClick={onSponsorClick}
          sponsor={sponsor}
        />
      ))}
    </div>
  </aside>
);
