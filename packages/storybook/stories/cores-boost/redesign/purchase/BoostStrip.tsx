import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { starterBoost } from '../../flows/purchase/BoostFixed';

// The strip on your own post, spelled out: what a boost adds, what the
// starter preset costs and what you have, so the Boost button is no surprise.

const starterCost = starterBoost.coresPerDay * starterBoost.totalDays;
const EXTRA_REACH = '10k';

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): ReactElement => (
  <span className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-12 bg-background-default px-3 py-2">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <strong className="flex items-center gap-1 typo-callout">{value}</strong>
  </span>
);

export const BoostStrip = ({
  title,
  balance,
  onBoost,
  onDismiss,
}: {
  title: ReactNode;
  balance: number;
  onBoost: () => void;
  onDismiss?: () => void;
}): ReactElement => (
  <div className="relative flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
    {onDismiss && (
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1.5 top-1.5"
        aria-label="Dismiss"
        onClick={onDismiss}
      />
    )}
    <span className="flex items-center gap-2 pr-8">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-blueCheese-flat text-accent-blueCheese-default">
        <BoostIcon size={IconSize.Small} />
      </span>
      <strong className="typo-callout">{title}</strong>
    </span>
    <span className="flex flex-col gap-2 tablet:flex-row">
      <Stat label="Extra reach" value={`+${EXTRA_REACH} developers`} />
      <Stat
        label="Starts at"
        value={
          <>
            <CoreIcon size={IconSize.Size16} />
            {formatCoresCurrency(starterCost)} for {starterBoost.totalDays}{' '}
            {starterBoost.totalDays === 1 ? 'day' : 'days'}
          </>
        }
      />
      <Stat
        label="Your balance"
        value={
          <>
            <CoreIcon size={IconSize.Size16} />
            {formatCoresCurrency(balance)}
          </>
        }
      />
    </span>
    <span className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary typo-footnote">
        {balance >= starterCost
          ? 'Shown as Promoted to developers who follow its topics.'
          : `You need ${formatCoresCurrency(starterCost - balance)} more Cores. We'll help you get them.`}
      </span>
      <Button
        className="shrink-0"
        variant={ButtonVariant.Primary}
        color={ButtonColor.BlueCheese}
        size={ButtonSize.Small}
        icon={<BoostIcon />}
        onClick={onBoost}
      >
        Boost
      </Button>
    </span>
  </div>
);
