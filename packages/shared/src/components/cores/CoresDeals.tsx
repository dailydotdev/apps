import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BoostIcon } from '../icons/Boost';
import { CoreIcon } from '../icons/Core';
import { IconSize } from '../Icon';
import { UpgradeToPlus } from '../UpgradeToPlus';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import type {
  StartupsPromo,
  StartupsPromoSpot,
} from '../../features/squads/hooks/useStartupsPromo';
import { useStartupsPromo } from '../../features/squads/hooks/useStartupsPromo';
import { MonthlyCredits } from '../../features/squads/components/promos/StartupsPromo';
import {
  formatCashbackMultiple,
  SquadPlan,
  squadPlanDetails,
} from '../../features/squads/lib/plans';
import { startupsCrewCheerImage } from '../../features/squads/components/checkout/StartupsCrewOnBase';
import { cloudinaryPatchyWaiting } from '../../lib/image';
import { TargetId } from '../../lib/log';

interface DealPerkProps {
  icon: ReactNode;
  title: ReactNode;
  note: string;
  className: string;
}

interface DealCardProps {
  name: string;
  badge: string;
  badgeClassName: string;
  art: { src: string; alt: string };
  tint: string;
  value: string;
  unit: string;
  perk: DealPerkProps;
  tagline: string;
  action: ReactNode;
  /** The only deal: one wide, short card instead of a tall column */
  isCompact?: boolean;
}

const DealBadge = ({
  badge,
  className,
}: {
  badge: string;
  className: string;
}): ReactElement => (
  <span
    className={classNames(
      'shrink-0 rounded-10 px-2 py-0.5 font-bold uppercase tracking-wider typo-caption2',
      className,
    )}
  >
    {badge}
  </span>
);

const DealPerk = ({
  icon,
  title,
  note,
  className,
  badge,
}: DealPerkProps & { badge?: ReactNode }): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-2 rounded-12 border px-3 py-2',
      className,
    )}
  >
    {icon}
    <span className="flex min-w-0 flex-1 flex-col">
      <strong className={classNames('typo-footnote', badge && 'truncate')}>
        {title}
      </strong>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </span>
    {badge}
  </span>
);

const DealPrice = ({
  value,
  unit,
  className,
  isStacked = false,
}: {
  value: string;
  unit: string;
  className: string;
  /** From tablet, the unit under the value, where the line is short on room */
  isStacked?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0',
      'items-baseline gap-1',
      isStacked && 'tablet:flex-col tablet:items-start tablet:gap-0',
    )}
  >
    <strong className={classNames('tabular-nums', className)}>{value}</strong>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
    >
      {unit}
    </Typography>
  </span>
);

const DealCard = ({
  name,
  badge,
  badgeClassName,
  art,
  tint,
  value,
  unit,
  perk,
  tagline,
  action,
  isCompact = false,
}: DealCardProps): ReactElement => {
  const badgeChip = <DealBadge badge={badge} className={badgeClassName} />;
  const cardClassName =
    'relative min-w-0 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br to-transparent p-4';

  // One line under the headline: the perk carries the badge, then price and action
  if (isCompact) {
    return (
      <li className={classNames(cardClassName, 'flex flex-col gap-3', tint)}>
        <img
          src={art.src}
          alt={art.alt}
          className="pointer-events-none absolute -top-6 right-1 h-16 w-auto object-contain"
        />
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pr-16">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Title3}
            bold
          >
            {name}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {tagline}
          </Typography>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-3">
          <span className="w-full min-w-0 tablet:w-auto tablet:flex-1">
            <DealPerk {...perk} badge={badgeChip} />
          </span>
          <DealPrice
            value={value}
            unit={unit}
            className="typo-title2"
            isStacked
          />
          <span className="ml-auto flex tablet:ml-0">{action}</span>
        </span>
      </li>
    );
  }

  return (
    <li
      className={classNames(
        cardClassName,
        'row-span-5 grid grid-rows-subgrid gap-3',
        tint,
      )}
    >
      <img
        src={art.src}
        alt={art.alt}
        className="pointer-events-none absolute -top-8 right-1 h-24 w-auto object-contain"
      />
      <span className="flex flex-wrap items-center gap-2 pr-16">
        <Typography tag={TypographyTag.Span} type={TypographyType.Title3} bold>
          {name}
        </Typography>
        {badgeChip}
      </span>
      <DealPrice value={value} unit={unit} className="typo-mega3" />
      <DealPerk {...perk} />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {tagline}
      </Typography>
      <span className="flex items-end">{action}</span>
    </li>
  );
};

const StartupsDeal = ({
  promo,
  isCompact,
}: {
  promo: StartupsPromo;
  isCompact: boolean;
}): ReactElement => (
  <DealCard
    isCompact={isCompact}
    name="Startups"
    badge={`${formatCashbackMultiple(promo.cashback)} value`}
    badgeClassName="bg-accent-cabbage-default text-surface-invert"
    art={{ src: startupsCrewCheerImage, alt: 'Two founders cheering' }}
    tint="from-overlay-float-cabbage"
    value={promo.starterPrice}
    unit="/ month"
    perk={{
      className: 'border-accent-cabbage-subtler bg-overlay-float-cabbage',
      icon: (
        <BoostIcon
          size={IconSize.Small}
          className="shrink-0 text-accent-cabbage-default"
        />
      ),
      title: <MonthlyCredits promo={promo} />,
      note: ['every month', promo.promoLength].filter(Boolean).join(' '),
    }}
    tagline={squadPlanDetails[SquadPlan.Starter].tagline}
    action={
      <Button
        tag="a"
        href={promo.checkoutUrl}
        variant={ButtonVariant.Primary}
        size={ButtonSize.XSmall}
        onClick={promo.onClick}
      >
        See plans
      </Button>
    }
  />
);

const PlusDeal = ({
  target,
  isCompact,
}: {
  target: TargetId;
  isCompact: boolean;
}): ReactElement => (
  <DealCard
    isCompact={isCompact}
    name="Plus"
    badge="Cashback"
    badgeClassName="bg-action-plus-default text-surface-invert"
    art={{ src: cloudinaryPatchyWaiting, alt: 'Patchy with a Core' }}
    tint="from-action-plus-float"
    value="50%"
    unit="back"
    perk={{
      className: 'border-accent-bacon-subtler bg-action-plus-float',
      icon: <CoreIcon size={IconSize.Small} className="shrink-0" />,
      title: 'Every payment, as Cores',
      note: 'renewals included',
    }}
    tagline="For developers who want the full daily.dev."
    action={
      <UpgradeToPlus
        size={ButtonSize.XSmall}
        target={target}
        label="Upgrade"
        className="!flex-none"
      />
    }
  />
);

export interface CoresDealsProps {
  /** Where the Startups deal shows, which also names its log events */
  spot: StartupsPromoSpot;
  /** Offer daily.dev for Startups; only where the Cores can pay for a boost */
  withStartups?: boolean;
  /** The squad being boosted, see `useStartupsPromo` */
  sourceId?: string;
  /** False to pitch Startups only to people who run a squad */
  isPersonalAllowed?: boolean;
  /** One card under the other, without the "Deals" title, for a side column */
  isStacked?: boolean;
  /** One card under the other, keeping the title */
  isSingleColumn?: boolean;
  className?: string;
}

/**
 * Ways to get Cores without buying a pack: daily.dev for Startups' monthly
 * boost credits and Plus' 50% back.
 */
export const CoresDeals = ({
  spot,
  withStartups = false,
  sourceId,
  isPersonalAllowed,
  isStacked = false,
  isSingleColumn = false,
  className,
}: CoresDealsProps): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const promo = useStartupsPromo({
    spot,
    sourceId,
    isPersonalAllowed,
    isVisible: withStartups,
    // A deal stays: dismissing it would hide Startups everywhere for good
    isDismissible: false,
  });
  const hasStartups = withStartups && promo.isShown;

  if (!hasStartups && isPlus) {
    return null;
  }

  const dealCount = Number(hasStartups) + Number(!isPlus);
  const isCompact = !isStacked && dealCount === 1;

  return (
    <section className={classNames('flex flex-col gap-2', className)}>
      {!isStacked && (
        <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
          Deals
        </Typography>
      )}
      <ul
        className={classNames(
          'mt-6 grid grid-cols-1 gap-x-2 gap-y-8',
          isStacked && 'laptop:mt-0',
          !isStacked && !isSingleColumn && !isCompact && 'tablet:grid-cols-2',
        )}
      >
        {hasStartups && <StartupsDeal promo={promo} isCompact={isCompact} />}
        {!isPlus && (
          <PlusDeal target={TargetId.CoreWallet} isCompact={isCompact} />
        )}
      </ul>
    </section>
  );
};
