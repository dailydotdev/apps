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

// Tint for each tier's column heading.
const tierLabelClass: Record<ContributionSponsorTier, string> = {
  [ContributionSponsorTier.Gold]: 'text-accent-cheese-default',
  [ContributionSponsorTier.Silver]: 'text-text-secondary',
  [ContributionSponsorTier.Bronze]: 'text-accent-burger-default',
};

// Gold first so the columns read left-to-right by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A sponsor logo on a white tile so the brand's real colors stay visible on the
// dark page. The logo only counts once it actually decodes (onLoad with real
// pixels); until then — loading, hung, blocked, 404, zero-size, or no URL — the
// sponsor name shows instead, so a tile is never blank.
const SponsorLogo = ({
  sponsor,
}: {
  sponsor: ContributionSponsor;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const hasLogo = Boolean(sponsor.logoUrl) && !logoFailed;
  const showName = !hasLogo || !logoLoaded;

  const onClick = () =>
    logEvent({
      event_name: LogEvent.ClickGivebackSponsor,
      target_id: sponsor.id,
      extra: JSON.stringify({ name: sponsor.name, tier: sponsor.tier }),
    });

  const tileClass =
    'inline-flex h-12 min-w-[88px] max-w-full items-center justify-center rounded-10 bg-white px-3 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none';

  const body = (
    <>
      {hasLogo && (
        <img
          src={sponsor.logoUrl ?? undefined}
          alt={`${sponsor.name} logo`}
          onLoad={(event) =>
            event.currentTarget.naturalWidth === 0
              ? setLogoFailed(true)
              : setLogoLoaded(true)
          }
          onError={() => setLogoFailed(true)}
          className={classNames(
            'max-h-7 w-auto max-w-[120px] object-contain',
            !logoLoaded && 'hidden',
          )}
        />
      )}
      {showName && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          truncate
          className="max-w-[120px] text-black"
        >
          {sponsor.name}
        </Typography>
      )}
    </>
  );

  if (!sponsor.url) {
    return (
      <span aria-label={sponsor.name} className={tileClass}>
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
      className={tileClass}
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

  // One card per tier that has sponsors, laid out as up-to-three equal columns.
  const tierColumns = TIER_ORDER.map((tier) => ({
    tier,
    sponsors: sponsors.filter((sponsor) => sponsor.tier === tier),
  })).filter((column) => column.sponsors.length > 0);

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

      <FlexCol className="relative items-center gap-6">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Sponsored by
        </Typography>

        <div className="grid w-full grid-cols-1 gap-4 tablet:grid-cols-3">
          {tierColumns.map((column) => (
            <FlexCol
              key={column.tier}
              className="items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-5"
            >
              <FlexRow
                className={classNames(
                  'items-center gap-1.5 [&_svg]:size-4',
                  tierLabelClass[column.tier],
                )}
              >
                <MedalBadgeIcon />
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  bold
                  className="uppercase tracking-wider"
                >
                  {sponsorTierLabel[column.tier]}
                </Typography>
              </FlexRow>
              <FlexRow className="flex-wrap justify-center gap-2.5">
                {column.sponsors.map((sponsor) => (
                  <SponsorLogo key={sponsor.id} sponsor={sponsor} />
                ))}
              </FlexRow>
            </FlexCol>
          ))}
        </div>
      </FlexCol>
    </section>
  );
};
