import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import type { Offer } from './data';
import { OfferCategory } from './data';
import { RewardCard, RewardCardState, RewardCardVariant } from './RewardCard';

// Concept C. The gift vault.
//
// The surface that makes every other concept safe to ship. Nothing a user earns
// is ever destroyed by a dismissal, so the modals never have to pressure anyone:
// "keep it for later" is a real place. It also gives the feature a home between
// milestones, a reason to come back rather than a thing that ambushes you.

export interface VaultEntry {
  offer: Offer;
  state: RewardCardState;
  /** Why they have it. The vault is a record of wins, not a coupon drawer. */
  earnedFor: string;
}

const SectionHeader = ({
  title,
  count,
  hint,
}: {
  title: string;
  count: number;
  hint?: string;
}): ReactElement => (
  <div className="flex items-baseline gap-2">
    <h3 className="font-bold typo-callout">{title}</h3>
    <span className="text-text-quaternary typo-footnote">{count}</span>
    {hint && (
      <span className="ml-auto text-text-quaternary typo-caption1">{hint}</span>
    )}
  </div>
);

const EntryRow = ({ entry }: { entry: VaultEntry }): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="text-text-quaternary typo-caption1">
      Earned for {entry.earnedFor}
    </span>
    <RewardCard
      offer={entry.offer}
      variant={RewardCardVariant.Row}
      state={entry.state}
      claimLabel="Claim"
    />
  </div>
);

/**
 * The commission swap. We only ever earn when a gift is claimed, so the honest
 * version of "I don't want to be sold to" is not hiding the offer. It is
 * letting the user aim the money we make. Ties the programme to giveback.
 */
export const CommissionSwap = ({
  pool,
  enabled = false,
  onToggle,
}: {
  pool: number;
  enabled?: boolean;
  onToggle?: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-overlay-float-cabbage p-4">
    <div className="flex items-center gap-2">
      <GiftIcon size={IconSize.Small} secondary />
      <span className="font-bold typo-callout">Send the commission on</span>
    </div>
    <p className="text-text-tertiary typo-footnote">
      daily.dev earns about ${pool} when you claim these gifts. Flip this and we
      route that money to the causes in your giveback picks instead of keeping
      it.
    </p>
    <Switch
      inputId="vault-commission-swap"
      name="vault-commission-swap"
      checked={enabled}
      onToggle={onToggle}
      compact={false}
    >
      Give my gift commissions away
    </Switch>
  </div>
);

const categories = [
  { category: OfferCategory.Streaming, on: true },
  { category: OfferCategory.Music, on: true },
  { category: OfferCategory.Productivity, on: true },
  { category: OfferCategory.Lifestyle, on: false },
];

export const VaultPreferences = (): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="font-bold typo-callout">What you want to be offered</span>
    <div className="flex flex-wrap gap-2">
      {categories.map(({ category, on }) => (
        <span
          key={category}
          className={classNames(
            'rounded-10 border px-3 py-1.5 typo-footnote',
            on
              ? 'border-accent-cabbage-default bg-overlay-float-cabbage text-text-primary'
              : 'border-border-subtlest-tertiary text-text-quaternary line-through',
          )}
        >
          {category}
        </span>
      ))}
    </div>
    <p className="text-text-quaternary typo-caption1">
      Picking a gift updates this on its own. &quot;Not my thing&quot; on a card
      switches a category off for 90 days.
    </p>
  </div>
);

export const GiftVault = ({
  entries,
  commissionPool = 42,
  className,
}: {
  entries: VaultEntry[];
  commissionPool?: number;
  className?: string;
}): ReactElement => {
  const ready = entries.filter(
    ({ state }) =>
      state === RewardCardState.Idle || state === RewardCardState.PlusOnly,
  );
  const active = entries.filter(
    ({ state }) => state === RewardCardState.Claimed,
  );
  const gone = entries.filter(({ state }) => state === RewardCardState.Expired);

  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6',
        className,
      )}
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <GiftIcon size={IconSize.Medium} secondary />
          <h2 className="typo-title2">Gift vault</h2>
        </div>
        <p className="text-text-tertiary typo-callout">
          Everything your streaks and badges have earned. Nothing here expires
          without telling you first.
        </p>
      </header>

      {ready.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Ready to claim"
            count={ready.length}
            hint="Soonest expiry first"
          />
          {ready.map((entry) => (
            <EntryRow key={entry.offer.id} entry={entry} />
          ))}
        </section>
      )}

      <CommissionSwap pool={commissionPool} />

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Claimed" count={active.length} />
          {active.map((entry) => (
            <EntryRow key={entry.offer.id} entry={entry} />
          ))}
        </section>
      )}

      {gone.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Gone"
            count={gone.length}
            hint="We warn you three days out"
          />
          {gone.map((entry) => (
            <EntryRow key={entry.offer.id} entry={entry} />
          ))}
        </section>
      )}

      <VaultPreferences />
    </div>
  );
};

export const VaultEmptyState = (): ReactElement => (
  <div className="flex w-full flex-col items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-10 text-center">
    <GiftIcon size={IconSize.XXLarge} className="text-text-disabled" />
    <h2 className="typo-title3">No gifts yet</h2>
    <p className="max-w-[38ch] text-text-tertiary typo-callout">
      Gifts show up here when you hit a milestone: a personal-record streak, a
      top reader badge, a full quest set. Keep reading and one will land.
    </p>
    <Button
      size={ButtonSize.Medium}
      variant={ButtonVariant.Primary}
    >
      Back to my feed
    </Button>
  </div>
);
