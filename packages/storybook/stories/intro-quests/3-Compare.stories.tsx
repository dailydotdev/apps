import type { ComponentType } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Scenario } from './sim';
import { SimProvider, scenarioLabels } from './sim';
import { Stage } from './kit';
import { CurrentModal } from './CurrentModal';
import { VariantList } from './VariantList';
import { VariantCards } from './VariantCards';
import { VariantFocus } from './VariantFocus';
import { VariantJourney } from './VariantJourney';
import { VariantPopover } from './VariantPopover';
import { StampCard } from './round2/StampCard';
import { StrengthMeter } from './round2/StrengthMeter';
import { Chapters } from './round2/Chapters';
import { VisualGuide } from './round2/VisualGuide';
import { PatchyChat } from './round2/PatchyChat';
import { MergeChecks } from './round2/MergeChecks';
import { TerminalInit } from './round2/TerminalInit';
import { FloatingDock } from './round2/FloatingDock';
import { SwipeDeck } from './round2/SwipeDeck';
import { Assembled } from './round2/Assembled';

interface Args {
  scenario: Scenario;
}

const meta: Meta<Args> = {
  title: 'Intro Quests/3. Side by side',
  parameters: { layout: 'fullscreen' },
  args: { scenario: 'midway' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(scenarioLabels),
      labels: scenarioLabels,
    },
  },
};

export default meta;

type Column = {
  label: string;
  Component: ComponentType<{ device?: 'desktop' | 'mobile' }>;
  placement?: 'center' | 'dock';
};

const columns: Column[] = [
  { label: 'Today', Component: CurrentModal },
  { label: 'A · Action list', Component: VariantList },
  { label: 'B · Action cards', Component: VariantCards },
  { label: 'C · One step at a time', Component: VariantFocus },
  { label: 'D · Journey trail', Component: VariantJourney },
  { label: 'E · Grouped (sheet on mobile)', Component: VariantPopover },
];

const roundTwo: Column[] = [
  { label: '1 · Stamp card', Component: StampCard },
  { label: '2 · Setup strength', Component: StrengthMeter },
  { label: '3 · Two chapters', Component: Chapters },
  { label: '4 · Show, then do', Component: VisualGuide },
  { label: '5 · Patchy chat', Component: PatchyChat },
  { label: '6 · Merge your setup', Component: MergeChecks },
  { label: '7 · npx daily init', Component: TerminalInit },
  { label: '8 · Floating dock', Component: FloatingDock, placement: 'dock' },
  { label: '9 · The deck', Component: SwipeDeck },
  { label: '10 · Assembled', Component: Assembled },
];

const Phones = ({
  title,
  items,
  scenario,
}: {
  title: string;
  items: Column[];
  scenario: Scenario;
}) => (
  <div className="min-h-screen bg-background-default px-6 py-8 text-text-primary">
    <h1 className="mb-1 font-bold typo-title2">{title}</h1>
    <p className="mb-6 text-text-tertiary typo-callout">
      Each phone runs its own copy of the scenario, so you can click through
      them independently. On mobile every popup becomes a bottom sheet.
    </p>
    <div className="flex gap-6 overflow-x-auto pb-6">
      {items.map(({ label, Component, placement }) => (
        <div key={label} className="flex shrink-0 flex-col gap-3">
          <p className="font-bold text-text-secondary typo-callout">{label}</p>
          <SimProvider scenario={scenario}>
            <Stage device="mobile" placement={placement}>
              <Component device="mobile" />
            </Stage>
          </SimProvider>
        </div>
      ))}
    </div>
  </div>
);

export const OnMobile: StoryObj<Args> = {
  name: 'Round one on a phone',
  render: ({ scenario }) => (
    <Phones title="Round one on a phone" items={columns} scenario={scenario} />
  ),
};

export const RoundTwoOnMobile: StoryObj<Args> = {
  name: 'Ten concepts on a phone',
  render: ({ scenario }) => (
    <Phones
      title="Ten concepts on a phone"
      items={roundTwo}
      scenario={scenario}
    />
  ),
};
