import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  CoreIcon,
  DevPlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UpgradeToPlus } from '@dailydotdev/shared/src/components/UpgradeToPlus';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { StartupsPromo } from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { TargetId } from '@dailydotdev/shared/src/lib/log';

// "Deals" on top of Buy Cores: two side-by-side ways to get Cores without
// buying a pack. daily.dev for Startups (the production promo's data and
// gating, boosts only) and Plus, which gives 50% of every payment back.

const formatCores = (cores: number): string => cores.toLocaleString('en-US');

const DealCard = ({
  tag,
  tagClassName,
  icon,
  title,
  description,
  action,
  onDismiss,
}: {
  tag: ReactNode;
  tagClassName: string;
  icon: ReactNode;
  title: ReactNode;
  description: string;
  action: ReactNode;
  onDismiss?: () => void;
}): ReactElement => (
  <li className="relative flex min-w-0 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
    <span className="flex items-center gap-2">
      {icon}
      <span
        className={classNames(
          'rounded-8 px-2 py-0.5 font-bold typo-caption1',
          tagClassName,
        )}
      >
        {tag}
      </span>
    </span>
    {onDismiss && (
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1.5 top-1.5"
        aria-label="Don't show this offer again"
        onClick={onDismiss}
      />
    )}
    <span className="flex flex-col gap-0.5">
      <strong className="typo-callout">{title}</strong>
      <span className="text-text-tertiary typo-caption1">{description}</span>
    </span>
    <span className="mt-auto flex">{action}</span>
  </li>
);

const StartupsDeal = ({ promo }: { promo: StartupsPromo }): ReactElement => (
  <DealCard
    tag={promo.launchOffer ? 'Launch offer' : 'For teams'}
    tagClassName="bg-overlay-float-cabbage text-accent-cabbage-default"
    icon={
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
        <CoreIcon size={IconSize.Small} />
      </span>
    }
    title={
      <>
        {promo.launchOffer && (
          <s className="mr-1 font-normal text-text-quaternary">
            {formatCores(promo.launchOffer.monthlyCores)}
          </s>
        )}
        {formatCores(promo.monthlyCores)} Cores a month
      </>
    }
    description={`daily.dev for Startups, ${promo.starterPrice} a month. Lands in your company's wallet.`}
    action={
      <Button
        tag="a"
        href={promo.checkoutUrl}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        className="w-full"
        onClick={promo.onClick}
      >
        See plans
      </Button>
    }
    onDismiss={promo.onDismiss}
  />
);

const PlusDeal = (): ReactElement => (
  <DealCard
    tag="Plus"
    tagClassName="bg-overlay-float-cheese text-accent-cheese-default"
    icon={
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cheese text-accent-cheese-default">
        <DevPlusIcon size={IconSize.Small} />
      </span>
    }
    title="50% back in Cores"
    description="Every Plus payment, renewals included, comes back to you as Cores."
    action={
      <UpgradeToPlus
        size={ButtonSize.Small}
        target={TargetId.CoreWallet}
        label="Upgrade to Plus"
        className="w-full"
      />
    }
  />
);

export const Deals = ({
  withStartups,
}: {
  /** Production offers Startups only when the Cores are for a boost */
  withStartups: boolean;
}): ReactElement | null => {
  const promo = useStartupsPromo({ spot: StartupsPromoSpot.BuyCores });
  const { isPlus } = usePlusSubscription();
  const hasStartups = withStartups && promo.isShown;

  if (!hasStartups && isPlus) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-bold typo-callout">Deals</h3>
      <ul
        className={classNames(
          'grid grid-cols-1 gap-2',
          hasStartups && !isPlus && 'tablet:grid-cols-2',
        )}
      >
        {hasStartups && <StartupsDeal promo={promo} />}
        {!isPlus && <PlusDeal />}
      </ul>
    </section>
  );
};
