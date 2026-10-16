import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from './docs/Frame';

/* The design at every breakpoint the app defines (packages/shared/tailwind.config.ts):
   mobileL 420 · tablet 656 · laptop 1020 · laptopL 1360 · desktop 1976.
   Each frame is the real "1. The design" story in an iframe at that width,
   so the media queries are the real ones. */

const meta: Meta = {
  title: 'Plus Checkout/2. Breakpoints',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const PAGE = 'plus-checkout-1-the-design--page';

const sizes = [
  { w: 375, h: 812, label: 'Phone · 375', bp: '< mobileL', note: 'Step 1 of 2: the plan. Cycle buttons stacked, features in one column, sticky “Continue · .99”.' },
  { w: 420, h: 860, label: 'Large phone · 420', bp: 'mobileL', note: 'Same as phone; more air.' },
  { w: 768, h: 1024, label: 'Tablet · 768', bp: 'tablet (656+)', note: 'One column, centred at 576px. Cycle buttons side by side, features in two columns.' },
  { w: 1024, h: 768, label: 'Small laptop · 1024', bp: 'laptop (1020+)', note: 'Split screen. Cycle buttons wrap if the half is too narrow. Scrolls a little: the one-screen target is ≥ 1280×800.' },
  { w: 1280, h: 800, label: 'Laptop · 1280', bp: 'laptop', note: 'The reference: everything on one screen, no scroll.' },
  { w: 1440, h: 900, label: 'Laptop · 1440', bp: 'laptopL (1360+)', note: 'More side padding; content columns hug the centre line.' },
  { w: 1920, h: 1080, label: 'Desktop · 1920', bp: 'laptopXL (1668+)', note: 'Halves stay full-bleed; content capped at 544 + 512px so lines don’t stretch.' },
  { w: 2560, h: 1440, label: 'Large · 2560', bp: 'desktop (1976+)', note: 'Same caps; the page reads like 1280 with more margin.' },
];

const Page = () => {
  const [args, setArgs] = useState<Record<string, string>>({});
  const presets: [string, Record<string, string>][] = [
    ['Annual', {}],
    ['Monthly', { cycle: 'monthly' }],
    ['Team', { purchase: 'team' }],
    ['Signed out', { viewer: 'anonymous' }],
    ['iOS app', { platform: 'ios' }],
  ];
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-1">
          <h1 className="font-bold typo-title1">Breakpoints</h1>
          <p className="typo-callout text-text-tertiary">
            The same checkout from 375 to 2560. Below 1020px it is two steps (plan → payment); the last row shows both on a phone.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-12 border border-border-subtlest-tertiary p-1">
          {presets.map(([l, a]) => (
            <button key={l} type="button" onClick={() => setArgs(a)} className={classNames('rounded-8 px-3 py-1 typo-footnote', JSON.stringify(a) === JSON.stringify(args) ? 'bg-surface-hover font-bold' : 'text-text-tertiary')}>
              {l}
            </button>
          ))}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">Phones and tablet · one column</h2>
        <div className="flex flex-wrap items-start gap-5">
          {sizes.slice(0, 3).map((s) => (
            <div key={s.w} className="flex flex-col gap-1" style={{ width: Math.min(s.w, 380) }}>
              <Frame key={JSON.stringify(args)} id={PAGE} args={args} width={s.w} height={s.h} label={s.label} note={s.bp} />
              <p className="typo-caption1 text-text-tertiary">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">Laptop and up · split screen</h2>
        <div className="grid gap-6 laptop:grid-cols-2">
          {sizes.slice(3).map((s) => (
            <div key={s.w} className="flex flex-col gap-1">
              <Frame key={JSON.stringify(args)} id={PAGE} args={args} width={s.w} height={s.h} label={s.label} note={s.bp} />
              <p className="typo-caption1 text-text-tertiary">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">Phone · whole page</h2>
        <div className="flex flex-wrap items-start gap-5">
          {[['Step 1 · plan', {}], ['Step 2 · payment', { mobileStep: 'payment' }], ['Team · step 1', { purchase: 'team' }], ['iOS app (one step)', { platform: 'ios' }]].map(([l, a]) => (
            <div key={l as string} style={{ width: 300 }}>
              <Frame id={PAGE} args={a as Record<string, string>} width={375} height={1900} label={`${l} · 375, full length`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const All: StoryObj = { name: 'All breakpoints', render: () => <Page /> };
