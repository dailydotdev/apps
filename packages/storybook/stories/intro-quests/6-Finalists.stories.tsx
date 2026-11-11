import type { ComponentType, ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { Scenario } from './sim';
import { SimProvider, scenarioLabels } from './sim';
import { Stage } from './kit';
import { CardsFinal } from './finalists/CardsFinal';
import { ChecklistFinal } from './finalists/ChecklistFinal';
import { JourneyFinal } from './finalists/JourneyFinal';

interface Args {
  scenario: Scenario;
}

const meta: Meta<Args> = {
  title: 'Intro Quests/6. Finalists',
  parameters: { layout: 'fullscreen' },
  args: { scenario: 'fresh' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(scenarioLabels),
      labels: scenarioLabels,
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

interface Evidence {
  step: string;
  verdict: 'Keep' | 'Added' | 'Bonus' | 'Dropped';
  data: string;
}

interface FinalistInfo {
  number: number;
  name: string;
  thesis: string;
  keeps: string[];
  evidence?: Evidence[];
  Component: ComponentType<{ device?: 'desktop' | 'mobile' }>;
}

const sharedRules = [
  'One size: the desktop popup is as narrow and tall as the phone sheet',
  'Round one B header: green reward line, title, segmented bar',
  'One solid button, on the step you are on. Everything else is a small Float button',
  'Chips are our rounded rectangles, not circles',
];

const DualFrame = ({
  info,
  scenario,
}: {
  info: FinalistInfo;
  scenario: Scenario;
}): ReactElement => {
  const [run, setRun] = useState(0);
  const { Component } = info;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background-default px-6 py-8 text-text-primary tablet:px-10">
      <header className="mx-auto flex w-full max-w-[90rem] flex-col gap-3 laptop:flex-row laptop:items-end laptop:justify-between">
        <div className="flex max-w-[52rem] flex-col gap-1">
          <p className="font-bold text-text-tertiary typo-footnote">
            Finalist {info.number} · {scenarioLabels[scenario]}
          </p>
          <h1 className="font-bold typo-title2">{info.name}</h1>
          <p className="text-text-secondary typo-callout">{info.thesis}</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-text-tertiary typo-footnote">
            {info.keeps.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
          <p className="mt-1 text-text-quaternary typo-caption1">
            Shared by all three: {sharedRules.join('. ')}.
          </p>
        </div>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() => setRun((value) => value + 1)}
        >
          Reset scenario
        </Button>
      </header>
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 laptop:flex-row laptop:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-bold text-text-secondary typo-callout">Desktop</p>
          <SimProvider key={`d-${scenario}-${run}`} scenario={scenario}>
            <Stage device="desktop" height="52rem">
              <Component device="desktop" />
            </Stage>
          </SimProvider>
        </section>
        <section className="flex shrink-0 flex-col gap-2">
          <p className="font-bold text-text-secondary typo-callout">Mobile</p>
          <SimProvider key={`m-${scenario}-${run}`} scenario={scenario}>
            <Stage device="mobile">
              <Component device="mobile" />
            </Stage>
          </SimProvider>
        </section>
      </div>
      {info.evidence && (
        <section className="mx-auto flex w-full max-w-[90rem] flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold typo-title3">Why these steps</h2>
            <p className="max-w-[52rem] text-text-tertiary typo-footnote">
              From Dave’s Onboarding Return Drivers (55k registrants, May to
              August 2026, each day-0 action compared with similar users) and
              Feature Adoption Paths (what moves users up a frequency band),
              both shared in #product-chatter on 15 Oct. pp = percentage points.
              These are associations, except where a GrowthBook test is quoted.
            </p>
          </div>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full min-w-[48rem] text-left typo-footnote">
              <thead className="bg-background-subtle text-text-tertiary">
                <tr>
                  <th className="p-3 font-bold">Step</th>
                  <th className="p-3 font-bold">Call</th>
                  <th className="p-3 font-bold">What the data says</th>
                </tr>
              </thead>
              <tbody>
                {info.evidence.map((row) => (
                  <tr
                    key={row.step}
                    className="border-t border-border-subtlest-tertiary align-top"
                  >
                    <td className="p-3 font-bold text-text-primary">
                      {row.step}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          {
                            Keep: 'text-accent-avocado-default',
                            Added: 'text-accent-cabbage-default',
                            Bonus: 'text-text-tertiary',
                            Dropped: 'text-accent-ketchup-default',
                          }[row.verdict]
                        }
                      >
                        {row.verdict}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">{row.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

const finalist = (info: FinalistInfo): Story => ({
  name: `${info.number} · ${info.name}`,
  render: ({ scenario }) => <DualFrame info={info} scenario={scenario} />,
});

export const ActionCards = finalist({
  number: 1,
  name: 'Action cards',
  thesis:
    'Round one B’s card, made sharp. Every card is always open, so nobody has to guess it can be tapped: outline only, the reward big on the right, one full-width button at the foot. No pictures inside, only what the step needs. The step you are on gets the solid button.',
  keeps: [
    'B: the title, the progress bar, the card layout',
    'B: big full-width button, XP and Cores on the right',
    'A: cards without a background',
  ],
  Component: CardsFinal,
});

export const Checklist = finalist({
  number: 2,
  name: 'Checklist',
  thesis:
    'Concept 4’s list as it read on a phone, without the picture: dashed circles that fill green, the step you are on open with only what it needs and one button.',
  keeps: [
    'Concept 4: the list and the dashed circles',
    'B: the header and segmented progress bar',
  ],
  Component: ChecklistFinal,
});

export const Journey = finalist({
  number: 3,
  name: 'Journey trail',
  thesis:
    'Ordered by what brings new users back, from Dave’s feature map analysis: the extension first, then a first read, notifications right after it, a daily reminder, and a story to come back to. The brief stays as an optional bonus. Completing the profile is out of the journey.',
  keeps: [
    'D: the timeline, one by one, "You joined daily.dev" celebrated, their name in the title',
    'No progress bar in the header: the timeline already shows the steps',
    'Kept: install the extension, turn on notifications, generate the brief (as a bonus)',
    'Added: read 3 posts, set a daily reminder, follow a developing story',
    'Dropped: complete your profile, the two API steps',
  ],
  evidence: [
    {
      step: '1 · Install the extension',
      verdict: 'Keep',
      data: 'The strongest lever by far. Day-0 extension use: +24pp on coming back within 2 weeks, and 35% become frequent against 2% on desktop web. Starting to use it moves low users up a band +14pp. Both GrowthBook install tests won. Desktop Chrome/Edge only.',
    },
    {
      step: '2 · Read 3 posts',
      verdict: 'Added',
      data: 'Opening 3+ posts on day 0: +5.9pp return and +1.1pp on becoming frequent, holding even when overall day-0 activity is fixed. 3+ posts in week 1: 54–56% D7 against 8–16%. 56% of front-door signups never open a post. Read in place, not in the modal (the modal is negative).',
    },
    {
      step: '3 · Turn on notifications',
      verdict: 'Keep',
      data: 'Enabling notifications: +8.7pp return, the biggest single day-0 action. It brings people back rather than building habit. Dave’s advice is to ask at the first read, not during onboarding, which is why it now follows step 2.',
    },
    {
      step: '4 · Set a daily reminder',
      verdict: 'Added',
      data: 'Scheduling a reading reminder: +2.7pp return and one of the few actions positive for becoming frequent. The only re-engagement lever with causal support (mobile scheduling test +5% active days). The prompt is mobile-only today; Dave recommends desktop with a default time, which the picker does.',
    },
    {
      step: '5 · Follow a developing story',
      verdict: 'Added',
      data: 'Collections are the strongest feature-level lever for low-frequency users: +6.8pp chance of moving up a band, more than twice a typical feature. Dave recommends promoting the collection subscribe bell so an update to the story brings them back.',
    },
    {
      step: '6 · Generate your first brief',
      verdict: 'Bonus',
      data: 'Weak. Seeing the daily brief on day 0: +2.2pp return. Adopting the daily briefing in weeks 1–2: +0.03 active days a week and +3.5pp moving up a band, neither distinguishable from zero. Harmless and free, so it stays last and optional.',
    },
    {
      step: 'Complete your profile',
      verdict: 'Dropped',
      data: 'Negative for new users. Updating the profile on day 0: −2.4pp return and −2.6pp active in weeks 4–7. Uploading a CV: −1.8pp. Profile and CV adoption show no lift. It stays in the other two finalists only if we want it for reasons other than retention.',
    },
    {
      step: 'API key and Hello, API',
      verdict: 'Dropped',
      data: 'No retention signal in either analysis. Kept for builders in the other finalists.',
    },
  ],
  Component: JourneyFinal,
});
