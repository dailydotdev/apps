import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

type SponsorCoverTier = 'gold' | 'silver';

interface SponsorWallLogo {
  name: string;
  /** Brand logo SVG (open logo library). */
  logoUrl: string;
  url: string;
  /** Higher tiers get a larger size; untiered sponsors fall back to bronze. */
  tier?: SponsorCoverTier;
}

// Example sponsor logos for the campaign cover. Each logo keeps its real brand
// colors and sits on a white "medal card" so it stays legible on the dark
// cover regardless of its source colors. Tiers are framed in their medal color
// (gold / silver / bronze) and stepped in size, so the hierarchy is obvious and
// the wall is colorful. URLs use each brand's light-background wordmark/logo so
// the colors render correctly. These mirror the dev brands daily.dev partners
// with (see business.daily.dev). Swap for the confirmed sponsor list at launch.
const sponsors: SponsorWallLogo[] = [
  {
    name: 'Vercel',
    logoUrl: 'https://svgl.app/library/vercel_wordmark.svg',
    url: 'https://vercel.com',
    tier: 'gold',
  },
  {
    name: 'Stripe',
    logoUrl: 'https://svgl.app/library/stripe_wordmark.svg',
    url: 'https://stripe.com',
    tier: 'gold',
  },
  {
    name: 'GitHub',
    logoUrl: 'https://svgl.app/library/github_wordmark_light.svg',
    url: 'https://github.com',
    tier: 'silver',
  },
  {
    name: 'Supabase',
    logoUrl: 'https://svgl.app/library/supabase_wordmark_light.svg',
    url: 'https://supabase.com',
    tier: 'silver',
  },
  {
    name: 'Sentry',
    logoUrl: 'https://svgl.app/library/sentry.svg',
    url: 'https://sentry.io',
    tier: 'silver',
  },
  {
    name: 'Datadog',
    logoUrl: 'https://svgl.app/library/datadog.svg',
    url: 'https://datadoghq.com',
  },
  {
    name: 'Algolia',
    logoUrl: 'https://svgl.app/library/algolia.svg',
    url: 'https://algolia.com',
  },
  {
    name: 'Prisma',
    logoUrl: 'https://svgl.app/library/prisma.svg',
    url: 'https://prisma.io',
  },
];

// An airy, editorial "sponsor wall" that matches the page's soft, pastel tone:
// brand-colored logos rest on gently floating white chips, tiers are introduced
// with eyebrow-style labels and parted by soft gradient hairlines (no boxes,
// rings, or accent bars). Gold sits first, largest, and inside a warm glow, so
// the gold > silver > bronze ranking is obvious without any harsh chrome.
const goldSponsors = sponsors.filter((sponsor) => sponsor.tier === 'gold');
const silverSponsors = sponsors.filter((sponsor) => sponsor.tier === 'silver');
const bronzeSponsors = sponsors.filter((sponsor) => !sponsor.tier);

interface SponsorTier {
  key: string;
  name: string;
  /** Tier marker dot + label color (soft, on-brand accent tints). */
  dotClass: string;
  labelClass: string;
  /** Chip padding + logo height, stepping down gold → silver → bronze. */
  chipClass: string;
  imgClass: string;
  sponsors: SponsorWallLogo[];
}

const sponsorTiers: SponsorTier[] = [
  {
    key: 'gold',
    name: 'Gold',
    dotClass: 'bg-accent-cheese-default',
    labelClass: 'text-accent-cheese-default',
    chipClass: 'px-4 py-2.5',
    imgClass: 'h-8 tablet:h-9',
    sponsors: goldSponsors,
  },
  {
    key: 'silver',
    name: 'Silver',
    dotClass: 'bg-text-quaternary',
    labelClass: 'text-text-secondary',
    chipClass: 'px-3.5 py-2',
    imgClass: 'h-6 tablet:h-7',
    sponsors: silverSponsors,
  },
  {
    key: 'bronze',
    name: 'Bronze',
    dotClass: 'bg-accent-bacon-default',
    labelClass: 'text-accent-bacon-default',
    chipClass: 'px-3 py-1.5',
    imgClass: 'h-5 tablet:h-6',
    sponsors: bronzeSponsors,
  },
];

const SponsorChip = ({
  sponsor,
  chipClass,
  imgClass,
}: {
  sponsor: SponsorWallLogo;
  chipClass: string;
  imgClass: string;
}): ReactElement => (
  <a
    href={sponsor.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={sponsor.name}
    className={classNames(
      'flex shrink-0 items-center rounded-12 bg-white shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none',
      chipClass,
    )}
  >
    <img
      src={sponsor.logoUrl}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      className={classNames('w-auto max-w-[130px] object-contain', imgClass)}
    />
  </a>
);

// A tier is shown inline: its dot + name label, then its logo chips. Gold gets
// its own row; silver and bronze share the row beneath it, left-aligned.
const SponsorTierGroup = ({ tier }: { tier: SponsorTier }): ReactElement => (
  <FlexRow className="flex-wrap items-center gap-x-4 gap-y-3">
    <FlexRow className="shrink-0 items-center gap-2">
      <span className={classNames('size-2 rounded-full', tier.dotClass)} />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        bold
        className={classNames('uppercase tracking-wider', tier.labelClass)}
      >
        {tier.name}
      </Typography>
    </FlexRow>
    {tier.sponsors.map((sponsor) => (
      <SponsorChip
        key={sponsor.name}
        sponsor={sponsor}
        chipClass={tier.chipClass}
        imgClass={tier.imgClass}
      />
    ))}
  </FlexRow>
);

export const GivebackSponsorTiers = (): ReactElement => {
  const goldTier = sponsorTiers.find(
    (tier) => tier.key === 'gold' && tier.sponsors.length > 0,
  );
  const lowerTiers = sponsorTiers.filter(
    (tier) => tier.key !== 'gold' && tier.sponsors.length > 0,
  );

  return (
    <section className="relative w-full">
      {/* Soft brand glows, echoing the hero, so the wall feels native to the
          page rather than a hard panel dropped on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-accent-cheese-default/15 absolute -left-16 -top-10 size-56 rounded-full blur-3xl motion-safe:animate-glow-pulse" />
        <div
          className="bg-accent-cabbage-default/12 absolute -right-12 bottom-0 size-52 rounded-full blur-3xl motion-safe:animate-glow-pulse"
          style={{ animationDelay: '1.4s' }}
        />
      </div>

      <FlexCol className="relative gap-6">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Sponsored by
        </Typography>

        <FlexCol className="gap-6">
          {goldTier && (
            <div className="relative">
              {/* Warm halo so the headline tier glows softly above the rest. */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="bg-accent-cheese-default/12 absolute -left-6 -top-4 h-28 w-72 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <SponsorTierGroup tier={goldTier} />
              </div>
            </div>
          )}

          {lowerTiers.length > 0 && (
            <>
              {goldTier && (
                <div
                  aria-hidden
                  className="h-px w-full bg-gradient-to-r from-transparent via-border-subtlest-tertiary to-transparent"
                />
              )}
              <FlexRow className="flex-wrap items-center gap-x-10 gap-y-4">
                {lowerTiers.map((tier) => (
                  <SponsorTierGroup key={tier.key} tier={tier} />
                ))}
              </FlexRow>
            </>
          )}
        </FlexCol>
      </FlexCol>
    </section>
  );
};
