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

// Each tier gets its own colored pill so the sponsor level is spelled out on the
// card itself — no decoding a small dot. The colors map to the brand accents
// (gold = cheese, bronze = bacon); silver stays a quiet neutral.
const tierPillClass: Record<ContributionSponsorTier, string> = {
  [ContributionSponsorTier.Gold]:
    'bg-accent-cheese-flat text-accent-cheese-default',
  [ContributionSponsorTier.Silver]:
    'bg-background-subtle text-text-secondary',
  [ContributionSponsorTier.Bronze]:
    'bg-accent-bacon-flat text-accent-bacon-default',
};

// Headline tiers first so the wall reads top-down by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A self-describing sponsor card: the brand logo sits on its own white tile so
// it stays legible regardless of the page theme (the high-contrast half), while
// the card body carries the name and a colored tier pill (the colorful half).
// The card itself rests on a flat surface rather than a bare white block.
const SponsorCard = ({
  sponsor,
}: {
  sponsor: ContributionSponsor;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const [failed, setFailed] = useState(false);
  const showLogo = Boolean(sponsor.logoUrl) && !failed;

  const onClick = () =>
    logEvent({
      event_name: LogEvent.ClickGivebackSponsor,
      target_id: sponsor.id,
      extra: JSON.stringify({ name: sponsor.name, tier: sponsor.tier }),
    });

  const cardClass =
    'flex min-w-0 items-center gap-3 rounded-14 border border-border-subtlest-tertiary bg-surface-float p-3 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none';

  const body = (
    <>
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-12 bg-white text-text-primary">
        {showLogo ? (
          <img
            src={sponsor.logoUrl ?? undefined}
            alt={`${sponsor.name} logo`}
            loading="lazy"
            className="size-full object-contain p-1.5"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="font-bold typo-callout">
            {getSponsorInitials(sponsor.name)}
          </span>
        )}
      </span>
      <FlexCol className="min-w-0 gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          truncate
        >
          {sponsor.name}
        </Typography>
        <span
          className={classNames(
            'inline-flex w-fit items-center gap-1 rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wider typo-caption2 [&_svg]:size-3',
            tierPillClass[sponsor.tier],
          )}
        >
          <MedalBadgeIcon />
          {sponsorTierLabel[sponsor.tier]} sponsor
        </span>
      </FlexCol>
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

  const ordered = [...sponsors].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
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

        <FlexRow className="flex-wrap gap-3">
          {ordered.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </FlexRow>
      </FlexCol>
    </section>
  );
};
