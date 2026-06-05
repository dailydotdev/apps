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
import { formatDonationAmount, getSponsorTier } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackSponsorModal } from './GivebackSponsorModal';
import { SponsorBudgetBar } from './SponsorBudgetBar';
import { SponsorLogo } from './SponsorLogo';

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

const PODIUM_SIZE = 3;

const sortSponsors = (sponsors: GivebackSponsor[]): GivebackSponsor[] =>
  [...sponsors].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    if (Boolean(a.isFounding) !== Boolean(b.isFounding)) {
      return a.isFounding ? -1 : 1;
    }
    return 0;
  });

const SponsorCard = ({
  sponsor,
  rank,
  featured = false,
  wide = false,
}: {
  sponsor: GivebackSponsor;
  rank?: number;
  featured?: boolean;
  wide?: boolean;
}): ReactElement => {
  const tier = getSponsorTier(sponsor.amount);
  const isPodium = featured && !!rank;
  const typeLabel =
    sponsor.type === GivebackSponsorType.Company ? 'Company' : 'Individual';

  let avatarSize = 'size-12';
  let initialsTypo = 'typo-callout';
  let amountType = TypographyType.Callout;
  if (wide) {
    avatarSize = 'size-16';
    initialsTypo = 'typo-title3';
    amountType = TypographyType.Title2;
  } else if (isPodium) {
    avatarSize = 'size-14';
    initialsTypo = 'typo-body';
    amountType = TypographyType.Title3;
  }
  const nameType = isPodium ? TypographyType.Callout : TypographyType.Footnote;

  // Podium stays monochrome: a neutral elevated card and a plain numbered badge
  // so the ranking reads clean and classic instead of competing with the
  // colored funding bar above. Only the leader gets a subtle shiny top edge.
  const tileClassName = isPodium
    ? 'bg-surface-float text-text-secondary'
    : classNames(tierStyles[tier].tile, tierStyles[tier].text);

  return (
    <FlexCol
      className={classNames(
        'group relative gap-3 overflow-hidden rounded-16 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 motion-reduce:transform-none',
        isPodium ? 'p-5' : 'p-4',
        isPodium
          ? 'border-border-subtlest-secondary bg-gradient-to-b from-surface-float to-transparent'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        wide && 'tablet:col-span-2',
      )}
    >
      {wide && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}
      <FlexRow className="items-center gap-3">
        <div className="relative shrink-0">
          <SponsorLogo
            name={sponsor.name}
            logoUrl={sponsor.logoUrl}
            className={classNames(
              'rounded-16 transition-transform duration-200 group-hover:scale-105',
              avatarSize,
            )}
            tileClassName={tileClassName}
            initialsClassName={initialsTypo}
          />
          {isPodium && (
            <span
              aria-label={`Rank ${rank}`}
              className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-background-default font-bold text-text-secondary ring-1 ring-border-subtlest-secondary typo-caption2"
            >
              {rank}
            </span>
          )}
        </div>
        <FlexCol className="min-w-0 flex-1">
          <FlexRow className="items-center gap-2">
            <Typography tag={TypographyTag.Span} type={nameType} bold truncate>
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
            {isPodium ? `#${rank} sponsor · ${typeLabel}` : typeLabel}
          </Typography>
        </FlexCol>
        <Typography
          tag={TypographyTag.Span}
          type={amountType}
          color={TypographyColor.StatusSuccess}
          bold
          className="shrink-0 tabular-nums"
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
      description="Companies and people top up the budget directly. Every sponsored dollar lands in the same pot the community is unlocking, then goes straight to the causes."
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
      <FlexCol className="gap-4">
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
              color={TypographyColor.StatusSuccess}
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

        <SponsorBudgetBar sponsors={campaign.sponsors} />
      </FlexCol>

      <div className="grid gap-4 tablet:grid-cols-2">
        {sponsors.map((sponsor, index) => {
          const rank = index < PODIUM_SIZE ? index + 1 : undefined;
          return (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              rank={rank}
              featured={rank !== undefined}
              wide={index === 0}
            />
          );
        })}

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
