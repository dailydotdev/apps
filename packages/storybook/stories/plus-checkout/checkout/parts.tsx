import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  GiftIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type { Cycle } from '../data';
import { features, paddleReminderCountries, paddleReminderUsStates, prices } from '../data';
import type { CheckoutState, Entry } from './model';

/* The pieces of the kept design (Layout 2c with the two-column list, 12 Oct).
   Each one is plain props in, markup out, so it can move into
   packages/shared/src/components/plus/checkout/ unchanged. */

/* ---------------------------------------------------------------- */
/* Copy that depends on the entry point                              */
/* ---------------------------------------------------------------- */

/** Headline + which three features lead (bold, first). Duolingo swaps its first
    paywall bullet per entry point; this is the same idea with one headline. */
export const entryCopy: Record<Entry, { headline: string; lead: string[] }> = {
  default: { headline: 'daily.dev without ads, with a daily brief.', lead: ['brief', 'feeds', 'ads'] },
  ads: { headline: 'daily.dev without ads, with a daily brief.', lead: ['ads', 'brief', 'feeds'] },
  brief: { headline: 'Your brief, every morning, without ads.', lead: ['brief', 'ads', 'feeds'] },
  'custom-feed': { headline: 'Unlimited custom feeds, and no ads.', lead: ['feeds', 'brief', 'ads'] },
  clickbait: { headline: 'Real titles, no clickbait, no ads.', lead: ['clean', 'brief', 'ads'] },
  bookmarks: { headline: 'Folders for your saves, and no ads.', lead: ['folders', 'brief', 'ads'] },
};

/* ---------------------------------------------------------------- */
/* Price                                                             */
/* ---------------------------------------------------------------- */

export const priceFor = (s: Pick<CheckoutState, 'cycle' | 'purchase' | 'sale' | 'seats'>) => {
  if (s.purchase === 'gift') {
    return { big: '$89.99', unit: 'one year of Plus, paid once', struck: undefined as string | undefined, today: '$89.99' };
  }
  if (s.purchase === 'team') {
    const per = s.cycle === 'annual' ? 89.99 : 9.99;
    const today = `$${(per * s.seats).toFixed(2)}`;
    return {
      big: s.cycle === 'annual' ? '$7.49' : '$9.99',
      unit: `per member per month, billed ${s.cycle === 'annual' ? 'yearly' : 'monthly'}`,
      struck: undefined,
      today,
    };
  }
  const p = prices[s.cycle];
  if (s.sale && s.cycle === 'annual') {
    return { big: '$3.75', unit: 'per month for the first year, billed yearly', struck: '$7.49', today: prices.sale.annualToday };
  }
  return {
    big: p.perMonth,
    unit: `per month, billed ${s.cycle === 'annual' ? 'yearly' : 'monthly'}`,
    struck: s.cycle === 'annual' ? '$9.99' : undefined,
    today: p.today,
  };
};

export const PriceBlock = ({ state }: { state: CheckoutState }): ReactElement => {
  if (state.pricesLoading) {
    // isPricesPending: today the radios render as grey blocks; same idea, at the real sizes.
    return (
      <div className="flex items-end gap-2" aria-busy aria-label="Loading prices">
        <ElementPlaceholder className="h-12 w-32 rounded-10" />
        <ElementPlaceholder className="mb-1 h-4 w-44 rounded-4" />
      </div>
    );
  }
  const p = priceFor(state);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-bold tabular-nums typo-mega3 text-text-primary tablet:typo-mega2">{p.big}</span>
      <span className="typo-callout text-text-tertiary">
        {p.unit}
        {p.struck && <> · <s className="text-text-quaternary">{p.struck}</s></>}
      </span>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Cycle choice: two explicit radio buttons (Tsahi, 12 Oct)          */
/* ---------------------------------------------------------------- */

const cycleCopy: Record<Cycle, { title: string; badge?: string }> = {
  annual: { title: 'Annual', badge: '3 months free' },
  monthly: { title: 'Monthly' },
};

/** The price line under each option, from the same state as the headline price and the bill. */
export const cycleSub = (s: Pick<CheckoutState, 'purchase' | 'sale' | 'seats'>, c: Cycle): string => {
  const p = priceFor({ ...s, cycle: c });
  if (s.purchase === 'team') {
    return `${p.big}/mo per member · ${p.today} billed ${c === 'annual' ? 'yearly' : 'monthly'}`;
  }
  if (s.sale && c === 'annual') {
    return `${p.big}/mo · ${p.today} for the first year`;
  }
  return c === 'annual' ? `${p.big}/mo · ${p.today} billed yearly` : `${p.big}/mo · billed monthly`;
};

const cycles: Cycle[] = ['annual', 'monthly'];

export const CycleChoice = ({
  cycle,
  subs,
  onChange,
  disabled,
}: {
  cycle: Cycle;
  subs: Record<Cycle, string>;
  onChange?: (c: Cycle) => void;
  disabled?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-2 tablet:flex-row" role="radiogroup" aria-label="Billing cycle">
    {cycles.map((c) => {
      const on = cycle === c;
      const copy = cycleCopy[c];
      return (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={on}
          // A radio group is one tab stop; arrow keys move and select, like native radios.
          tabIndex={on ? 0 : -1}
          data-cycle={c}
          disabled={disabled}
          onClick={() => onChange?.(c)}
          onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              return;
            }
            e.preventDefault();
            const next = cycles[(cycles.indexOf(c) + 1) % cycles.length];
            onChange?.(next);
            e.currentTarget.parentElement?.querySelector<HTMLElement>(`[data-cycle="${next}"]`)?.focus();
          }}
          className={classNames(
            'flex items-center gap-2.5 rounded-12 border px-3.5 py-2 text-left typo-footnote transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cabbage-default',
            on
              ? 'border-accent-cabbage-default bg-overlay-float-cabbage text-text-primary shadow-[inset_0_0_0_1px_#BA56E1]'
              : 'border-border-subtlest-primary text-text-secondary hover:bg-surface-float',
            disabled && 'cursor-not-allowed opacity-64',
          )}
        >
          <span
            aria-hidden
            className={classNames(
              'grid size-4 flex-none place-items-center rounded-full border-2',
              on ? 'border-accent-cabbage-default' : 'border-text-quaternary',
            )}
          >
            {on && <span className="size-2 rounded-full bg-accent-cabbage-default" />}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-2 font-bold">
              {copy.title}
              {copy.badge && (
                <span className="inline-flex h-5 items-center rounded-6 bg-accent-avocado-default px-1.5 font-bold leading-none typo-caption2 text-[#0F1218]">
                  {copy.badge}
                </span>
              )}
            </span>
            {subs[c] ? (
              <span className="typo-caption1 text-text-tertiary">{subs[c]}</span>
            ) : (
              <ElementPlaceholder className="mt-1 h-3 w-36 rounded-4" />
            )}
          </span>
        </button>
      );
    })}
  </div>
);

/* ---------------------------------------------------------------- */
/* Feature list: all ten, two columns from tablet up (option H)      */
/* ---------------------------------------------------------------- */

/** The checklist grid. From tablet up it fills column by column (Tsahi, 14 Oct):
    items 1–5 down the left, 6–10 down the right. Phones: one column. */
export const checklistGridClass = (count: number): string =>
  classNames(
    'grid grid-cols-1 gap-x-6 gap-y-1.5 tablet:grid-flow-col tablet:grid-cols-2',
    count > 10 ? 'tablet:grid-rows-6' : 'tablet:grid-rows-5',
  );

export const FeatureList = ({ lead = entryCopy.default.lead }: { lead?: string[] }): ReactElement => {
  const ordered = [
    ...lead.map((id) => features.find((f) => f.id === id)!).filter(Boolean),
    ...features.filter((f) => !lead.includes(f.id)),
  ];
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-bold typo-footnote text-text-secondary">Everything in Free, plus:</p>
      <ul className={checklistGridClass(ordered.length)}>
        {ordered.map((f, i) => (
          <li key={f.id} className="flex items-center gap-2 typo-footnote text-text-primary">
            <VIcon size={IconSize.XSmall} className="flex-none text-accent-avocado-default" aria-hidden />
            <span className={i < 3 ? 'font-bold' : undefined}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Bill: due today + what happens next                               */
/* ---------------------------------------------------------------- */

/** Paddle emails a renewal reminder only for annual plans (180+ days) in the EU,
    the UK and 11 US states. Show the row only where it will really arrive.
    Gift is one-time (no renewal); iOS renewals are Apple's. */
export const getsRenewalReminder = (state: Pick<CheckoutState, 'cycle' | 'purchase' | 'country' | 'platform'>): boolean => {
  if (state.cycle !== 'annual' || state.purchase === 'gift' || state.platform === 'ios') {
    return false;
  }
  const [country, usState] = state.country.toUpperCase().split('-');
  if (country === 'US') {
    return !!usState && paddleReminderUsStates.includes(usState);
  }
  return paddleReminderCountries.includes(country);
};

export const timelineFor = (state: CheckoutState): [string, string][] => {
  const p = priceFor(state);
  if (state.purchase === 'gift') {
    return [
      ['Today', `${p.today} charged, once`],
      ['Today', `${state.giftTo?.name ?? 'They'} get Plus, and a pop-up from you next visit`],
      ['8 Oct 2027', 'Plus ends. No renewal, nothing to cancel'],
    ];
  }
  const annual = state.cycle === 'annual';
  const renewAmount = state.purchase === 'team'
    ? p.today
    : state.sale && annual ? '$89.99' : prices[state.cycle].today;
  const points: [string, string][] = [['Today', `${p.today} charged`]];
  if (getsRenewalReminder(state)) {
    // 7 or 30 days before, by location; Paddle doesn't say which → “by” the later date.
    points.push(['By 1 Oct 2027', 'Reminder email before it renews']);
  }
  points.push(annual
    ? ['8 Oct 2027', `Renews at ${renewAmount}, or cancel`]
    : ['8 Nov 2026', `Renews at ${renewAmount}, or cancel`]);
  return points;
};

export const BillSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4" aria-hidden>
    <div className="flex justify-between">
      <ElementPlaceholder className="h-3 w-20 rounded-4" />
      <ElementPlaceholder className="h-3 w-14 rounded-4" />
    </div>
    <ElementPlaceholder className="h-3 w-3/4 rounded-4" />
    <ElementPlaceholder className="h-3 w-2/3 rounded-4" />
  </div>
);

/** Step 2 on phones: what you're paying for, collapsed like Stripe Checkout's
    mobile summary (“Details” opens the full bill). “Change” goes back to step 1. */
export const OrderSummary = ({ state, onEdit }: { state: CheckoutState; onEdit?: () => void }): ReactElement => {
  const [open, setOpen] = React.useState(false);
  const p = priceFor(state);
  const points = timelineFor(state);
  const [when, what] = points[points.length - 1];
  const title =
    state.purchase === 'gift'
      ? `A year of Plus for ${state.giftTo?.name ?? 'them'}`
      : state.purchase === 'team'
        ? `Plus for ${state.seats} members · ${state.cycle === 'annual' ? 'Annual' : 'Monthly'}`
        : `daily.dev Plus · ${state.cycle === 'annual' ? 'Annual' : 'Monthly'}`;
  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-bold typo-callout text-text-primary">{title}</span>
          <span className="tabular-nums typo-footnote text-text-tertiary">
            {state.purchase === 'gift' ? 'Paid once · no renewal' : `${when} · ${what}`}
          </span>
        </span>
        <button type="button" onClick={onEdit} className="flex-none typo-footnote text-text-secondary underline underline-offset-2 hover:text-text-primary">
          Change
        </button>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="typo-footnote text-text-tertiary">Due today</span>
        <b className="tabular-nums typo-title3 text-text-primary">{p.today}</b>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="self-start typo-footnote text-text-tertiary hover:text-text-primary"
      >
        {open ? 'Hide details ▴' : 'Details ▾'}
      </button>
      {open && <Bill state={state} />}
    </div>
  );
};

export const Bill = ({
  state,
  tax = 'Tax added at checkout if applicable',
}: {
  state: CheckoutState;
  tax?: string;
}): ReactElement => {
  const p = priceFor(state);
  const points = timelineFor(state);
  return (
    <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4 typo-footnote tabular-nums">
      <div className="flex justify-between text-text-tertiary">
        <span>Due today</span>
        <b className="text-text-primary">{p.today}</b>
      </div>
      <ol className="relative flex flex-col gap-2 pl-4" aria-label="What happens next">
        <span className="absolute bottom-2 left-[0.3125rem] top-2 w-px bg-border-subtlest-tertiary" aria-hidden />
        {points.map(([when, what], i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className="relative flex gap-3">
            <span
              aria-hidden
              className={classNames(
                'absolute -left-4 top-1.5 size-[0.6875rem] rounded-full border-2 border-background-default',
                i === 0 ? 'bg-accent-cabbage-default' : 'bg-text-quaternary',
              )}
            />
            <span className="w-24 flex-none text-text-tertiary">{when}</span>
            <span className={classNames('min-w-0 flex-1', i === 0 ? 'text-text-primary' : 'text-text-secondary')}>{what}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 typo-caption1 text-text-quaternary">
        {state.platform === 'ios' ? (
          // App Store purchases: Apple bills, taxes and refunds under its own rules.
          <span className="min-w-0 flex-1">Billed by Apple · refunds through Apple</span>
        ) : (
          <>
            <span className="min-w-0 flex-1">{tax} · 30-day refund</span>
            <a href="#refund" className="flex-none underline underline-offset-2">Refund policy</a>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Small pieces                                                      */
/* ---------------------------------------------------------------- */

export const BackButton = ({ onClick }: { onClick?: () => void }): ReactElement => (
  <button
    type="button"
    aria-label="Back"
    onClick={onClick}
    className="grid size-8 flex-none place-items-center rounded-10 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
  >
    <ArrowIcon className="-rotate-90" size={IconSize.Small} />
  </button>
);

export const OtherPurchases = ({
  purchase,
  onPurchase,
  disabled,
}: {
  purchase: CheckoutState['purchase'];
  onPurchase?: (p: CheckoutState['purchase']) => void;
  disabled?: boolean;
}): ReactElement => (
  <p className="flex flex-wrap gap-x-4 gap-y-1 typo-caption1 text-text-tertiary">
    {purchase !== 'personal' && (
      <button type="button" disabled={disabled} onClick={() => onPurchase?.('personal')} className="underline underline-offset-2 hover:text-text-primary disabled:opacity-64">
        Buy Plus for yourself
      </button>
    )}
    {purchase !== 'team' && (
      <button type="button" disabled={disabled} onClick={() => onPurchase?.('team')} className="underline underline-offset-2 hover:text-text-primary disabled:opacity-64">
        Buying for a team?
      </button>
    )}
    {purchase !== 'gift' && (
      <button type="button" disabled={disabled} onClick={() => onPurchase?.('gift')} className="underline underline-offset-2 hover:text-text-primary disabled:opacity-64">
        Give Plus as a gift
      </button>
    )}
  </p>
);

export const SaleStrip = (): ReactElement => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-12 border border-accent-cheese-default bg-overlay-float-cheese px-4 py-2 typo-footnote text-text-primary">
    <span>
      <b>Sale: 50% off your first year.</b> Applied, nothing to type.
    </span>
    <span className="rounded-6 border border-dashed border-accent-cheese-default px-2 py-0.5 font-mono typo-caption1">
      {prices.sale.code}
    </span>
  </div>
);

export const GiftRecipient = ({ name, username }: { name: string; username: string }): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3.5 py-2.5">
    <span className="grid size-8 flex-none place-items-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
      <GiftIcon secondary size={IconSize.Small} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="typo-caption1 text-text-tertiary">A year of Plus for</span>
      <span className="truncate font-bold typo-footnote text-text-primary">
        {name} <span className="font-normal text-text-tertiary">@{username}</span>
      </span>
    </span>
    <button type="button" className="typo-caption1 text-text-tertiary underline underline-offset-2">Change</button>
  </div>
);

export const SeatStepper = ({ seats, onSeats, disabled }: { seats: number; onSeats?: (n: number) => void; disabled?: boolean }): ReactElement => (
  <div className="flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3.5 py-2">
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="font-bold typo-footnote text-text-primary">Team members</span>
      <span className="typo-caption1 text-text-tertiary">Each member gets Plus. Add or remove seats later.</span>
    </span>
    <span className="flex flex-none items-center gap-1">
      <button type="button" aria-label="Remove a seat" disabled={disabled || seats <= 1} onClick={() => onSeats?.(Math.max(1, seats - 1))} className="grid size-8 place-items-center rounded-10 border border-border-subtlest-tertiary text-text-secondary disabled:opacity-32">
        <MinusIcon size={IconSize.XSmall} />
      </button>
      <span className="w-8 text-center font-bold tabular-nums typo-callout" aria-live="polite">{seats}</span>
      <button type="button" aria-label="Add a seat" disabled={disabled} onClick={() => onSeats?.(seats + 1)} className="grid size-8 place-items-center rounded-10 border border-border-subtlest-tertiary text-text-secondary disabled:opacity-32">
        <PlusIcon size={IconSize.XSmall} />
      </button>
    </span>
  </div>
);

export const PanelHeader = ({ title = 'Payment', secure = true }: { title?: string; secure?: boolean }): ReactElement => (
  <div className="flex items-center justify-between typo-footnote text-text-tertiary">
    <span className="font-bold text-text-primary">{title}</span>
    {secure && (
      <span className="flex items-center gap-1">
        <LockIcon size={IconSize.XSmall} /> Secure · Paddle
      </span>
    )}
  </div>
);

export const RefundNote = ({ children }: { children?: ReactNode }): ReactElement => (
  <div id="refund" className="flex flex-col gap-1 rounded-12 bg-surface-float px-4 py-3 typo-footnote">
    <span className="font-bold text-text-primary">Try Plus for 30 days.</span>
    <span className="text-text-tertiary">
      {children ?? 'Full refund if it isn’t for you, no questions asked. You’ll still see the occasional sponsored squad; every ad in the feed and on posts is gone.'}
    </span>
  </div>
);
