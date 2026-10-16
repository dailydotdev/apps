import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  GiftIcon,
  GitHubIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  MinusIcon,
  PlusIcon,
  VIcon,
} from '../../icons';
import { IconSize } from '../../Icon';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import type { Cycle } from './checkoutData';

/* The plain building blocks of the checkout. Every number comes in as a prop,
   already formatted from the live Paddle preview (see PlusCheckoutV2). */

const cycles: Cycle[] = ['annual', 'monthly'];

export type CycleOption = { title: string; sub?: string; badge?: string };

/** Annual / Monthly as one radio group: one tab stop, arrow keys move and select. */
export const PlusCycleChoice = ({
  cycle,
  options,
  onChange,
  disabled,
}: {
  cycle: Cycle;
  options: Record<Cycle, CycleOption>;
  onChange: (cycle: Cycle) => void;
  disabled?: boolean;
}): ReactElement => (
  <div
    className="flex flex-col gap-2 tablet:flex-row tablet:flex-wrap"
    role="radiogroup"
    aria-label="Billing cycle"
  >
    {cycles.map((c) => {
      const on = cycle === c;
      const option = options[c];
      return (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={on}
          tabIndex={on ? 0 : -1}
          data-cycle={c}
          disabled={disabled}
          onClick={() => onChange(c)}
          onKeyDown={(event) => {
            if (
              !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
                event.key,
              )
            ) {
              return;
            }
            event.preventDefault();
            const next = cycles[(cycles.indexOf(c) + 1) % cycles.length];
            onChange(next);
            event.currentTarget.parentElement
              ?.querySelector<HTMLElement>(`[data-cycle="${next}"]`)
              ?.focus();
          }}
          className={classNames(
            'flex items-center gap-2.5 rounded-12 border px-3.5 py-2 text-left transition-colors typo-footnote',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cabbage-default',
            on
              ? 'border-accent-cabbage-default bg-overlay-float-cabbage text-text-primary shadow-[inset_0_0_0_0.0625rem_var(--theme-accent-cabbage-default)]'
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
            {on && (
              <span className="size-2 rounded-full bg-accent-cabbage-default" />
            )}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-2 font-bold">
              {option.title}
              {option.badge && (
                <span className="inline-flex h-5 items-center rounded-6 bg-accent-avocado-default px-1.5 font-bold leading-none text-surface-invert typo-caption2">
                  {option.badge}
                </span>
              )}
            </span>
            {option.sub ? (
              <span className="text-text-tertiary typo-caption1">
                {option.sub}
              </span>
            ) : (
              <ElementPlaceholder className="mt-1 h-3 w-36 rounded-4" />
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export const PlusPriceBlock = ({
  big,
  unit,
  struck,
}: {
  big?: string;
  unit?: string;
  struck?: string;
}): ReactElement =>
  big ? (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-bold tabular-nums text-text-primary typo-mega3 tablet:typo-mega2">
        {big}
      </span>
      <span className="text-text-tertiary typo-callout">
        {unit}
        {struck && (
          <>
            {' · '}
            <s className="text-text-quaternary">{struck}</s>
          </>
        )}
      </span>
    </div>
  ) : (
    <div className="flex items-end gap-2" aria-busy aria-label="Loading prices">
      <ElementPlaceholder className="h-12 w-32 rounded-10" />
      <ElementPlaceholder className="mb-1 h-4 w-44 rounded-4" />
    </div>
  );

export type BillPoint = [when: string, what: string];

export const PlusBill = ({
  today,
  points,
  ios,
}: {
  today?: string;
  points: BillPoint[];
  ios?: boolean;
}): ReactElement => {
  if (!today) {
    return (
      <div
        className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4"
        aria-hidden
      >
        <ElementPlaceholder className="h-3 w-20 rounded-4" />
        <ElementPlaceholder className="h-3 w-3/4 rounded-4" />
        <ElementPlaceholder className="h-3 w-2/3 rounded-4" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4 tabular-nums typo-footnote">
      <div className="flex justify-between text-text-tertiary">
        <span>Due today</span>
        <b className="text-text-primary">{today}</b>
      </div>
      <ol
        className="relative flex flex-col gap-2 pl-4"
        aria-label="What happens next"
      >
        <span
          aria-hidden
          className="absolute bottom-2 left-[0.3125rem] top-2 w-px bg-border-subtlest-tertiary"
        />
        {points.map(([when, what], index) => (
          <li key={`${when}-${what}`} className="relative flex gap-3">
            <span
              aria-hidden
              className={classNames(
                'absolute -left-4 top-1.5 size-[0.6875rem] rounded-full border-2 border-background-default',
                index === 0
                  ? 'bg-accent-cabbage-default'
                  : 'bg-text-quaternary',
              )}
            />
            <span className="w-24 flex-none text-text-tertiary">{when}</span>
            <span
              className={classNames(
                'min-w-0 flex-1',
                index === 0 ? 'text-text-primary' : 'text-text-secondary',
              )}
            >
              {what}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-text-quaternary typo-caption1">
        {ios ? (
          <span className="min-w-0 flex-1">
            Billed by Apple · refunds through Apple
          </span>
        ) : (
          <>
            <span className="min-w-0 flex-1">
              Tax added at checkout if applicable · 30-day refund
            </span>
            <a
              href="#plus-refund"
              className="flex-none underline underline-offset-2"
            >
              Refund policy
            </a>
          </>
        )}
      </div>
    </div>
  );
};

/** Phones, step 2: what you're paying for, collapsed like Stripe Checkout's
    mobile summary. “Change” goes back to step 1, “Details” opens the bill. */
export const PlusOrderSummary = ({
  title,
  renewal,
  today,
  onEdit,
  children,
}: {
  title: string;
  renewal: string;
  today?: string;
  onEdit: () => void;
  children: ReactNode;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-callout">
            {title}
          </span>
          <span className="tabular-nums text-text-tertiary typo-footnote">
            {renewal}
          </span>
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="flex-none text-text-secondary underline underline-offset-2 typo-footnote hover:text-text-primary"
        >
          Change
        </button>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-tertiary typo-footnote">Due today</span>
        <b className="tabular-nums text-text-primary typo-title3">{today}</b>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="self-start text-text-tertiary typo-footnote hover:text-text-primary"
      >
        {open ? 'Hide details ▴' : 'Details ▾'}
      </button>
      {open && children}
    </div>
  );
};

export const PlusSeatStepper = ({
  seats,
  onSeats,
  disabled,
}: {
  seats: number;
  onSeats: (seats: number) => void;
  disabled?: boolean;
}): ReactElement => (
  <div className="flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3.5 py-2">
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="font-bold text-text-primary typo-footnote">
        Team members
      </span>
      <span className="text-text-tertiary typo-caption1">
        Each member gets Plus. Add or remove seats later.
      </span>
    </span>
    <span className="flex flex-none items-center gap-1">
      <button
        type="button"
        aria-label="Remove a seat"
        disabled={disabled || seats <= 1}
        onClick={() => onSeats(Math.max(1, seats - 1))}
        className="grid size-8 place-items-center rounded-10 border border-border-subtlest-tertiary text-text-secondary disabled:opacity-32"
      >
        <MinusIcon size={IconSize.XSmall} />
      </button>
      <span
        className="w-8 text-center font-bold tabular-nums typo-callout"
        aria-live="polite"
      >
        {seats}
      </span>
      <button
        type="button"
        aria-label="Add a seat"
        disabled={disabled}
        onClick={() => onSeats(seats + 1)}
        className="grid size-8 place-items-center rounded-10 border border-border-subtlest-tertiary text-text-secondary disabled:opacity-32"
      >
        <PlusIcon size={IconSize.XSmall} />
      </button>
    </span>
  </div>
);

export const PlusGiftRecipient = ({
  name,
  username,
  onChange,
}: {
  name: string;
  username: string;
  onChange: () => void;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3.5 py-2.5">
    <span className="grid size-8 flex-none place-items-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
      <GiftIcon secondary size={IconSize.Small} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="text-text-tertiary typo-caption1">
        A year of Plus for
      </span>
      <span className="truncate font-bold text-text-primary typo-footnote">
        {name}{' '}
        <span className="font-normal text-text-tertiary">@{username}</span>
      </span>
    </span>
    <button
      type="button"
      onClick={onChange}
      className="text-text-tertiary underline underline-offset-2 typo-caption1"
    >
      Change
    </button>
  </div>
);

export const PlusPanelHeader = ({
  title = 'Payment',
  secure = true,
}: {
  title?: string;
  secure?: boolean;
}): ReactElement => (
  <div className="flex items-center justify-between text-text-tertiary typo-footnote">
    <span className="font-bold text-text-primary">{title}</span>
    {secure && (
      <span className="flex items-center gap-1">
        <LockIcon size={IconSize.XSmall} /> Secure · Paddle
      </span>
    )}
  </div>
);

export const PlusRefundNote = (): ReactElement => (
  <div
    id="plus-refund"
    className="flex flex-col gap-1 rounded-12 bg-surface-float px-4 py-3 typo-footnote"
  >
    <span className="font-bold text-text-primary">Try Plus for 30 days.</span>
    <span className="text-text-tertiary">
      Full refund if it isn’t for you, no questions asked. You’ll still see the
      occasional sponsored squad; every ad in the feed and on posts is gone.
    </span>
  </div>
);

const AuthButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-12 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary font-bold text-text-primary typo-callout hover:bg-surface-float"
  >
    {icon}
    {label}
  </button>
);

/** Signed out: Paddle needs the account's email, so sign-in comes first. Every
    button opens the app's login; after it the person is back on this page. */
export const PlusSignInPanel = ({
  today,
  onSignIn,
}: {
  today?: string;
  onSignIn: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <PlusPanelHeader title="Sign in to subscribe" secure={false} />
    <p className="text-text-secondary typo-callout">
      Plus is tied to your daily.dev account. Sign in or create one, and you’ll
      come right back here with your plan selected
      {today ? ` — ${today} today` : ''}.
    </p>
    <div className="flex flex-col gap-2">
      <AuthButton
        icon={<GoogleIcon size={IconSize.Small} />}
        label="Continue with Google"
        onClick={onSignIn}
      />
      <AuthButton
        icon={<GitHubIcon size={IconSize.Small} />}
        label="Continue with GitHub"
        onClick={onSignIn}
      />
      <AuthButton
        icon={<MailIcon size={IconSize.Small} />}
        label="Continue with email"
        onClick={onSignIn}
      />
    </div>
  </div>
);

export const PlusBackButton = ({
  onClick,
}: {
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-label="Back"
    onClick={onClick}
    className="grid size-8 flex-none place-items-center rounded-10 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
  >
    <ArrowIcon className="-rotate-90" size={IconSize.Small} />
  </button>
);

export const PlusOtherPurchases = ({
  showPersonal,
  showTeam,
  showGift,
  onPersonal,
  onTeam,
  onGift,
  disabled,
}: {
  showPersonal: boolean;
  showTeam: boolean;
  showGift: boolean;
  onPersonal: () => void;
  onTeam: () => void;
  onGift: () => void;
  disabled?: boolean;
}): ReactElement => {
  const link =
    'underline underline-offset-2 hover:text-text-primary disabled:opacity-64';
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-text-tertiary typo-caption1">
      {showPersonal && (
        <button
          type="button"
          disabled={disabled}
          onClick={onPersonal}
          className={link}
        >
          Buy Plus for yourself
        </button>
      )}
      {showTeam && (
        <button
          type="button"
          disabled={disabled}
          onClick={onTeam}
          className={link}
        >
          Buying for a team?
        </button>
      )}
      {showGift && (
        <button
          type="button"
          disabled={disabled}
          onClick={onGift}
          className={link}
        >
          Give Plus as a gift
        </button>
      )}
    </p>
  );
};

export const PlusCheck = (): ReactElement => (
  <VIcon
    size={IconSize.XSmall}
    className="flex-none text-accent-avocado-default"
    aria-hidden
  />
);
