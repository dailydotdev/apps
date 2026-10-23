import type { ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TodayDesktop as TodayDesktopPage, TodayMobile as TodayMobilePage } from './today';
import { Frame } from './docs/Frame';
import { Markdown } from './docs/Markdown';
import abTest from './docs/AB-TEST.md?raw';

/* Control vs variant. "Today" is production's page from production components
   (only the Paddle iframe is a mock, in today's dashboard styling). It stays
   in the code base for the whole experiment — it IS the control arm. */

const meta: Meta = {
  title: 'Plus Checkout/6. Before & after',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const NEW = 'plus-checkout-1-the-design--page';
const TODAY_D = 'plus-checkout-6-before-after--today-desktop';
const TODAY_M = 'plus-checkout-6-before-after--today-mobile';
const TODAY_M2 = 'plus-checkout-6-before-after--today-mobile-payment';

const Row = ({ title, children, diff }: { title: string; children: ReactNode; diff: string[] }) => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
    <h2 className="font-bold typo-title3">{title}</h2>
    {children}
    <ul className="grid list-disc gap-x-8 gap-y-1 pl-5 typo-footnote text-text-tertiary laptop:grid-cols-2">
      {diff.map((d) => <li key={d}>{d}</li>)}
    </ul>
  </section>
);

const Compare = () => (
  <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
    <header className="flex max-w-3xl flex-col gap-1">
      <h1 className="font-bold typo-title1">Before &amp; after</h1>
      <p className="typo-callout text-text-tertiary">
        Left: production today (the A/B control). Right: the new design (the variant). Both live.
      </p>
    </header>

    <Row
      title="Desktop · 1280×800"
      diff={[
        'Headline: “A real API for…” (the API-first copy, which lost its experiment) → “daily.dev without ads, with a daily brief.”',
        'Price: $7.49 inside a radio row → $7.49 large, struck $9.99, two explicit cycle buttons with the yearly total.',
        'Features: nine rows with ⓘ, API first in pink → ten rows in two columns, Briefing / Custom feeds / Ad-free first and bold.',
        'Bill: none (Paddle’s one line) → Due today + renewal date, tax note, refund link.',
        'Frame: pink button, green selection, VAT + discount + save-card → white button, purple selection, those three hidden for personal.',
        'Below the fold: reviews, API showcase, FAQ → none; the page ends at the bill and the refund note. (Keeping the FAQ below the fold is an open decision.)',
      ]}
    >
      <div className="grid gap-4 laptop:grid-cols-2">
        <Frame id={TODAY_D} width={1280} height={800} label="Today" note="production components" />
        <Frame id={NEW} width={1280} height={800} label="New" note="this folder" />
      </div>
    </Row>

    <Row
      title="Phone · 375×812"
      diff={[
        'Today: two pages — choose a cycle, tap Continue, then /plus/payment with the frame alone (the plan summary is gone on phones).',
        'New: still two steps (the common pattern), on one address with no reload: the plan with a sticky “Continue · .99”, then payment with a collapsed order summary (“Change” goes back). The phone’s Back button works between them.',
        'Team choice and seats survive on phones (today they are dropped by Continue).',
      ]}
    >
      <div className="flex flex-wrap items-start gap-5">
        <div className="w-[17rem]"><Frame id={TODAY_M} width={375} height={812} label="Today · step 1" /></div>
        <div className="w-[17rem]"><Frame id={TODAY_M2} width={375} height={812} label="Today · step 2 (/plus/payment)" /></div>
        <div className="w-[17rem]"><Frame id={NEW} width={375} height={812} label="New · step 1 (plan)" /></div>
        <div className="w-[17rem]"><Frame id={NEW} args={{ mobileStep: 'payment' }} width={375} height={812} label="New · step 2 (payment)" /></div>
        <div className="w-[17rem]"><Frame id={NEW} width={375} height={1900} label="New · full length" /></div>
      </div>
    </Row>

    <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
      <Markdown source={abTest} />
    </section>
  </div>
);

export const Side: Story = { name: '★ Compare + A/B plan', render: () => <Compare /> };
export const TodayDesktop: Story = { name: 'Today · desktop', render: () => <TodayDesktopPage /> };
export const TodayMobile: Story = { name: 'Today · mobile', render: () => <TodayMobilePage /> };
export const TodayMobilePayment: Story = { name: 'Today · mobile payment step', render: () => <TodayMobilePage step="payment" /> };
