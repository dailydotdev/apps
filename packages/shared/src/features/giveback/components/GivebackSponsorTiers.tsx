import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { MedalBadgeIcon } from '../../../components/icons';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionSponsors } from '../hooks/useContributionSponsors';
import { sponsorTierLabel } from '../utils';
import type { ContributionSponsor } from '../types';
import { ContributionSponsorTier } from '../types';

interface TierStyle {
  // Tint for the tier label that sits beside each row.
  labelClass: string;
  // Chip padding + logo height step down by prestige so gold reads largest.
  chipClass: string;
  logoClass: string;
  // Fallback name size for logo-less sponsors.
  nameType: TypographyType;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    labelClass: 'text-accent-cheese-default',
    chipClass: 'px-4 py-2.5',
    logoClass: 'max-h-8',
    nameType: TypographyType.Callout,
  },
  [ContributionSponsorTier.Silver]: {
    labelClass: 'text-text-secondary',
    chipClass: 'px-3.5 py-2',
    logoClass: 'max-h-6',
    nameType: TypographyType.Footnote,
  },
  [ContributionSponsorTier.Bronze]: {
    labelClass: 'text-accent-burger-default',
    chipClass: 'px-3 py-1.5',
    logoClass: 'max-h-5',
    nameType: TypographyType.Footnote,
  },
};

// Headline tiers first so the wall reads top-down by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A flat, logo-forward sponsor chip: no fill, just a hairline border. The logo
// is forced to a single light tint at rest (so wildly different brand logos read
// as one calm wall on the dark page) and reveals its true colors on hover.
// Logo-less sponsors fall back to their name so the chip is never empty.
const SponsorCard = ({
  sponsor,
}: {
  sponsor: ContributionSponsor;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const [failed, setFailed] = useState(false);
  const showLogo = Boolean(sponsor.logoUrl) && !failed;
  const style = tierStyles[sponsor.tier];

  const onClick = () =>
    logEvent({
      event_name: LogEvent.ClickGivebackSponsor,
      target_id: sponsor.id,
      extra: JSON.stringify({ name: sponsor.name, tier: sponsor.tier }),
    });

  const cardClass = classNames(
    'group inline-flex max-w-full shrink-0 items-center justify-center rounded-10 border border-border-subtlest-tertiary transition-colors duration-200 hover:border-border-subtlest-secondary',
    style.chipClass,
  );

  const body = showLogo ? (
    <img
      src={sponsor.logoUrl ?? undefined}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      className={classNames(
        'opacity-70 w-auto max-w-[140px] object-contain transition duration-200 [filter:brightness(0)_invert(1)] group-hover:opacity-100 group-hover:[filter:none]',
        style.logoClass,
      )}
      onError={() => setFailed(true)}
    />
  ) : (
    <Typography
      tag={TypographyTag.Span}
      type={style.nameType}
      bold
      truncate
      className="max-w-[140px] text-text-secondary transition-colors group-hover:text-text-primary"
    >
      {sponsor.name}
    </Typography>
  );

  if (!sponsor.url) {
    return (
      <span aria-label={sponsor.name} className={cardClass}>
        {body}
      </span>
    );
  }

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={sponsor.name}
      className={cardClass}
      onClick={onClick}
    >
      {body}
    </a>
  );
};

export const GivebackSponsorTiers = (): ReactElement | null => {
  const { sponsors } = useContributionSponsors();

  if (!sponsors.length) {
    return null;
  }

  // Each tier is its own row — a small tier label, then the row of logo chips —
  // so the hierarchy reads top-down (gold → bronze) by both label and size.
  const tierRows = TIER_ORDER.map((tier) => ({
    tier,
    sponsors: sponsors.filter((sponsor) => sponsor.tier === tier),
  })).filter((row) => row.sponsors.length > 0);

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

        <FlexCol className="gap-5">
          {tierRows.map((row) => {
            const style = tierStyles[row.tier];
            return (
              <FlexRow
                key={row.tier}
                className="flex-wrap items-center gap-x-6 gap-y-3"
              >
                <FlexRow
                  className={classNames(
                    'w-20 shrink-0 items-center gap-1.5 whitespace-nowrap [&_svg]:size-4',
                    style.labelClass,
                  )}
                >
                  <MedalBadgeIcon />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    bold
                    className="uppercase tracking-wider"
                  >
                    {sponsorTierLabel[row.tier]}
                  </Typography>
                </FlexRow>
                <FlexRow className="flex-1 flex-wrap items-center gap-3">
                  {row.sponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                  ))}
                </FlexRow>
              </FlexRow>
            );
          })}
        </FlexCol>
      </FlexCol>
    </section>
  );
};
