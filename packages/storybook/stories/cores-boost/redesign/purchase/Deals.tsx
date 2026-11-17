import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UpgradeToPlus } from '@dailydotdev/shared/src/components/UpgradeToPlus';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { StartupsPromo } from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  formatBoostCredits,
  formatCashbackMultiple,
  SquadPlan,
  squadPlanDetails,
} from '@dailydotdev/shared/src/features/squads/lib/plans';
import { startupsCrewCheerImage } from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCrewOnBase';
import { cloudinaryPatchyWaiting } from '@dailydotdev/shared/src/lib/image';

// "Deals" on top of Buy Cores: two side-by-side ways to get Cores without
// buying a pack, drawn like the Startups page's plan card: a character
// peeking over the top, a big number, a perk box and one small line.
// daily.dev for Startups (the production promo's data) and Plus, which gives
// 50% of every payment back.

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
}: {
  name: string;
  badge: string;
  badgeClassName: string;
  art: ReactNode;
  tint: string;
  value: string;
  unit: string;
  perk: ReactNode;
  tagline: string;
  action: ReactNode;
}): ReactElement => (
  <li
    className={classNames(
      'relative row-span-5 grid min-w-0 grid-rows-subgrid gap-3 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br to-transparent p-4',
      tint,
    )}
  >
    {art}
    <span className="flex flex-wrap items-center gap-2 pr-16">
      <strong className="typo-title3">{name}</strong>
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
      <span className="text-text-tertiary typo-callout">{unit}</span>
    </span>
    {perk}
    <span className="text-text-tertiary typo-footnote">{tagline}</span>
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
      <span className="text-text-tertiary typo-caption1">{note}</span>
    </span>
  </span>
);

const DealArt = ({ src, alt }: { src: string; alt: string }): ReactElement => (
  <img
    src={src}
    alt={alt}
    className="pointer-events-none absolute -top-8 right-1 h-24 w-auto object-contain"
  />
);

const StartupsDeal = ({ promo }: { promo: StartupsPromo }): ReactElement => (
  <DealCard
    name="Startups"
    badge={`${formatCashbackMultiple(promo.cashback)} value`}
    badgeClassName="bg-accent-cabbage-default text-surface-invert"
    art={<DealArt src={startupsCrewCheerImage} alt="Two founders cheering" />}
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
        title={
          <>
            {promo.launchOffer && (
              <s className="mr-1 font-normal text-text-quaternary">
                {formatBoostCredits(promo.launchOffer.monthlyCredits)}
              </s>
            )}
            {formatBoostCredits(promo.monthlyCredits)} in boost credits
          </>
        }
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

const PlusDeal = (): ReactElement => (
  <DealCard
    name="Plus"
    badge="Cashback"
    badgeClassName="bg-action-plus-default text-surface-invert"
    art={<DealArt src={cloudinaryPatchyWaiting} alt="Patchy with a Core" />}
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
        target={TargetId.CoreWallet}
        label="Upgrade"
        className="!flex-none"
      />
    }
  />
);

export const Deals = ({
  withStartups,
  isStacked,
  isSingleColumn,
}: {
  /** Production offers Startups only when the Cores are for a boost */
  withStartups: boolean;
  /** One card under the other, for a narrow column, with no "Deals" title */
  isStacked?: boolean;
  /** One card under the other, keeping the "Deals" title */
  isSingleColumn?: boolean;
}): ReactElement | null => {
  const promo = useStartupsPromo({ spot: StartupsPromoSpot.BuyCores });
  const { isPlus } = usePlusSubscription();
  const hasStartups = withStartups && promo.isShown;

  if (!hasStartups && isPlus) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      {!isStacked && <h3 className="font-bold typo-callout">Deals</h3>}
      <ul
        className={classNames(
          'mt-6 grid grid-cols-1 gap-x-2 gap-y-8',
          !isStacked &&
            !isSingleColumn &&
            hasStartups &&
            !isPlus &&
            'tablet:grid-cols-2',
        )}
      >
        {hasStartups && <StartupsDeal promo={promo} />}
        {!isPlus && <PlusDeal />}
      </ul>
    </section>
  );
};
