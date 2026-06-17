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
  // White logo card height + horizontal padding, stepping down by prestige so
  // gold logos read largest and bronze smallest.
  cardClass: string;
  // Max logo height inside the card.
  logoClass: string;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    labelClass: 'text-accent-cheese-default',
    cardClass: 'h-20 px-6',
    logoClass: 'max-h-12',
  },
  [ContributionSponsorTier.Silver]: {
    labelClass: 'text-text-secondary',
    cardClass: 'h-16 px-5',
    logoClass: 'max-h-9',
  },
  [ContributionSponsorTier.Bronze]: {
    labelClass: 'text-accent-burger-default',
    cardClass: 'h-14 px-4',
    logoClass: 'max-h-7',
  },
};

// Headline tiers first so the wall reads top-down by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A logo-forward sponsor card: the brand logo fills a white card (legible on the
// dark page) with no name text — the logo carries the brand. Logo-less sponsors
// (individuals, fresh sponsors) fall back to their name so the card is never
// empty. Card size is driven by the sponsor's tier.
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
    'inline-flex max-w-full shrink-0 items-center justify-center rounded-12 bg-white shadow-2 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none',
    style.cardClass,
  );

  const body = showLogo ? (
    <img
      src={sponsor.logoUrl ?? undefined}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      className={classNames(
        'w-auto max-w-[160px] object-contain',
        style.logoClass,
      )}
      onError={() => setFailed(true)}
    />
  ) : (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Callout}
      bold
      truncate
      className="max-w-[160px] text-text-primary"
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

  // Each tier is its own row — a small tier label, then the row of logo cards —
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
