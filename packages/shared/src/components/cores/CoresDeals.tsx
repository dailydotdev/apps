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
  /** The only deal: one wide, short card instead of a tall column */
  isCompact?: boolean;
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
  isCompact = false,
}: DealCardProps): ReactElement => (
  <li
    className={classNames(
      'relative grid min-w-0 gap-3 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br to-transparent p-4',
      isCompact
        ? 'tablet:grid-cols-[auto_minmax(0,1fr)] tablet:gap-x-6'
        : 'row-span-5 grid-rows-subgrid',
      tint,
    )}
  >
    <img
      src={art.src}
      alt={art.alt}
      className={classNames(
        'pointer-events-none absolute right-1 w-auto object-contain',
        isCompact ? '-top-6 h-16' : '-top-8 h-24',
      )}
    />
    <span
      className={classNames(
        'flex flex-wrap items-center gap-2 pr-16',
        isCompact && 'tablet:col-start-1 tablet:row-start-1 tablet:pr-0',
      )}
    >
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
    <span
      className={classNames(
        'flex items-baseline gap-1',
        isCompact && 'tablet:col-start-1 tablet:row-start-2',
      )}
    >
      <strong
        className={classNames(
          'tabular-nums',
          isCompact ? 'typo-title1' : 'typo-mega3',
        )}
      >
        {value}
      </strong>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {unit}
      </Typography>
    </span>
    <span
      className={classNames(
        isCompact &&
          'tablet:col-start-2 tablet:row-span-2 tablet:row-start-2 tablet:self-end',
      )}
    >
      {perk}
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className={classNames(
        isCompact && 'tablet:col-start-2 tablet:row-start-1 tablet:pr-16',
      )}
    >
      {tagline}
    </Typography>
    <span
      className={classNames(
        'flex items-end',
        isCompact && 'tablet:col-start-1 tablet:row-start-3',
      )}
    >
      {action}
    </span>
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
