import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PrototypeArgs } from './checkout/Prototype';
import { Prototype } from './checkout/Prototype';
import { caseId } from './cases';
import { Frame } from './docs/Frame';

const meta: Meta<PrototypeArgs> = {
  title: 'Plus Checkout/4. Flow',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<PrototypeArgs>;

type Step = { title: string; route: string; sees: string; code: string; log: string; frame?: string; frameArgs?: Record<string, string> };

const steps: Step[] = [
  {
    title: '1 · Entry',
    route: 'any upgrade link → /plus?ref=<target>',
    sees: 'Unchanged entry points (RemoveAd, BriefPlusUpgradeCTA, FeedSettings, ClickbaitShield, BookmarkFoldersStrip, Header, ProfileDropdown…). New: each appends ?ref= so the page leads with what was clicked.',
    code: 'plusUrl + `?ref=${TargetId}`; the page maps ref → entryCopy',
    log: 'UpgradeSubscription { target_id } (existing, unchanged)',
  },
  {
    title: '2 · Sign in (only if signed out)',
    route: '/plus — same page',
    sees: 'The plan half with prices; sign-in in place of the frame. After auth the same URL reloads with the frame. Today: redirect to /onboarding and /plus is lost.',
    code: 'PlusLayout: drop the onboarding redirect for this arm; showLogin({ trigger: AuthTriggers.Plus })',
    log: 'existing auth events',
    frame: 'SignedOut',
  },
  {
    title: '3 · Choose and pay',
    route: '/plus — desktop one page; phones two steps on the same route (today: a separate /plus/payment)',
    sees: 'Annual preselected. Switching the cycle updates the price, the bill and the frame without a reload. Phones: step 1 sticky “Continue” → step 2 (summary + Paddle); Back returns.',
    code: 'openCheckout({ priceId }) → Paddle.Checkout.open / updateItems',
    log: 'SelectBillingCycle · InitiateCheckout (checkout.loaded) · SelectCheckoutPayment',
    frame: 'FromAd',
  },
  {
    title: '4 · Processing',
    route: '/plus',
    sees: 'Paddle’s button spins; our cycle buttons lock so the price can’t change under the charge.',
    code: 'checkout.payment.initiated → phase = processing',
    log: 'InitiatePayment',
    frame: 'Processing',
  },
  {
    title: '4a · Bank verification',
    route: '/plus',
    sees: 'Cards that need 3-D Secure: the bank’s step runs inside Paddle (popup or in-frame). Our side stays locked.',
    code: 'still phase = processing (Paddle owns the challenge)',
    log: '—',
    frame: 'BankVerification',
  },
  {
    title: '4b · Declined → retry',
    route: '/plus',
    sees: 'Paddle’s error in the frame. Plan half untouched; any change clears the error.',
    code: 'checkout.payment.failed → phase = declined',
    log: 'ErrorPayment',
    frame: 'Declined',
  },
  {
    title: '4c · Payment form didn’t load',
    route: '/plus',
    sees: 'No checkout.loaded after 10s — usually an ad/privacy blocker stopping paddle.js. We explain and offer Try again. Today: an empty box.',
    code: 'timer after Checkout.open → phase = blocked; Try again re-opens',
    log: 'ErrorCheckout (add reason: "not loaded")',
    frame: 'Blocked',
  },
  {
    title: '5 · Success',
    route: '/plus/success',
    sees: 'One next action per purchase: personal → set the Briefing; team → invite members; gift → nothing (recipient gets a pop-up next visit). Today: one generic “Payment successful”. All of them: 9. After payment.',
    code: 'checkout.completed → router.push(plusSuccessUrl) (unchanged)',
    log: 'CompleteCheckout (unchanged payload)',
    frame: 'Success',
  },
  {
    title: '6 · Emails',
    route: 'inbox',
    sees: 'From Paddle: subscription confirmation + receipt; later the renewal reminder (EU, UK, 11 US states, annual), failed-payment and cancel/refund emails. Gift recipient: in-app pop-up. Full list: 9. After payment › Emails.',
    code: 'Paddle (merchant of record); nothing to build',
    log: '—',
  },
];

const Lane = ({ title, chips, tone }: { title: string; chips: string[]; tone: 'old' | 'new' }) => (
  <div className="flex flex-col gap-2">
    <span className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">{title}</span>
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c, i) => (
        <React.Fragment key={c}>
          {i > 0 && <span className="text-text-quaternary">→</span>}
          <span className={classNames('rounded-8 border px-2.5 py-1 typo-footnote', tone === 'new' ? 'border-accent-cabbage-default bg-overlay-float-cabbage text-text-primary' : 'border-border-subtlest-tertiary text-text-tertiary')}>{c}</span>
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Cell = ({ label, children }: { label: string; children: ReactNode }) => (
  <p className="typo-caption1"><b className="text-text-secondary">{label}</b> <span className="text-text-tertiary">{children}</span></p>
);

const Map = () => (
  <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
    <header className="flex max-w-3xl flex-col gap-1">
      <h1 className="font-bold typo-title1">The flow</h1>
      <p className="typo-callout text-text-tertiary">
        Desktop: one page from entry to payment. Phones: the same route in two steps, plan then payment. The payment form appears once. Each frame below is the live use-case story.
      </p>
    </header>

    <section className="grid gap-4 rounded-16 border border-border-subtlest-tertiary p-5 laptop:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">Today</h2>
        <Lane tone="old" title="Desktop" chips={['Entry', '/plus (plan + Paddle)', '/plus/success']} />
        <Lane tone="old" title="Phone / tablet" chips={['Entry', '/plus (plan)', 'Continue', '/plus/payment (Paddle)', '/plus/success']} />
        <Lane tone="old" title="Signed out" chips={['Entry', '/onboarding', '… /plus is lost']} />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">New</h2>
        <Lane tone="new" title="Desktop" chips={['Entry ?ref=', '/plus (plan + Paddle)', '/plus/success']} />
        <Lane tone="new" title="Phone / tablet" chips={['Entry ?ref=', '/plus step 1 (plan)', 'Continue', '/plus step 2 (summary + Paddle)', '/plus/success']} />
        <Lane tone="new" title="Signed out" chips={['Entry ?ref=', '/plus (plan)', 'sign in', '/plus (Paddle)', '/plus/success']} />
        <Lane tone="new" title="iOS app" chips={['Entry', '/plus (plan + Subscribe)', 'Apple sheet', '/plus/success']} />
      </div>
    </section>

    {steps.map((s) => (
      <section key={s.title} className="grid gap-5 border-t border-border-subtlest-tertiary pt-6 laptop:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold typo-title3">{s.title}</h2>
          <p className="font-mono typo-caption1 text-text-quaternary">{s.route}</p>
          <p className="typo-footnote text-text-secondary">{s.sees}</p>
          <Cell label="Code">{s.code}</Cell>
          <Cell label="Logged">{s.log}</Cell>
        </div>
        {s.frame ? (
          <div className="grid items-start gap-4 tablet:grid-cols-[1fr_12rem]">
            <Frame id={caseId(s.frame)} width={1280} height={800} label="Desktop 1280" />
            <Frame id={caseId(s.frame)} width={375} height={812} label="Phone 375" />
          </div>
        ) : (
          <div className="rounded-12 border border-dashed border-border-subtlest-tertiary p-5 typo-footnote text-text-tertiary">
            {s.title.startsWith('6') ? 'Sent by Paddle, not drawn here — see 9. After payment › Emails for every email, when it’s sent and which line on our page depends on it.' : 'Entry points don’t change visually. The list of components that link to /plus, and the ref each should pass, is in IMPLEMENTATION.md → “Entry points”.'}
          </div>
        )}
      </section>
    ))}
  </div>
);

export const FlowMap: Story = { name: 'Flow map', render: () => <Map /> };

export const ClickThrough: Story = {
  name: 'Click-through (load → pay → decline → retry → success)',
  args: { phase: 'loading', simulateLoad: true, decline: true, entry: 'ads' },
  render: (args) => <Prototype {...args} />,
};
