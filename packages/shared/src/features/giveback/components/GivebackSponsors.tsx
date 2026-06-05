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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { PlusIcon } from '../../../components/icons';
import { useGivebackContext } from '../GivebackContext';
import type { GivebackSponsor } from '../types';
import { GivebackSponsorTier, GivebackSponsorType } from '../types';
import {
  formatDonationAmount,
  getSponsorTier,
  sponsorTierLabel,
} from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackSponsorModal } from './GivebackSponsorModal';

const tierStyles: Record<GivebackSponsorTier, { tile: string; text: string }> =
  {
    [GivebackSponsorTier.Platinum]: {
      tile: 'bg-accent-cabbage-flat',
      text: 'text-accent-cabbage-default',
    },
    [GivebackSponsorTier.Gold]: {
      tile: 'bg-accent-cheese-flat',
      text: 'text-accent-cheese-default',
    },
    [GivebackSponsorTier.Silver]: {
      tile: 'bg-accent-onion-flat',
      text: 'text-accent-onion-default',
    },
    [GivebackSponsorTier.Backer]: {
      tile: 'bg-accent-avocado-flat',
      text: 'text-accent-avocado-default',
    },
  };

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

const sortSponsors = (sponsors: GivebackSponsor[]): GivebackSponsor[] =>
  [...sponsors].sort((a, b) => {
    if (Boolean(a.isFounding) !== Boolean(b.isFounding)) {
      return a.isFounding ? -1 : 1;
    }
    return b.amount - a.amount;
  });

const SponsorCard = ({
  sponsor,
}: {
  sponsor: GivebackSponsor;
}): ReactElement => {
  const tier = getSponsorTier(sponsor.amount);
  const accent = tierStyles[tier];
  const typeLabel =
    sponsor.type === GivebackSponsorType.Company ? 'Company' : 'Individual';

  return (
    <FlexCol className="group gap-3 rounded-16 border border-border-subtlest-tertiary p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2 motion-reduce:transform-none">
      <FlexRow className="items-center gap-3">
        <span
          className={classNames(
            'flex size-12 shrink-0 items-center justify-center rounded-16 font-bold transition-transform duration-200 typo-callout group-hover:scale-105',
            accent.tile,
            accent.text,
          )}
        >
          {getInitials(sponsor.name)}
        </span>
        <FlexCol className="min-w-0 flex-1">
          <FlexRow className="items-center gap-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
              truncate
            >
              {sponsor.name}
            </Typography>
            {sponsor.isFounding && (
              <span className="shrink-0 rounded-6 bg-accent-bacon-flat px-1.5 py-0.5 font-bold uppercase tracking-wider text-accent-bacon-default typo-caption2">
                Founding
              </span>
            )}
          </FlexRow>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {typeLabel} · {sponsorTierLabel[tier]} sponsor
          </Typography>
        </FlexCol>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          bold
          className={classNames('shrink-0 tabular-nums', accent.text)}
        >
          {formatDonationAmount(sponsor.amount, sponsor.currency)}
        </Typography>
      </FlexRow>

      {sponsor.message && (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          &ldquo;{sponsor.message}&rdquo;
        </Typography>
      )}
    </FlexCol>
  );
};

export const GivebackSponsors = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sponsors = sortSponsors(campaign.sponsors);
  const goalShare = campaign.goalAmount
    ? Math.round((campaign.sponsoredAmount / campaign.goalAmount) * 100)
    : 0;

  return (
    <GivebackSection
      id="giveback-sponsors"
      description="Companies and people top up the budget directly. Every sponsored dollar lands in the same pot the community is unlocking — and goes straight to the causes."
      headerActions={
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          icon={<PlusIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Become a sponsor
        </Button>
      }
    >
      <FlexRow className="flex-wrap items-center justify-between gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
        <FlexCol className="gap-1">
          <FlexRow className="items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-accent-bacon-default" />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              Sponsored into the pot
            </Typography>
          </FlexRow>
          <FlexRow className="items-end gap-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Mega1}
              bold
              className="text-accent-bacon-default"
            >
              {formatDonationAmount(
                campaign.sponsoredAmount,
                campaign.currency,
              )}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="pb-1"
            >
              from {sponsors.length} sponsors
            </Typography>
          </FlexRow>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            100% goes to the causes · {goalShare}% of the{' '}
            {formatDonationAmount(campaign.goalAmount, campaign.currency)} goal
          </Typography>
        </FlexCol>
      </FlexRow>

      <div className="grid gap-4 tablet:grid-cols-2">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} />
        ))}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col items-center justify-center gap-2 rounded-16 border border-dashed border-border-subtlest-tertiary p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-cabbage-default hover:bg-accent-cabbage-flat active:translate-y-0 motion-reduce:transform-none"
        >
          <span className="flex size-12 items-center justify-center rounded-16 bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110 [&_svg]:size-6">
            <PlusIcon />
          </span>
          <Typography type={TypographyType.Footnote} bold>
            Become a sponsor
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Add your company or name to the wall
          </Typography>
        </button>
      </div>

      {isModalOpen && (
        <GivebackSponsorModal onClose={() => setIsModalOpen(false)} />
      )}
    </GivebackSection>
  );
};
