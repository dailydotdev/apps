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
  // Tint for the tier's column heading.
  labelClass: string;
  // Chip height + logo size step down by prestige: gold biggest, bronze
  // smallest.
  chipClass: string;
  logoClass: string;
  // Fallback name size when a sponsor has no usable logo.
  nameType: TypographyType;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    labelClass: 'text-accent-cheese-default',
    chipClass: 'h-14 px-4',
    logoClass: 'max-h-9',
    nameType: TypographyType.Callout,
  },
  [ContributionSponsorTier.Silver]: {
    labelClass: 'text-text-secondary',
    chipClass: 'h-12 px-3.5',
    logoClass: 'max-h-7',
    nameType: TypographyType.Footnote,
  },
  [ContributionSponsorTier.Bronze]: {
    labelClass: 'text-accent-burger-default',
    chipClass: 'h-10 px-3',
    logoClass: 'max-h-5',
    nameType: TypographyType.Footnote,
  },
};

// Gold first so the columns read left-to-right by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A sponsor chip that lights up on hover: at rest it's a flat bordered tile with
// a monochrome (light-tinted) logo so the wall reads calm; on hover it fills
// white and reveals the logo's true colors. The logo only counts once it
// actually decodes (onLoad with real pixels) — until then (loading, hung,
// blocked, 404, zero-size, or no URL) the sponsor name shows so a tile is never
// blank.
const SponsorLogo = ({
  sponsor,
  style,
}: {
  sponsor: ContributionSponsor;
  style: TierStyle;
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

  const tileClass = classNames(
    'group inline-flex max-w-full items-center justify-center rounded-10 border border-border-subtlest-tertiary transition-colors duration-200 hover:border-transparent hover:bg-white',
    style.chipClass,
  );

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
            'opacity-70 w-auto max-w-[120px] object-contain transition duration-200 [filter:brightness(0)_invert(1)] group-hover:opacity-100 group-hover:[filter:none]',
            style.logoClass,
            !logoLoaded && 'hidden',
          )}
        />
      )}
      {showName && (
        <Typography
          tag={TypographyTag.Span}
          type={style.nameType}
          bold
          truncate
          className="max-w-[120px] text-text-secondary transition-colors group-hover:text-black"
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

  // One column per tier that has sponsors, side by side, split by a divider
  // rather than wrapped in cards.
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

        <div className="flex w-full flex-col tablet:flex-row">
          {tierColumns.map((column, index) => {
            const style = tierStyles[column.tier];
            return (
              <FlexCol
                key={column.tier}
                className={classNames(
                  'flex-1 items-center gap-4 p-5',
                  index > 0 &&
                    'border-t border-border-subtlest-tertiary tablet:border-l tablet:border-t-0',
                )}
              >
                <FlexRow
                  className={classNames(
                    'items-center gap-1.5 [&_svg]:size-4',
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
                    {sponsorTierLabel[column.tier]}
                  </Typography>
                </FlexRow>
                <FlexRow className="flex-wrap justify-center gap-2.5">
                  {column.sponsors.map((sponsor) => (
                    <SponsorLogo
                      key={sponsor.id}
                      sponsor={sponsor}
                      style={style}
                    />
                  ))}
                </FlexRow>
              </FlexCol>
            );
          })}
        </div>
      </FlexCol>
    </section>
  );
};
