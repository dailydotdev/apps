import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Scenario } from './sim';
import { SimProvider, scenarioLabels } from './sim';
import { Stage } from './kit';
import { CurrentModal } from './CurrentModal';

interface Args {
  scenario: Scenario;
  device: 'desktop' | 'mobile';
}

const meta: Meta<Args> = {
  title: 'Intro Quests/1. Today',
  parameters: { layout: 'fullscreen' },
  args: { scenario: 'fresh', device: 'desktop' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(scenarioLabels),
      labels: scenarioLabels,
    },
    device: { control: 'inline-radio', options: ['desktop', 'mobile'] },
  },
};

export default meta;

export const Today: StoryObj<Args> = {
  name: 'Production popup',
  render: ({ scenario, device }) => (
    <div className="flex min-h-screen flex-col gap-5 bg-background-default px-6 py-8 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-5">
        <header className="flex max-w-[44rem] flex-col gap-1">
          <p className="font-bold text-text-tertiary typo-footnote">
            Baseline · {scenarioLabels[scenario]}
          </p>
          <h1 className="font-bold typo-title2">
            IntroQuestModal as it ships today
          </h1>
          <p className="text-text-secondary typo-callout">
            Built from the real QuestCard. The only way to act is the small
            arrow next to each title, and every arrow leaves the popup.
          </p>
        </header>
        <SimProvider key={scenario} scenario={scenario}>
          <Stage device={device}>
            <CurrentModal device={device} />
          </Stage>
        </SimProvider>
      </div>
    </div>
  ),
};
