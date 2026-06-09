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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionSponsors } from '../hooks/useContributionSponsors';
import { sponsorTierLabel } from '../utils';
import type { ContributionSponsor } from '../types';
import { ContributionSponsorTier } from '../types';

interface TierStyle {
  // Tier marker dot + label color (soft, on-brand accent tints).
  dotClass: string;
  labelClass: string;
  // White-card padding + logo height, stepping down platinum → backer.
  chipClass: string;
  logoClass: string;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    dotClass: 'bg-accent-cheese-default',
    labelClass: 'text-accent-cheese-default',
    chipClass: 'px-4 py-2.5',
    logoClass: 'h-8 tablet:h-9',
  },
  [ContributionSponsorTier.Silver]: {
    dotClass: 'bg-text-quaternary',
    labelClass: 'text-text-secondary',
    chipClass: 'px-3.5 py-2',
    logoClass: 'h-6 tablet:h-7',
  },
  [ContributionSponsorTier.Bronze]: {
    dotClass: 'bg-accent-bacon-default',
    labelClass: 'text-accent-bacon-default',
    chipClass: 'px-3 py-1.5',
    logoClass: 'h-5 tablet:h-6',
  },
};

// The headline tier sits on its own row inside a warm glow; the lower two
// tiers share the row beneath it.
const HEADLINE_TIERS = [ContributionSponsorTier.Gold];
const LOWER_TIERS = [
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// Brand logos rest on white "medal cards" so they stay legible on the dark page
// regardless of the logo's own colors; logo-less sponsors (e.g. individuals)
// fall back to a quiet name pill so the card is never empty.
const SponsorChip = ({
  sponsor,
  style,
}: {
  sponsor: ContributionSponsor;
  style: TierStyle;
}): ReactElement => {
  const { logEvent } = useLogContext();

  const onClick = () =>
    logEvent({
      event_name: LogEvent.ClickGivebackSponsor,
      target_id: sponsor.id,
      extra: JSON.stringify({ name: sponsor.name, tier: sponsor.tier }),
    });

  if (!sponsor.logoUrl) {
    const pillClass =
      'flex shrink-0 items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none';
    const name = (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        bold
        className="whitespace-nowrap"
      >
        {sponsor.name}
      </Typography>
    );

    if (!sponsor.url) {
      return <span className={pillClass}>{name}</span>;
    }

    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={sponsor.name}
        className={pillClass}
        onClick={onClick}
      >
        {name}
      </a>
    );
  }

  const cardClass = classNames(
    'flex shrink-0 items-center rounded-12 bg-white shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none',
    style.chipClass,
  );
  const logo = (
    <img
      src={sponsor.logoUrl}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      className={classNames(
        'w-auto max-w-[140px] object-contain',
        style.logoClass,
      )}
    />
  );

  if (!sponsor.url) {
    return (
      <span aria-label={sponsor.name} className={cardClass}>
        {logo}
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
      {logo}
    </a>
  );
};

const SponsorTierGroup = ({
  tier,
  sponsors,
}: {
  tier: ContributionSponsorTier;
  sponsors: ContributionSponsor[];
}): ReactElement => {
  const style = tierStyles[tier];

  return (
    <FlexRow className="flex-wrap items-center gap-x-4 gap-y-3">
      <FlexRow className="shrink-0 items-center gap-2">
        <span className={classNames('size-2 rounded-full', style.dotClass)} />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          bold
          className={classNames('uppercase tracking-wider', style.labelClass)}
        >
          {sponsorTierLabel[tier]}
        </Typography>
      </FlexRow>
      {sponsors.map((sponsor) => (
        <SponsorChip key={sponsor.id} sponsor={sponsor} style={style} />
      ))}
    </FlexRow>
  );
};

export const GivebackSponsorTiers = (): ReactElement | null => {
  const { sponsors } = useContributionSponsors();

  if (!sponsors.length) {
    return null;
  }

  const byTier = (tier: ContributionSponsorTier) =>
    sponsors.filter((sponsor) => sponsor.tier === tier);

  const headlineTiers = HEADLINE_TIERS.filter(
    (tier) => byTier(tier).length > 0,
  );
  const lowerTiers = LOWER_TIERS.filter((tier) => byTier(tier).length > 0);

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
          {headlineTiers.length > 0 && (
            <div className="relative">
              {/* Warm halo so the headline tiers glow softly above the rest. */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="bg-accent-cheese-default/12 absolute -left-6 -top-4 h-28 w-72 rounded-full blur-3xl" />
              </div>
              <FlexCol className="relative gap-5">
                {headlineTiers.map((tier) => (
                  <SponsorTierGroup
                    key={tier}
                    tier={tier}
                    sponsors={byTier(tier)}
                  />
                ))}
              </FlexCol>
            </div>
          )}

          {lowerTiers.length > 0 && (
            <>
              {headlineTiers.length > 0 && (
                <div
                  aria-hidden
                  className="h-px w-full bg-gradient-to-r from-transparent via-border-subtlest-tertiary to-transparent"
                />
              )}
              <FlexRow className="flex-wrap items-center gap-x-10 gap-y-4">
                {lowerTiers.map((tier) => (
                  <SponsorTierGroup
                    key={tier}
                    tier={tier}
                    sponsors={byTier(tier)}
                  />
                ))}
              </FlexRow>
            </>
          )}
        </FlexCol>
      </FlexCol>
    </section>
  );
};
