import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  BriefIcon,
  GitHubIcon,
  GoogleIcon,
  MailIcon,
  SitesIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LogoWithPlus } from '@dailydotdev/shared/src/components/Logo';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { PanelHeader } from './parts';

/* What the payment half shows when the frame can't (or shouldn't) load.
   The plan half stays identical in every one of these, so the decision the
   person already made is never lost. */

const AuthButton = ({ icon, label }: { icon: ReactElement; label: string }) => (
  <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary font-bold typo-callout text-text-primary hover:bg-surface-float">
    {icon}
    {label}
  </button>
);

/** Signed out. Paddle needs an account email, so sign-in comes first — the same
    order 14 of 15 subscription pages we checked use (price public, account at the CTA).
    In production this opens the existing auth modal with a return to /plus?cycle=… */
export const SignInPanel = ({ today }: { today: string }): ReactElement => (
  <div className="flex flex-col gap-4">
    <PanelHeader title="Sign in to subscribe" secure={false} />
    <p className="typo-callout text-text-secondary">
      Plus is tied to your daily.dev account. Sign in or create one, and you’ll come right back here with your plan selected — {today} today.
    </p>
    <div className="flex flex-col gap-2">
      <AuthButton icon={<GoogleIcon size={IconSize.Small} />} label="Continue with Google" />
      <AuthButton icon={<GitHubIcon size={IconSize.Small} />} label="Continue with GitHub" />
      <AuthButton icon={<MailIcon size={IconSize.Small} />} label="Continue with email" />
    </div>
    <p className="typo-caption1 text-text-quaternary">Already have an account? Same buttons. Payment details come next, on this page.</p>
  </div>
);

/** gifted: production (PlusPlus) hides Manage subscription for a gifted Plus — there is no subscription to manage. */
export const AlreadyPlusPanel = ({ gifted }: { gifted?: boolean }): ReactElement => (
  <div className="flex flex-col gap-4">
    <PanelHeader title="You’re on Plus" secure={false} />
    <div className="flex flex-col gap-1 rounded-12 border border-accent-avocado-default bg-overlay-float-avocado px-4 py-3 typo-footnote">
      <span className="font-bold text-text-primary">{gifted ? 'Gifted by @alexr · until 8 Oct 2027' : 'Annual plan · renews 8 Oct 2027'}</span>
      <span className="text-text-tertiary">
        {gifted ? 'Everything on the left is already on. No renewal and nothing to cancel.' : 'Everything on the left is already on. Change plan, update the card or cancel from billing.'}
      </span>
    </div>
    <div className="flex flex-col gap-2">
      {!gifted && <button type="button" className="h-12 rounded-12 bg-[#fff] font-bold typo-callout text-[#0F1218]">Manage subscription</button>}
      <button type="button" className="h-12 rounded-12 border border-border-subtlest-tertiary font-bold typo-callout text-text-primary">Give Plus as a gift</button>
    </div>
  </div>
);

export const UnavailablePanel = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <PanelHeader title="Payment" secure={false} />
    <div className="flex items-start gap-3 rounded-12 bg-surface-float px-4 py-3">
      <SitesIcon size={IconSize.Medium} className="flex-none text-text-tertiary" />
      <span className="flex min-w-0 flex-1 flex-col gap-1 typo-footnote">
        <b className="text-text-primary">Plus isn’t available in your region yet.</b>
        <span className="text-text-tertiary">Our payment provider can’t sell here. Nothing on your account changes.</span>
      </span>
    </div>
  </div>
);

/** iOS app: StoreKit, not Paddle (PaymentContextProvider picks StoreKitSubProvider
    when iOSSupportsPlusPurchase()). The button posts iap-subscription-request;
    Apple's own sheet takes the payment. No gift, no team, no sale on iOS. */
export const AppStorePanel = ({ today, cycle, onPay }: { today: string; cycle: 'annual' | 'monthly'; onPay?: () => void }): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between typo-footnote text-text-tertiary">
      <span className="font-bold text-text-primary">Payment</span>
      <span>Billed by Apple</span>
    </div>
    <button type="button" onClick={onPay} className="h-12 rounded-12 bg-[#fff] font-bold typo-callout text-[#0F1218]">Subscribe · {today}</button>
    <p className="typo-footnote text-text-tertiary">
      Confirm with Face ID in Apple’s sheet. {cycle === 'annual' ? 'Renews yearly' : 'Renews monthly'} until you cancel in Settings › Apple ID › Subscriptions.
    </p>
  </div>
);

/** After checkout.completed → /plus/success. One next action per purchase:
    personal → the Briefing (the feature members use most, the one buyers
    touched first); team → invite people; gift → nothing to do.
    Today production shows one generic “Payment successful” for all of them
    (webapp/pages/plus/success.tsx; replica in today.tsx). */
export type SuccessKind = 'personal' | 'gift' | 'team' | 'ios';

const successCopy = (kind: SuccessKind, cycle: 'annual' | 'monthly', gift?: string, seats = 3) => {
  const renews = cycle === 'annual' ? 'renews 8 Oct 2027' : 'renews 8 Nov 2026';
  switch (kind) {
    case 'gift':
      return {
        title: `Plus is on its way to ${gift ?? 'them'}.`,
        body: 'They’ll see a “you got Plus” pop-up from you the next time they open daily.dev. One year, no renewal. Paddle emails you the receipt.',
        primary: 'Back to daily.dev',
      };
    case 'team':
      return {
        title: 'Your team is on Plus.',
        body: `${seats} seats · ${renews}. Paddle emails the receipt to dana@company.dev. Next: invite your team, each member gets every Plus feature.`,
        primary: 'Invite your team',
      };
    case 'ios':
      return {
        title: 'Welcome to Plus.',
        body: `Ads are off and every Plus feature is on. Apple sends your receipt · ${renews}. Manage it in Settings › Apple ID › Subscriptions.`,
        primary: 'Choose a time',
      };
    default:
      return {
        title: 'Welcome to Plus.',
        body: `Ads are off and every Plus feature is on. Paddle emails your receipt to dana@company.dev · ${renews}.`,
        primary: 'Choose a time',
      };
  }
};

export const SuccessPage = ({
  cycle = 'annual',
  gift,
  kind = gift ? 'gift' : 'personal',
  seats,
  children,
}: {
  cycle?: 'annual' | 'monthly';
  gift?: string;
  kind?: SuccessKind;
  seats?: number;
  children?: ReactNode;
}): ReactElement => {
  const copy = successCopy(kind, cycle, gift, seats);
  const briefing = kind === 'personal' || kind === 'ios';
  return (
    <SettingsContext.Provider value={{ themeMode: 'dark', loadedSettings: true } as never}>
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-background-default px-4 py-12 text-text-primary" style={{ background: 'radial-gradient(900px 600px at 50% 0%, rgba(113,71,237,.22), transparent 60%)' }}>
        <div className="flex w-full max-w-[30rem] flex-col items-center gap-6 text-center">
          <LogoWithPlus />
          <span className="grid size-14 place-items-center rounded-full bg-accent-avocado-default text-[#0F1218]">
            <VIcon size={IconSize.Large} />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-balance font-bold typo-title2">{copy.title}</h1>
            <p className="text-pretty typo-callout text-text-tertiary">{copy.body}</p>
          </div>
          {briefing && (
            <div className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left">
              <span className="grid size-10 flex-none place-items-center rounded-12 bg-overlay-float-cabbage text-accent-cabbage-default">
                <BriefIcon secondary size={IconSize.Medium} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <b className="typo-callout">Set your Presidential Briefing</b>
                <span className="typo-footnote text-text-tertiary">Pick when your brief arrives.</span>
              </span>
            </div>
          )}
          <div className="flex w-full flex-col gap-2">
            <button type="button" className="h-12 rounded-12 bg-[#fff] font-bold typo-callout text-[#0F1218]">{copy.primary}</button>
            {kind !== 'gift' && <button type="button" className="h-10 rounded-12 typo-callout text-text-tertiary hover:text-text-primary">Go to my feed</button>}
          </div>
        </div>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};
