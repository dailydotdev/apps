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
  /** Filled medal chip styling, mirroring the leaderboard podium palette. */
  markerClass: string;
  /** Logo height per tier (kept at ~30% steps). */
  imgClass: string;
  /** Brightness step so a higher tier's logos visibly out-shout a lower one. */
  logoToneClass: string;
}

// Three reinforcing signals separate the tiers without adding any height:
// (1) a filled medal chip in the podium palette (gold cheese / silver neutral /
// bronze bacon, same as the leaderboard), (2) a ~30% logo-size step
// (56 → 40 → 28px on tablet), and (3) a brightness step so gold logos read at
// full strength while silver and bronze recede. Hovering any logo brightens it
// back to full.
const tierConfigs: TierGroupConfig[] = [
  {
    key: 'gold',
    label: 'Gold',
    markerClass:
      'bg-accent-cheese-default text-black shadow-[0_0_12px_rgba(255,199,0,0.45)]',
    imgClass: 'h-12 tablet:h-14',
    logoToneClass: '',
  },
  {
    key: 'silver',
    label: 'Silver',
    markerClass: 'bg-surface-secondary text-text-primary',
    imgClass: 'h-8 tablet:h-10',
    logoToneClass: 'opacity-75',
  },
  {
    key: 'regular',
    label: 'Bronze',
    markerClass: 'bg-accent-bacon-default text-white',
    imgClass: 'h-6 tablet:h-7',
    logoToneClass: 'opacity-50',
  },
];

type TierGroup = TierGroupConfig & { items: SponsorWallLogo[] };

const tierGroups: TierGroup[] = tierConfigs
  .map((config) => ({
    ...config,
    items: sponsors.filter(
      (sponsor) => (sponsor.tier ?? 'regular') === config.key,
    ),
  }))
  .filter((group) => group.items.length > 0);

// Gold is the headline tier, so it gets its own row above; silver and bronze
// share a second row beneath it.
const goldGroup = tierGroups.find((group) => group.key === 'gold');
const lowerGroups = tierGroups.filter((group) => group.key !== 'gold');

const SponsorTierGroup = ({ group }: { group: TierGroup }): ReactElement => (
  <FlexRow className="flex-wrap items-center gap-x-6 gap-y-2">
    {group.label && (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption2}
        bold
        className={classNames(
          'shrink-0 rounded-8 px-2 py-0.5 uppercase tracking-wider',
          group.markerClass,
        )}
      >
        {group.label}
      </Typography>
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
            group.logoToneClass,
          )}
        />
      </a>
    ))}
  </FlexRow>
);

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

    <FlexCol className="w-full gap-8">
      {goldGroup && <SponsorTierGroup group={goldGroup} />}
      {lowerGroups.length > 0 && (
        <div className="flex w-full flex-wrap items-stretch gap-x-9 gap-y-4">
          {lowerGroups.map((group) => (
            <SponsorTierGroup key={group.key} group={group} />
          ))}
        </div>
      )}
    </FlexCol>
  </FlexCol>
);
