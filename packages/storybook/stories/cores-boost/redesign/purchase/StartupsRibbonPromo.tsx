import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { MonthlyCredits } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { formatCashbackMultiple } from '@dailydotdev/shared/src/features/squads/lib/plans';

// The Startups offer in the boost form, redrawn: during the launch offer its
// multiplier sits on an onion corner ribbon, as on the wallet's Boost box.
// Same promo, copy, link and dismiss as production's StartupsBoostPromo.

export const StartupsRibbonPromo = ({
  sourceId,
}: {
  sourceId?: string;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: StartupsPromoSpot.BoostPost,
    sourceId,
  });

  if (!promo.isShown) {
    return null;
  }

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-16 border border-border-subtlest-secondary p-4">
      {promo.launchOffer && (
        <span className="absolute -right-8 top-4 w-32 rotate-45 bg-accent-onion-default py-0.5 text-center font-bold typo-caption1">
          {formatCashbackMultiple(promo.cashback)} value
        </span>
      )}
      <span className="flex items-center gap-3 pr-16">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-overlay-float-cabbage">
          <CoreIcon size={IconSize.Medium} />
        </span>
        <strong className="min-w-0 flex-1 typo-body">
          Get <MonthlyCredits promo={promo} /> every month
        </strong>
      </span>
      <p className="text-text-tertiary typo-footnote">
        {promo.squad
          ? `Make ${promo.squad.name} your company page for ${promo.starterPrice} a month, and the credits land in its wallet.`
          : `Boosting for your startup? Get a company page for ${promo.starterPrice} a month.`}
      </p>
      <span className="flex items-center gap-2">
        <Button
          tag="a"
          href={promo.checkoutUrl}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="flex-1"
          onClick={promo.onClick}
        >
          See plans
        </Button>
        <CloseButton
          size={ButtonSize.Small}
          aria-label="Don't show this offer again"
          onClick={promo.onDismiss}
        />
      </span>
    </div>
  );
};
