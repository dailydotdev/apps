import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
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

interface DealCardProps {
  name: string;
  badge: string;
  badgeClassName: string;
  art: { src: string; alt: string };
  tint: string;
  value: string;
  unit: string;
  perk: ReactNode;
  tagline: string;
  action: ReactNode;
  onDismiss?: () => void;
}

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
  onDismiss,
}: DealCardProps): ReactElement => (
  <li
    className={classNames(
      'relative row-span-5 grid min-w-0 grid-rows-subgrid gap-3 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br to-transparent p-4',
      tint,
    )}
  >
    <img
      src={art.src}
      alt={art.alt}
      className={classNames(
        'pointer-events-none absolute -top-8 h-24 w-auto object-contain',
        onDismiss ? 'right-9' : 'right-1',
      )}
    />
    {onDismiss && (
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1.5 top-1.5"
        aria-label="Don't show this offer again"
        onClick={onDismiss}
      />
    )}
    <span className="flex flex-wrap items-center gap-2 pr-16">
      <Typography tag={TypographyTag.Span} type={TypographyType.Title3} bold>
        {name}
      </Typography>
      <span
        className={classNames(
          'rounded-10 px-2 py-0.5 font-bold uppercase tracking-wider typo-caption2',
          badgeClassName,
        )}
      >
        {badge}
      </span>
    </span>
    <span className="flex items-baseline gap-1">
      <strong className="tabular-nums typo-mega3">{value}</strong>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {unit}
      </Typography>
    </span>
    {perk}
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

const DealPerk = ({
  icon,
  title,
  note,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  note: string;
  className: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-2 rounded-12 border px-3 py-2',
      className,
    )}
  >
    {icon}
    <span className="flex min-w-0 flex-1 flex-col">
      <strong className="typo-footnote">{title}</strong>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </span>
  </span>
);

const StartupsDeal = ({ promo }: { promo: StartupsPromo }): ReactElement => (
  <DealCard
    name="Startups"
    badge={`${formatCashbackMultiple(promo.cashback)} value`}
    badgeClassName="bg-accent-cabbage-default text-surface-invert"
    art={{ src: startupsCrewCheerImage, alt: 'Two founders cheering' }}
    tint="from-overlay-float-cabbage"
    value={promo.starterPrice}
    unit="/ month"
    perk={
      <DealPerk
        className="border-accent-cabbage-subtler bg-overlay-float-cabbage"
        icon={
          <BoostIcon
            size={IconSize.Small}
            className="shrink-0 text-accent-cabbage-default"
          />
        }
        title={<MonthlyCredits promo={promo} />}
        note={['every month', promo.promoLength].filter(Boolean).join(' ')}
      />
    }
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
    onDismiss={promo.onDismiss}
  />
);

const PlusDeal = ({ target }: { target: TargetId }): ReactElement => (
  <DealCard
    name="Plus"
    badge="Cashback"
    badgeClassName="bg-action-plus-default text-surface-invert"
    art={{ src: cloudinaryPatchyWaiting, alt: 'Patchy with a Core' }}
    tint="from-action-plus-float"
    value="50%"
    unit="back"
    perk={
      <DealPerk
        className="border-accent-bacon-subtler bg-action-plus-float"
        icon={<CoreIcon size={IconSize.Small} className="shrink-0" />}
        title="Every payment, as Cores"
        note="renewals included"
      />
    }
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
  });
  const hasStartups = withStartups && promo.isShown;

  if (!hasStartups && isPlus) {
    return null;
  }

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
          !isStacked && !isSingleColumn && 'tablet:grid-cols-2',
        )}
      >
        {hasStartups && <StartupsDeal promo={promo} />}
        {!isPlus && <PlusDeal target={TargetId.CoreWallet} />}
      </ul>
    </section>
  );
};
