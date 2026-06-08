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

// Example sponsor logos for the campaign cover. They sit directly on the dark
// cover (no chip). Every logo is rendered as a clean white silhouette (see the
// inline filter on the <img> below) so it stays legible regardless of the
// brand's source colors. Tiers add a small marker + size bump so gold/silver
// read as more prominent than regular sponsors. These mirror the dev brands
// daily.dev partners with (see business.daily.dev). Swap for the confirmed
// sponsor list at launch.
const sponsors: SponsorWallLogo[] = [
  {
    name: 'Vercel',
    logoUrl: 'https://svgl.app/library/vercel_wordmark_dark.svg',
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
    logoUrl: 'https://svgl.app/library/github_wordmark_dark.svg',
    url: 'https://github.com',
    tier: 'silver',
  },
  {
    name: 'Supabase',
    logoUrl: 'https://svgl.app/library/supabase_wordmark_dark.svg',
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

interface TierGroupConfig {
  key: 'gold' | 'silver' | 'regular';
  label: string | null;
  lineClass: string;
  labelClass: string;
  imgClass: string;
}

// Gold is brightest and largest, silver a notch down, bronze smallest and
// dimmer. Every tier carries a marker (a short rounded bar + label) so the
// hierarchy reads at a glance.
const tierConfigs: TierGroupConfig[] = [
  {
    key: 'gold',
    label: 'Gold',
    lineClass: 'bg-accent-cheese-default',
    labelClass: 'text-accent-cheese-default',
    imgClass: 'h-8 tablet:h-10',
  },
  {
    key: 'silver',
    label: 'Silver',
    lineClass: 'bg-text-tertiary',
    labelClass: 'text-text-secondary',
    imgClass: 'h-5 tablet:h-6',
  },
  {
    key: 'regular',
    label: 'Bronze',
    lineClass: 'bg-accent-burger-default',
    labelClass: 'text-accent-burger-default',
    imgClass: 'h-4 opacity-90 tablet:h-5',
  },
];

const tierGroups = tierConfigs
  .map((config) => ({
    ...config,
    items: sponsors.filter(
      (sponsor) => (sponsor.tier ?? 'regular') === config.key,
    ),
  }))
  .filter((group) => group.items.length > 0);

export const GivebackSponsorTiers = (): ReactElement => (
  <FlexCol className="w-full gap-5">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="uppercase tracking-wider"
    >
      Sponsored by
    </Typography>

    <div className="flex w-full flex-wrap items-stretch gap-x-9 gap-y-4">
      {tierGroups.map((group) => (
        <FlexRow
          key={group.key}
          className="flex-wrap items-center gap-x-6 gap-y-2"
        >
          {group.label && (
            <FlexRow className="shrink-0 items-center gap-2 self-stretch">
              <span
                aria-hidden
                className={classNames(
                  'w-0.5 self-stretch rounded-sm',
                  group.lineClass,
                )}
              />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                bold
                className={classNames(
                  'uppercase tracking-wider',
                  group.labelClass,
                )}
              >
                {group.label}
              </Typography>
            </FlexRow>
          )}
          {group.items.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={sponsor.name}
              className="group flex shrink-0 items-center justify-center transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              <img
                src={sponsor.logoUrl}
                alt={`${sponsor.name} logo`}
                loading="lazy"
                style={{ filter: 'brightness(0) invert(1)' }}
                className={classNames(
                  'w-auto max-w-[120px] object-contain transition-opacity duration-200 group-hover:opacity-100',
                  group.imgClass,
                )}
              />
            </a>
          ))}
        </FlexRow>
      ))}
    </div>
  </FlexCol>
);
