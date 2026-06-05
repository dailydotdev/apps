import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useGivebackNav } from '../GivebackNavContext';
import type { GivebackSponsor } from '../types';
import { formatDonationAmount, getSponsorInitials } from '../utils';
import { SponsorLogo } from './SponsorLogo';

// iOS "storage bar" style: one bar split into proportional, color-coded
// segments — one per top sponsor, with the long tail grouped into "Others".
// The logo above defaults to the biggest sponsor and swaps to whichever segment
// you hover or focus.
const SEGMENT_PALETTE = [
  {
    seg: 'bg-accent-water-default',
    tile: 'bg-accent-water-flat text-accent-water-default',
  },
  {
    seg: 'bg-accent-blueCheese-default',
    tile: 'bg-accent-blueCheese-flat text-accent-blueCheese-default',
  },
  {
    seg: 'bg-accent-cheese-default',
    tile: 'bg-accent-cheese-flat text-accent-cheese-default',
  },
  {
    seg: 'bg-accent-avocado-default',
    tile: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  {
    seg: 'bg-accent-onion-default',
    tile: 'bg-accent-onion-flat text-accent-onion-default',
  },
  {
    seg: 'bg-accent-bacon-default',
    tile: 'bg-accent-bacon-flat text-accent-bacon-default',
  },
];

const OTHERS_STYLE = {
  seg: 'bg-accent-salt-default',
  tile: 'bg-surface-float text-text-secondary',
};

const MAX_SEGMENTS = 6;

interface Segment {
  id: string;
  label: string;
  amount: number;
  currency: GivebackSponsor['currency'];
  share: number;
  seg: string;
  tile: string;
  initials: string;
  logoUrl?: string;
  count?: number;
}

interface SponsorBudgetBarProps {
  sponsors: GivebackSponsor[];
}

export const SponsorBudgetBar = ({
  sponsors,
}: SponsorBudgetBarProps): ReactElement | null => {
  const { setActiveTab } = useGivebackNav();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const segments = useMemo<Segment[]>(() => {
    const sorted = [...sponsors].sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, sponsor) => sum + sponsor.amount, 0) || 1;
    const leading = sorted.slice(0, MAX_SEGMENTS);
    const rest = sorted.slice(MAX_SEGMENTS);

    const result: Segment[] = leading.map((sponsor, index) => ({
      id: sponsor.id,
      label: sponsor.name,
      amount: sponsor.amount,
      currency: sponsor.currency,
      share: (sponsor.amount / total) * 100,
      seg: SEGMENT_PALETTE[index % SEGMENT_PALETTE.length].seg,
      tile: SEGMENT_PALETTE[index % SEGMENT_PALETTE.length].tile,
      initials: getSponsorInitials(sponsor.name),
      logoUrl: sponsor.logoUrl,
    }));

    if (rest.length > 0) {
      const restAmount = rest.reduce((sum, sponsor) => sum + sponsor.amount, 0);
      result.push({
        id: 'others',
        label: 'Other sponsors',
        amount: restAmount,
        currency: rest[0].currency,
        share: (restAmount / total) * 100,
        seg: OTHERS_STYLE.seg,
        tile: OTHERS_STYLE.tile,
        initials: `+${rest.length}`,
        count: rest.length,
      });
    }

    return result;
  }, [sponsors]);

  if (segments.length === 0) {
    return null;
  }

  const topId = segments[0].id;
  const active =
    segments.find((segment) => segment.id === (hoveredId ?? topId)) ??
    segments[0];
  const isHovering = hoveredId !== null;

  return (
    <FlexCol className="gap-2.5">
      <FlexRow className="items-center gap-2.5">
        <SponsorLogo
          name={active.label}
          logoUrl={active.logoUrl}
          initials={active.initials}
          className="size-9 rounded-12"
          tileClassName={active.tile}
          initialsClassName="typo-footnote"
        />
        <FlexCol className="min-w-0">
          <FlexRow className="items-center gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
              truncate
            >
              {active.label}
            </Typography>
            {!isHovering && active.id === topId && (
              <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
                Top sponsor
              </span>
            )}
          </FlexRow>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {formatDonationAmount(active.amount, active.currency)}
            {active.count ? ` · ${active.count} sponsors` : ''} ·{' '}
            {Math.round(active.share)}%
          </Typography>
        </FlexCol>
      </FlexRow>

      <FlexRow
        className="h-3 w-full overflow-hidden rounded-8"
        role="group"
        aria-label="Sponsor contributions"
      >
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            aria-label={`${segment.label}: ${formatDonationAmount(
              segment.amount,
              segment.currency,
            )}`}
            onMouseEnter={() => setHoveredId(segment.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(segment.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => setActiveTab('sponsors')}
            style={{ width: `${segment.share}%` }}
            className={classNames(
              'box-border h-full border-r-2 border-background-default transition-opacity duration-200 last:border-r-0',
              segment.seg,
              isHovering && hoveredId !== segment.id
                ? 'opacity-40'
                : 'opacity-100',
            )}
          />
        ))}
      </FlexRow>
    </FlexCol>
  );
};
