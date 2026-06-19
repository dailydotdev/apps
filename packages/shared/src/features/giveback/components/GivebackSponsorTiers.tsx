import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FlexRow } from '../../../components/utilities';
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
  // Tint for the inline tier label.
  labelClass: string;
  // A FIXED logo height (not max-height): many brand SVGs ship with only a
  // viewBox and no width/height, so `w-auto max-h-*` collapses their width to 0
  // and they render blank. A fixed height lets the browser derive width from the
  // viewBox aspect ratio. Steps down by prestige: gold biggest, bronze smallest.
  logoClass: string;
  // Fallback name size when a sponsor has no usable logo.
  nameType: TypographyType;
}

const tierStyles: Record<ContributionSponsorTier, TierStyle> = {
  [ContributionSponsorTier.Gold]: {
    labelClass: 'text-accent-cheese-default',
    logoClass: 'h-14',
    nameType: TypographyType.Body,
  },
  [ContributionSponsorTier.Silver]: {
    labelClass: 'text-text-secondary',
    logoClass: 'h-8',
    nameType: TypographyType.Footnote,
  },
  [ContributionSponsorTier.Bronze]: {
    labelClass: 'text-accent-burger-default',
    logoClass: 'h-4',
    nameType: TypographyType.Caption1,
  },
};

// Gold first so the strip reads left-to-right by prestige.
const TIER_ORDER: ContributionSponsorTier[] = [
  ContributionSponsorTier.Gold,
  ContributionSponsorTier.Silver,
  ContributionSponsorTier.Bronze,
];

// A sponsor logo, monochrome (light-tinted) at rest so the mixed brand logos
// read as one calm row; on hover the tile fills white and reveals the logo's
// true colors. The logo only counts once it actually decodes — until then
// (loading, hung, blocked, 404, zero-size, or no URL) the name shows so nothing
// is ever blank.
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

  const tileClass =
    'group inline-flex items-center justify-center rounded-8 px-2 py-1 transition-colors duration-200 hover:bg-white';

  const body = (
    <>
      {hasLogo && (
        <img
          src={sponsor.logoUrl ?? undefined}
          alt={`${sponsor.name} logo`}
          onLoad={() => setLogoLoaded(true)}
          onError={() => setLogoFailed(true)}
          className={classNames(
            'w-auto max-w-[120px] object-contain transition duration-200 [filter:brightness(0)_invert(1)] group-hover:[filter:none]',
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
          className="max-w-[120px] text-text-primary transition-colors group-hover:text-black"
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

const Divider = (): ReactElement => (
  <span
    aria-hidden
    className="hidden h-12 w-px self-center bg-border-subtlest-tertiary tablet:block"
  />
);

export const GivebackSponsorTiers = (): ReactElement | null => {
  const { sponsors } = useContributionSponsors();

  if (!sponsors.length) {
    return null;
  }

  const tierGroups = TIER_ORDER.map((tier) => ({
    tier,
    sponsors: sponsors.filter((sponsor) => sponsor.tier === tier),
  })).filter((group) => group.sponsors.length > 0);

  return (
    <section className="flex w-full justify-center">
      {/* One compact bordered strip; "Sponsored by" sits inline at the start and
          a divider separates each tier section. */}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-16 border border-border-subtlest-tertiary px-6 py-4">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Sponsored by
        </Typography>

        {tierGroups.map((group) => {
          const style = tierStyles[group.tier];
          return (
            <React.Fragment key={group.tier}>
              <Divider />
              <FlexRow className="items-center gap-3">
                <FlexRow
                  className={classNames(
                    'items-center gap-1 [&_svg]:size-3.5',
                    style.labelClass,
                  )}
                >
                  <MedalBadgeIcon />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption2}
                    bold
                    className="uppercase tracking-wider"
                  >
                    {sponsorTierLabel[group.tier]}
                  </Typography>
                </FlexRow>
                <FlexRow className="flex-wrap items-center gap-1.5">
                  {group.sponsors.map((sponsor) => (
                    <SponsorLogo
                      key={sponsor.id}
                      sponsor={sponsor}
                      style={style}
                    />
                  ))}
                </FlexRow>
              </FlexRow>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
