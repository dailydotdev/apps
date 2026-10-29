import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { linkTo } from '@storybook/addon-links';
import {
  getTagBarProgress,
  getTagGuidance,
  getTagHeadline,
} from './TagProgress';

const FINAL_TITLE = 'Components/Onboarding/Feed preview/Final';

const TIERS = [
  { label: '0 to 4 tags', sample: 3 },
  { label: '5 to 9 tags', sample: 5 },
  { label: '10 to 19 tags', sample: 10 },
  { label: '20 or more', sample: 20 },
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <h2 className="font-bold uppercase text-text-quaternary typo-caption1">
      {title}
    </h2>
    {children}
  </section>
);

const List = ({ items }: { items: string[] }): ReactElement => (
  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-callout">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export const FinalOverview = (): ReactElement => (
  <div className="min-h-dvh bg-background-default px-6 py-12 text-text-primary">
    <div className="mx-auto flex max-w-[52rem] flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="font-bold text-brand-default typo-callout">
          Onboarding · Pick tags step · Final
        </span>
        <h1 className="font-bold typo-mega3">More tags, a smarter feed</h1>
        <p className="text-text-secondary typo-title3">
          A shiny progress bar that reacts to every pick makes choosing tags
          feel rewarding. More tags give better recommendations from day one,
          and better recommendations bring people back.
        </p>
        <button
          className="self-start font-bold text-brand-default typo-callout"
          onClick={linkTo(FINAL_TITLE, 'The step')}
          type="button"
        >
          Try the step
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
        <Section title="What changes">
          <List
            items={[
              'The headline becomes a progress header that types in a new line at each milestone.',
              'A flowing bar under it fills with every tag: 5 tags fill half, 10 three quarters, 20 all of it.',
              'Each milestone fires a burst, and the line under the bar says how many more tags to pick.',
            ]}
          />
        </Section>
        <Section title="What stays the same">
          <List
            items={[
              'The feed preview: same button, same feed, same behavior.',
              'Continue still unlocks at 5 tags.',
              'Search, the tag list and the rest of the step.',
            ]}
          />
        </Section>
      </div>

      <Section title="Milestones">
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
          {TIERS.map(({ label, sample }) => (
            <div
              key={label}
              className="grid grid-cols-1 gap-1 p-4 tablet:grid-cols-[9rem_1fr_1fr_6rem] tablet:items-center tablet:gap-4"
            >
              <span className="font-bold typo-callout">{label}</span>
              <span className="typo-callout">{getTagHeadline(sample)}</span>
              <span className="text-text-tertiary typo-footnote">
                {getTagGuidance(sample)}
              </span>
              <span className="text-text-tertiary tabular-nums typo-footnote tablet:text-right">
                {Math.round(getTagBarProgress(sample))}% at {sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How we'd know">
        <List
          items={[
            'Primary: average tags picked when the step completes, and the share of users who pick 10 or more.',
            'Then: day 1 and day 7 to 13 return for everyone who reaches the step.',
            'Guardrail: completion of the tag step stays where it is today.',
          ]}
        />
      </Section>

      <Section title="Shipping">
        <List
          items={[
            'Behind a new experiment flag, off by default, on the signup onboarding only (not the paid funnel).',
            "The bar, headline and burst are Tomer's, from the swipe onboarding (#5838), tuned for the tag step.",
          ]}
        />
      </Section>
    </div>
  </div>
);
