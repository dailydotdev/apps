import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TodaySuccess } from './today';
import { caseId } from './cases';
import { Frame } from './docs/Frame';
import { Markdown } from './docs/Markdown';
import emails from './docs/EMAILS.md?raw';

/* Everything after checkout.completed: the thank-you page per purchase type,
   production's page today, and the emails/messages that follow. */

const meta: Meta = {
  title: 'Plus Checkout/9. After payment',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const pages = [
  { id: caseId('Success'), name: 'Personal', note: 'Next: set the Briefing time' },
  { id: caseId('TeamSuccess'), name: 'Team', note: 'Next: invite your team' },
  { id: caseId('GiftSuccess'), name: 'Gift sent', note: 'Nothing to do; recipient sees a pop-up' },
  { id: caseId('IosSuccess'), name: 'iOS (StoreKit)', note: 'Apple sends the receipt' },
];

const Overview = () => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6 text-text-primary">
    <header className="flex max-w-3xl flex-col gap-1.5">
      <h1 className="font-bold typo-title1">After payment</h1>
      <p className="typo-callout text-text-tertiary">
        Today every purchase lands on the same “Payment successful”. The new page gives each purchase one next step and only promises emails that really arrive.
      </p>
    </header>

    <section className="flex flex-col gap-3">
      <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">Today (production)</h2>
      <div className="grid items-start gap-4 tablet:grid-cols-[1fr_12rem]">
        <Frame id="plus-checkout-9-after-payment--today" width={1280} height={800} label="Desktop 1280" />
        <Frame id="plus-checkout-9-after-payment--today" width={375} height={812} label="Phone 375" />
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">New · desktop</h2>
      <div className="grid gap-4 laptop:grid-cols-2">
        {pages.map((p) => <Frame key={p.id} id={p.id} width={1280} height={800} label={p.name} note={p.note} />)}
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">New · phone</h2>
      <div className="flex flex-wrap items-start gap-5">
        {pages.map((p) => (
          <div key={p.id} className="w-[14rem]"><Frame id={p.id} width={375} height={812} label={p.name} /></div>
        ))}
      </div>
    </section>

    <section className="flex max-w-5xl flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
      <Markdown source={emails} />
    </section>
  </div>
);

export const All: Story = { name: '★ Thank-you pages + emails', render: () => <Overview /> };
export const Today: Story = { name: 'Today (production)', render: () => <TodaySuccess /> };
export const Emails: Story = {
  name: 'Emails and messages',
  render: () => (
    <div className="mx-auto max-w-5xl p-6 pb-24 text-text-primary">
      <Markdown source={emails} />
    </div>
  ),
};
