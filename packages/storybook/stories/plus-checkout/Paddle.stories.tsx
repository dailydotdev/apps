import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Browser } from './checkout/PaddleFrameMock';
import { PaddleFrameMock } from './checkout/PaddleFrameMock';
import { Markdown } from './docs/Markdown';
import paddle from './docs/PADDLE.md?raw';

const meta: Meta = {
  title: 'Plus Checkout/5. Paddle',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Page = () => {
  const [browser, setBrowser] = useState<Browser>('chrome');
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 pb-24 text-text-primary">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold typo-title1">The payment half is Paddle’s frame</h1>
            <p className="max-w-3xl typo-callout text-text-tertiary">
              Same fields and order as production today; only the dashboard styling and three open() settings change. Left: production now (screenshot). Middle: production’s frame as drawn here. Right: the new styling.
            </p>
          </div>
          <div className="flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1">
            {(['chrome', 'safari', 'other'] as Browser[]).map((b) => (
              <button key={b} type="button" onClick={() => setBrowser(b)} className={classNames('rounded-8 px-3 py-1 typo-footnote', browser === b ? 'bg-surface-hover font-bold' : 'text-text-tertiary')}>
                {b === 'chrome' ? 'Chrome (Google Pay)' : b === 'safari' ? 'Safari (Apple Pay)' : 'No wallet'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid items-start gap-5 laptop:grid-cols-3">
          <figure className="flex flex-col gap-1.5">
            <img src="/plus-checkout/today.jpg" alt="Production /plus page, Oct 2026" className="w-full rounded-12 border border-border-subtlest-tertiary" />
            <figcaption className="typo-caption1 text-text-tertiary"><b className="text-text-primary">Production, Oct 2026.</b> The frame on the right is Paddle’s real one-page checkout.</figcaption>
          </figure>
          <figure className="flex flex-col gap-1.5">
            <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
              <PaddleFrameMock look="production" browser={browser} vatField discountField />
            </div>
            <figcaption className="typo-caption1 text-text-tertiary"><b className="text-text-primary">Today’s settings.</b> Pink button, green selection, VAT + discount links, save-card box.</figcaption>
          </figure>
          <figure className="flex flex-col gap-1.5">
            <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
              <PaddleFrameMock browser={browser} />
            </div>
            <figcaption className="typo-caption1 text-text-tertiary"><b className="text-text-primary">New settings.</b> White button, purple selection, transparent frame; the three extras off for personal.</figcaption>
          </figure>
        </div>
      </section>
      <Markdown source={paddle} />
    </div>
  );
};

export const Frame: StoryObj = { name: 'What Paddle allows', render: () => <Page /> };
