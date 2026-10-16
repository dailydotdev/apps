import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  AppleIcon,
  CreditCardIcon,
  GoogleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type { Method, Phase } from './model';

/* A stand-in for Paddle's one-page inline frame — NOT something we build.
   Drawn from the production frame (screenshot of app.daily.dev/plus, Oct 2026):
   method tiles in a row, Name on card, one joined card block, the pay button,
   Paddle's "$X now, then …" line and the merchant-of-record footer. Email and
   country are absent because production prefills them (customer.email,
   address.countryCode). What changes versus production is only what the
   Paddle dashboard styling and open() settings control:
   - button white with dark text (was pink), radius 10
   - selected/focus border cabbage #BA56E1 (was green)
   - inputs on surface-float with hairline borders, frame padding off,
     transparent frame background (the page surface shows through)
   - "Add VAT number" off for personal (showAddTaxId), "Add discount code"
     off unless a sale is live (showAddDiscounts), "Save my card" off
     (saved payment methods disabled in the dashboard).
   Everything inside is Paddle's: labels, order, button text, footer. */

/** chrome → Google Pay tile, safari → Apple Pay tile, other → card + PayPal only (production screenshot). */
export type Browser = 'chrome' | 'safari' | 'other';

/** 'production' = today's dashboard styling (pink button, green selection, VAT +
    discount links, save-card box) for the before/after; 'new' = the proposed styling. */
export type FrameLook = 'new' | 'production';

const Tile = ({ on, icon, label, onClick, disabled, look = 'new' }: { on: boolean; icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean; look?: FrameLook }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={classNames(
      'flex h-14 flex-col items-start justify-center gap-1 rounded-10 border px-3 text-left typo-footnote',
      on && look === 'production' && 'border-accent-avocado-default bg-surface-float text-text-primary shadow-[inset_0_0_0_1px_#39E58C]',
      on && look === 'new' && 'border-accent-cabbage-default text-text-primary shadow-[inset_0_0_0_1px_#BA56E1]',
      on
        ? ''
        : 'border-border-subtlest-tertiary text-text-tertiary hover:border-border-subtlest-secondary',
    )}
  >
    <span className="flex h-5 items-center">{icon}</span>
    {label}
  </button>
);

const Input = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={classNames('flex h-11 items-center justify-between gap-2 border-border-subtlest-tertiary bg-surface-float px-3 typo-callout text-text-quaternary', className)}>
    {children}
  </span>
);

const Brands = (): ReactElement => (
  <span className="flex gap-0.5" aria-hidden>
    {['#1A1F71', '#EB001B', '#2E77BC', '#F58220'].map((c) => (
      <i key={c} className="inline-block h-3.5 w-5 rounded-2" style={{ background: c, opacity: 0.85 }} />
    ))}
  </span>
);

const PayPalMark = () => <i className="inline-block h-3.5 w-4 rounded-2" style={{ background: '#1d6fd3' }} aria-hidden />;

export const PaddleFrameMock = ({
  method: requestedMethod = 'card',
  onMethod,
  phase = 'ready',
  browser = 'chrome',
  express = false,
  today = '$89.99',
  then = '$89.99/year from 8 Oct 2027',
  discountField = false,
  vatField = false,
  onPay,
  onRetry,
  zipField = false,
  look = 'new',
}: {
  look?: FrameLook;
  method?: Method;
  onMethod?: (m: Method) => void;
  phase?: Phase;
  /** Wallet tiles depend on the browser: Apple Pay on Safari, Google Pay on Chrome/Android. */
  browser?: Browser;
  /** Paddle's express variant (phones): wallet buttons first, card beneath. */
  express?: boolean;
  today?: string;
  then?: string;
  discountField?: boolean;
  vatField?: boolean;
  onPay?: () => void;
  onRetry?: () => void;
  /** Paddle asks for a postcode in countries that use one (US, CA, …). */
  zipField?: boolean;
}): ReactElement => {
  if (phase === 'blocked') {
    // Ours, not Paddle's: shown when checkout.loaded never fires (~10s) — most
    // often an ad or tracker blocker stopping paddle.js. Production today
    // leaves an empty box.
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 typo-footnote">
        <b className="text-text-primary">The payment form didn’t load.</b>
        <span className="text-text-tertiary">An ad or privacy blocker can stop our payment partner, Paddle. Allow paddle.com for this page, then try again. Nothing was charged.</span>
        <button type="button" onClick={onRetry} className="h-10 self-start rounded-10 border border-border-subtlest-tertiary px-4 font-bold text-text-primary hover:bg-surface-hover">Try again</button>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col gap-3" aria-busy aria-label="Loading payment form">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => <ElementPlaceholder key={i} className="h-14 rounded-10" />)}
        </div>
        <ElementPlaceholder className="h-3 w-24 rounded-4" />
        <ElementPlaceholder className="h-11 rounded-10" />
        <ElementPlaceholder className="h-3 w-24 rounded-4" />
        <ElementPlaceholder className="h-[5.5rem] rounded-10" />
        <ElementPlaceholder className="h-12 rounded-10" />
        <ElementPlaceholder className="mx-auto h-3 w-3/4 rounded-4" />
        <ElementPlaceholder className="mx-auto h-3 w-1/2 rounded-4" />
      </div>
    );
  }

  // A wallet the browser doesn't offer can't stay selected: fall back to card.
  const method: Method = requestedMethod === 'apple' && browser === 'other' ? 'card' : requestedMethod;
  const wallet = browser === 'safari'
    ? { id: 'apple' as Method, label: 'Apple Pay', icon: <AppleIcon size={IconSize.Small} /> }
    : { id: 'apple' as Method, label: 'Google Pay', icon: <GoogleIcon size={IconSize.Small} /> };

  const processing = phase === 'processing' || phase === 'authenticating';
  const payLabel = processing ? 'Processing…' : 'Subscribe now';

  const button = (
    <button
      type="button"
      onClick={onPay}
      disabled={processing}
      className={classNames('flex h-12 items-center justify-center gap-2 rounded-10 font-bold typo-callout disabled:opacity-64', look === 'production' ? 'bg-accent-bacon-default text-[#fff]' : 'bg-[#fff] text-[#0F1218]')}
    >
      {processing && <span className="size-4 animate-spin rounded-full border-2 border-[#0F1218] border-t-transparent" aria-hidden />}
      {method === 'paypal' && !processing ? 'Continue with PayPal' : method === 'apple' && !processing ? `Pay with ${wallet.label}` : payLabel}
    </button>
  );

  const footer = (
    <div className="flex flex-col gap-2 text-center">
      <p className="typo-footnote text-text-secondary">{today} now, then {then}.</p>
      <p className="typo-caption2 text-text-quaternary">
        Sold by <b className="font-bold text-text-tertiary">paddle</b> 30 Old Bailey, London, EC4M 7AU, UK. Provided by Daily Dev Ltd.{' '}
        <span className="underline">Support</span> <span className="underline">Terms</span> <span className="underline">Privacy</span>
      </p>
    </div>
  );

  const challenge = phase === 'authenticating' && (
    // Paddle's, not ours: the issuing bank's 3-D Secure step (popup or in-frame). Drawn generically.
    <div className="flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 text-center typo-footnote">
      <b className="text-text-primary">Confirm with your bank</b>
      <span className="text-text-tertiary">Approve the payment in your banking app or enter the code your bank sent.</span>
      <span className="mt-1 size-5 animate-spin rounded-full border-2 border-text-tertiary border-t-transparent" aria-hidden />
    </div>
  );

  const declined = phase === 'declined' && (
    <div role="alert" className="rounded-10 border border-accent-ketchup-default bg-overlay-float-ketchup px-3 py-2 typo-footnote text-text-primary">
      Your card was declined. Try another card or PayPal.
    </div>
  );

  const card = (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="typo-footnote text-text-secondary">Name on card</span>
        <Input className="rounded-10 border">Cardholder name</Input>
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="typo-footnote text-text-secondary">Card details</span>
        <div className="overflow-hidden rounded-10 border border-border-subtlest-tertiary">
          <Input className="border-b">xxxx xxxx xxxx xxxx <Brands /></Input>
          <div className="grid grid-cols-2">
            <Input className="border-r">MM / YY</Input>
            <Input>CVV</Input>
          </div>
        </div>
      </div>
      {zipField && (
        <label className="flex flex-col gap-1.5">
          <span className="typo-footnote text-text-secondary">ZIP code</span>
          <Input className="rounded-10 border">12345</Input>
        </label>
      )}
    </>
  );

  const saveCard = look === 'production' && (
    <span className="flex items-start gap-3 rounded-10 bg-surface-float px-3 py-3 typo-footnote text-text-secondary">
      <span className="mt-0.5 size-4 flex-none rounded-4 border border-border-subtlest-secondary" aria-hidden />
      <span className="min-w-0 flex-1"><b className="text-text-primary">Save my card details for a faster checkout</b> with Daily Dev Ltd next time</span>
    </span>
  );

  const extras = (vatField || discountField) && (
    <div className="flex flex-col border-y border-border-subtlest-tertiary typo-footnote text-text-link">
      {vatField && <span className="flex justify-between py-2.5">Add VAT number <span>+</span></span>}
      {discountField && <span className={classNames('flex justify-between py-2.5', vatField && 'border-t border-border-subtlest-tertiary')}>Add discount code <span>+</span></span>}
    </div>
  );

  if (express) {
    return (
      <div className="flex flex-col gap-3">
        {declined}
      {challenge}
        <button type="button" onClick={onPay} className="flex h-12 items-center justify-center gap-1 rounded-10 bg-[#fff] font-bold typo-callout text-[#000]">
          {wallet.icon} Pay
        </button>
        <button type="button" onClick={onPay} className="flex h-12 items-center justify-center gap-1.5 rounded-10 bg-[#FFC439] font-bold typo-callout text-[#003087]">
          PayPal
        </button>
        <div className="flex items-center gap-2 typo-caption1 text-text-quaternary">
          <span className="h-px flex-1 bg-border-subtlest-tertiary" /> or pay by card <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        </div>
        {card}
        {extras}
        {button}
        {footer}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {declined}
      {challenge}
      <div className={classNames('grid gap-2', browser === 'other' ? 'grid-cols-2' : 'grid-cols-3')} role="tablist" aria-label="Payment method">
        <Tile look={look} disabled={processing} on={method === 'card'} onClick={() => onMethod?.('card')} icon={<CreditCardIcon size={IconSize.Small} />} label="Card" />
        <Tile look={look} disabled={processing} on={method === 'paypal'} onClick={() => onMethod?.('paypal')} icon={<PayPalMark />} label="PayPal" />
        {browser !== 'other' && <Tile look={look} disabled={processing} on={method === 'apple'} onClick={() => onMethod?.('apple')} icon={wallet.icon} label={wallet.label} />}
      </div>
      {method === 'card' && card}
      {method !== 'card' && (
        <p className="rounded-10 bg-surface-float px-3 py-3 typo-footnote text-text-tertiary">
          {method === 'paypal' ? 'You’ll confirm in a PayPal window, then come back here.' : `${wallet.label} opens your device’s payment sheet.`}
        </p>
      )}
      {extras}
      {saveCard}
      {button}
      {footer}
    </div>
  );
};
