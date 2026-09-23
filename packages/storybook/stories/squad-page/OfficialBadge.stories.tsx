import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { KitStyles } from './kit';
import {
  badgeVariants,
  badgeVariantsRoundThree,
  badgeVariantsRoundTwo,
} from './badges';

const meta: Meta = {
  title: 'Squad Page/4. Official badge',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

/** Home's widget column, so every badge is judged at the width it ships at. */
const ColumnFrame = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-80 shrink-0 flex-col gap-4">
    {children}
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <span className="font-bold text-text-primary typo-callout">Rules</span>
      {['Stay on topic', 'Search before you ask', 'Be useful'].map(
        (rule, index) => (
          <span
            key={rule}
            className="flex items-center gap-3 text-text-primary typo-footnote"
          >
            <span className="sq-nums w-4 text-text-quaternary typo-caption1">
              {index + 1}
            </span>
            {rule}
          </span>
        ),
      )}
    </div>
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
      <KitStyles />
      <div className="mx-auto flex w-full max-w-[82rem] flex-col gap-12">
        <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
          <Eyebrow>Squad page · The official badge</Eyebrow>
          <h1 className="max-w-[24ch] font-bold typo-giga3">
            One row that says: this is the official one.
          </h1>
          <p className="max-w-[76ch] text-text-secondary typo-body">
            Eight ways to mark a verified company page at the top of Home&apos;s
            widget column. Same seal, same four words, different weight. The
            references are the marks people already trust: X&apos;s seal,
            GitHub&apos;s verified-organisation pill, Apple&apos;s restraint, a
            foil sticker, a passport stamp, a laurel, Discord&apos;s server
            badge, an iOS widget. Each is shown above the Rules card, at the
            column&apos;s width.
          </p>
        </header>
        <div className="grid grid-cols-4 gap-x-8 gap-y-12">
          {badgeVariants.map((variant, index) => (
            <div key={variant.id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Eyebrow>
                  0{index + 1} · {variant.title}
                </Eyebrow>
                <span className="text-text-tertiary typo-footnote">
                  From {variant.from}
                </span>
                <span className="max-w-[36ch] text-text-secondary typo-callout">
                  {variant.note}
                </span>
              </div>
              <ColumnFrame>{variant.render()}</ColumnFrame>
            </div>
          ))}
        </div>
        <header className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-10">
          <Eyebrow>Round two · Between Foil and Glass</Eyebrow>
          <h2 className="font-bold typo-title1">Ten more, in gold and glass</h2>
          <p className="max-w-[76ch] text-text-secondary typo-body">
            Light, warmth, depth. The references this time are the marks a
            developer meets outside the big networks: Docker&apos;s Verified
            Publisher, the VS Code marketplace tick, Hugging Face&apos;s
            verified organisation, Stack Overflow Collectives, Twitch and
            Discord partners, Spotify&apos;s Verified Artist, Airbnb&apos;s
            Superhost, an Apple Developer certificate; and the physical ones, a
            hallmark, a wax seal, a holographic sticker, a swing tag. The copy
            moves too: page, partner, publisher, a serial, the people.
          </p>
        </header>
        <div className="grid grid-cols-4 gap-x-8 gap-y-12">
          {badgeVariantsRoundTwo.map((variant, index) => (
            <div key={variant.id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Eyebrow>
                  {String(index + 9).padStart(2, '0')} · {variant.title}
                </Eyebrow>
                <span className="text-text-tertiary typo-footnote">
                  From {variant.from}
                </span>
                <span className="max-w-[36ch] text-text-secondary typo-callout">
                  {variant.note}
                </span>
              </div>
              <ColumnFrame>{variant.render()}</ColumnFrame>
            </div>
          ))}
        </div>
        <header className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-10">
          <Eyebrow>
            Round three · Foil glass and Holographic, in brand purple
          </Eyebrow>
          <h2 className="font-bold typo-title1">Ten in cabbage</h2>
          <p className="max-w-[76ch] text-text-secondary typo-body">
            The same idea held ten ways: light under glass, one edge, the seal,
            four words. What moves is where the light sits (a haze, two orbs, a
            sheen, a spotlight), how the edge is drawn (a hairline, a gradient
            frame, none), and the second line, if there is one: the publisher,
            the serial, the company&apos;s own domain.
          </p>
        </header>
        <div className="grid grid-cols-4 gap-x-8 gap-y-12">
          {badgeVariantsRoundThree.map((variant, index) => (
            <div key={variant.id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Eyebrow>
                  {index + 19} · {variant.title}
                </Eyebrow>
                <span className="text-text-tertiary typo-footnote">
                  From {variant.from}
                </span>
                <span className="max-w-[36ch] text-text-secondary typo-callout">
                  {variant.note}
                </span>
              </div>
              <ColumnFrame>{variant.render()}</ColumnFrame>
            </div>
          ))}
        </div>
        <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-8">
          <Eyebrow>Recommendation</Eyebrow>
          <p className="max-w-[76ch] text-text-secondary typo-body">
            Hairline or Foil. Hairline is the badge a luxury brand would choose:
            nothing to look at except the seal and the words, and it gets
            quieter the more the page around it is polished. Foil is the badge a
            customer would choose: gold, warm, unmistakably an award, and the
            only one that does not use the brand purple, so it reads as
            something conferred on the company rather than a daily.dev feature.
            Glow is the safe middle. Strip is too loud next to Join.
          </p>
        </section>
      </div>
    </div>
  ),
};
