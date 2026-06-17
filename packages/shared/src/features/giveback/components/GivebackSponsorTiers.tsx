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
import { getSponsorInitials, sponsorTierLabel } from '../utils';
import type { ContributionSponsor } from '../types';
import { ContributionSponsorTier } from '../types';

interface TierStyle {
  // Tint for the inline tier marker (icon + short label) — gold = cheese,
  // bronze = brown/burger; silver stays a quiet neutral.
  tierClass: string;
  // Logo tile size steps down by prestige so gold reads biggest, bronze
  // smallest — the sponsor-wall hierarchy, kept compact.
  tileClass: string;
  nameType: TypographyType;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    tierClass: 'text-accent-cheese-default',
    tileClass: 'size-10',
    nameType: TypographyType.Callout,
  },
  [ContributionSponsorTier.Silver]: {
    tierClass: 'text-text-secondary',
    tileClass: 'size-8',
    nameType: TypographyType.Footnote,
  },
  [ContributionSponsorTier.Bronze]: {
    tierClass: 'text-accent-burger-default',
    tileClass: 'size-7',
    nameType: TypographyType.Footnote,
  },
};

// Headline tiers first so the wall reads top-down by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A compact, content-width sponsor chip: a small white logo tile, the name, and
// an inline tier marker (medal icon + short tier word) tucked at the end of the
// name. Border-only and sized to its text so a row of them stays tight.
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

  const cardClass =
    'inline-flex max-w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-2.5 py-1.5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none';

  const body = (
    <>
      <span
        className={classNames(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-8 bg-white text-text-primary',
          style.tileClass,
        )}
      >
        {showLogo ? (
          <img
            src={sponsor.logoUrl ?? undefined}
            alt={`${sponsor.name} logo`}
            loading="lazy"
            className="size-full object-contain p-1"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="font-bold typo-footnote">
            {getSponsorInitials(sponsor.name)}
          </span>
        )}
      </span>
      <Typography
        tag={TypographyTag.Span}
        type={style.nameType}
        bold
        truncate
        className="min-w-0"
      >
        {sponsor.name}
      </Typography>
      <span
        className={classNames(
          'flex shrink-0 items-center gap-1 font-bold uppercase tracking-wider typo-caption2 [&_svg]:size-4',
          style.tierClass,
        )}
      >
        <MedalBadgeIcon />
        {sponsorTierLabel[sponsor.tier]}
      </span>
    </>
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

  // Each tier becomes its own row so cards within a row are the same size and
  // the hierarchy reads top-down (gold → bronze) instead of mixed sizes
  // wrapping into a ragged grid.
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

        <FlexCol className="gap-4">
          {tierRows.map((row) => (
            <FlexRow key={row.tier} className="flex-wrap items-center gap-3">
              {row.sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </FlexRow>
          ))}
        </FlexCol>
      </FlexCol>
    </section>
  );
};
